import {
  useState,

  FormEvent,
  memo,
} from "react";
import axios from "axios";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import Cookies from "js-cookie";
import { useAuth } from "../hooks/useAuth";
import { MapPin, Tags, X, Building2, DollarSign, BrainCircuit, ArrowLeft, ArrowRight, FileUp } from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";

// --- Utility Components (Kept for styling) ---

const Tag = memo(({ text, onRemove }: { text: string; onRemove: () => void; }) => (
    <motion.div layout initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.2 }} className="flex items-center justify-center bg-indigo-100 text-indigo-800 text-sm font-medium pl-3 pr-2 py-1.5 rounded-full mr-2 mb-2">
        <span>{text}</span>
        <button onClick={onRemove} className="ml-2 -mr-1 flex-shrink-0 p-0.5 rounded-full inline-flex items-center justify-center text-indigo-500 hover:bg-indigo-200 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label={`Remove ${text}`}>
            <X size={14} />
        </button>
    </motion.div>
));
Tag.displayName = "Tag";

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">{props.label}</label>
        <input {...props} className="block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:bg-slate-200 disabled:cursor-not-allowed" />
    </div>
);

const ChargeInputGroup = ({ label, variableValue, onVariableChange, fixedValue, onFixedChange }: { label: string; variableValue: string; onVariableChange: (e: React.ChangeEvent<HTMLInputElement>) => void; fixedValue: string; onFixedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;}) => (
    <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-200">
        <h4 className="font-semibold text-slate-700 mb-2">{label}</h4>
        <div className="grid grid-cols-2 gap-3">
            <InputField label="Variable (%)" type="number" min="0" placeholder="e.g., 2.5" value={variableValue} onChange={onVariableChange} />
            <InputField label="Fixed (₹)" type="number" min="0" placeholder="e.g., 50" value={fixedValue} onChange={onFixedChange} />
        </div>
    </div>
);
const FixedChargeInput = ({ label, value, onChange }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) => (
    <InputField label={`${label} (₹)`} type="number" min="0" placeholder="e.g., 100" value={value} onChange={onChange} />
);

const StepIndicator = memo(({ currentStep }: { currentStep: number }) => (
    <nav aria-label="Progress">
        <ol role="list" className="flex items-center">
            {[{ name: 'Details' }, { name: 'Surcharges' }, { name: 'Matrix' }].map((step, stepIdx) => (
                <li key={step.name} className={`relative ${stepIdx !== 2 ? 'pr-8 sm:pr-20' : ''}`}>
                    {stepIdx < currentStep ? ( // Completed
                        <><div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="h-0.5 w-full bg-indigo-600" /></div><div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600"><CheckIcon className="h-5 w-5 text-white" aria-hidden="true" /><span className="sr-only">{step.name}</span></div></>
                    ) : stepIdx === currentStep ? ( // Current
                        <><div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="h-0.5 w-full bg-gray-200" /></div><div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white" aria-current="step"><span className="h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" /><span className="sr-only">{step.name}</span></div></>
                    ) : ( // Upcoming
                        <><div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="h-0.5 w-full bg-gray-200" /></div><div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white"><span className="h-2.5 w-2.5 rounded-full bg-transparent" aria-hidden="true" /><span className="sr-only">{step.name}</span></div></>
                    )}
                </li>
            ))}
        </ol>
    </nav>
));
StepIndicator.displayName = "StepIndicator";

// --- Type Definitions ---
interface ChargePair { variable: string; fixed: string; }
interface RateMatrix {
    pincodes: string[];
    zones: string[];
    data: Record<string, Record<string, string>>;
}
interface VendorEntry {
    vendorName: string; vendorCode: string; vendorPhone: string; vendorEmail: string; gstNo: string;
    mode: string; address: string; state: string; pincode: string; fuelSurcharge: string;
    docketCharge: string; minWeight: string; rovCharges: ChargePair; insuranceCharges: ChargePair;
    odaCharges: ChargePair; codCharges: ChargePair; prepaidCharges: ChargePair; topayCharges: ChargePair;
    handlingCharges: ChargePair; fmCharges: ChargePair; appointmentCharges: ChargePair;
    divisorCoefficient: string; minCharges: string; greenTax: string; daccCharges: string;
    miscellaneousCharges: string; rateMatrix: RateMatrix;
}

// --- Initial State ---
const initialVendorState: VendorEntry = {
    vendorName: '', vendorCode: '', vendorPhone: '', vendorEmail: '', gstNo: '', mode: '',
    address: '', state: '', pincode: '', fuelSurcharge: '', docketCharge: '', minWeight: '',
    rovCharges: { variable: '', fixed: '' }, insuranceCharges: { variable: '', fixed: '' },
    odaCharges: { variable: '', fixed: '' }, codCharges: { variable: '', fixed: '' },
    prepaidCharges: { variable: '', fixed: '' }, topayCharges: { variable: '', fixed: '' },
    handlingCharges: { variable: '', fixed: '' }, fmCharges: { variable: '', fixed: '' },
    appointmentCharges: { variable: '', fixed: '' }, divisorCoefficient: '', minCharges: '',
    greenTax: '', daccCharges: '', miscellaneousCharges: '',
    rateMatrix: { pincodes: [], zones: [], data: {} }
};

const formSteps = [
    { id: 'details', name: 'Vendor Details', icon: <Building2 size={22} /> },
    { id: 'charges', name: 'Surcharges', icon: <DollarSign size={22} /> },
    { id: 'matrix', name: 'Rate Matrix', icon: <BrainCircuit size={22} /> }
];


export default function AddVendors() {
    const { user } = useAuth();
    const token = Cookies.get("authToken");

    // --- All state is now centralized here ---
    const [vendors, setVendors] = useState<VendorEntry[]>([initialVendorState]);
    const [activeVendorIndex, setActiveVendorIndex] = useState(0);
    const [currentStep, setCurrentStep] = useState(0); // The state for the current step
    const [currentPincode, setCurrentPincode] = useState('');
    const [currentZone, setCurrentZone] = useState('');

    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const activeVendor = vendors[activeVendorIndex];

    // --- State Update Handlers (These are now much more reliable) ---
    
    const handleSetVendorIndex = (index: number) => {
        setActiveVendorIndex(index);
        setCurrentStep(0); // ✨ CRITICAL FIX: Reset to the first step whenever vendor changes.
    };  
    
    // Generic field update function
    const updateField = (field: keyof Omit<VendorEntry, 'rateMatrix' | '...'>, value: string) => {
      if (!activeVendor) return;
      const updatedVendor = { ...activeVendor, [field]: value };
      setVendors(vendors.map((v, i) => i === activeVendorIndex ? updatedVendor : v));
    };

    // Charge field update function
    const updateChargeField = (
        chargeType: keyof Pick<VendorEntry, 
            'rovCharges' | 'insuranceCharges' | 'odaCharges' | 'codCharges' | 
            'prepaidCharges' | 'topayCharges' | 'handlingCharges' | 'fmCharges' | 'appointmentCharges'
        >, 
        part: 'variable' | 'fixed', 
        value: string
    ) => {
        if (!activeVendor) return;
        const updatedVendor = {
            ...activeVendor,
            [chargeType]: { ...(activeVendor[chargeType] as ChargePair), [part]: value }
        };
        setVendors(vendors.map((v, i) => i === activeVendorIndex ? updatedVendor : v));
    };

    // Matrix state update function
    const updateMatrix = (newMatrix: RateMatrix) => {
      if (!activeVendor) return;
      const updatedVendor = { ...activeVendor, rateMatrix: newMatrix };
      setVendors(vendors.map((v, i) => i === activeVendorIndex ? updatedVendor : v));
    };

    const handlePincodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentPincode.trim() && /^\d{6}$/.test(currentPincode.trim())) {
            e.preventDefault();
            const newPincode = currentPincode.trim();
            if (activeVendor.rateMatrix.pincodes.includes(newPincode)) { setCurrentPincode(''); return; }
            const newPincodes = [...activeVendor.rateMatrix.pincodes, newPincode];
            const newMatrixData = { 
                ...activeVendor.rateMatrix.data, 
                [newPincode]: {} as Record<string, string> 
            };
            activeVendor.rateMatrix.zones.forEach(zone => { 
                (newMatrixData[newPincode] as Record<string, string>)[zone] = ''; 
            });
            updateMatrix({ ...activeVendor.rateMatrix, pincodes: newPincodes, data: newMatrixData });
            setCurrentPincode('');
        }
    };
    const removePincode = (pincodeToRemove: string) => { const newPincodes = activeVendor.rateMatrix.pincodes.filter(p => p !== pincodeToRemove); const newMatrixData = { ...activeVendor.rateMatrix.data }; delete newMatrixData[pincodeToRemove]; updateMatrix({ ...activeVendor.rateMatrix, pincodes: newPincodes, data: newMatrixData }); };
    const handleZoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && currentZone.trim()) { e.preventDefault(); const newZone = currentZone.trim(); if (activeVendor.rateMatrix.zones.includes(newZone)) { setCurrentZone(''); return; } const newZones = [...activeVendor.rateMatrix.zones, newZone]; const newMatrixData = { ...activeVendor.rateMatrix.data }; Object.keys(newMatrixData).forEach(pincode => { newMatrixData[pincode][newZone] = '' }); updateMatrix({ ...activeVendor.rateMatrix, zones: newZones, data: newMatrixData }); setCurrentZone(''); } };
    const removeZone = (zoneToRemove: string) => { const newZones = activeVendor.rateMatrix.zones.filter(z => z !== zoneToRemove); const newMatrixData = { ...activeVendor.rateMatrix.data }; Object.keys(newMatrixData).forEach(pincode => { delete newMatrixData[pincode][zoneToRemove]; }); updateMatrix({ ...activeVendor.rateMatrix, zones: newZones, data: newMatrixData }); };
    const handleMatrixInputChange = (pincode: string, zone: string, value: string) => { const newMatrixData = { ...activeVendor.rateMatrix.data, [pincode]: { ...activeVendor.rateMatrix.data[pincode], [zone]: value } }; updateMatrix({ ...activeVendor.rateMatrix, data: newMatrixData }); };


    // Step navigation
    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));


    // Form submission
    const handleSaveAll = async (e: FormEvent) => {
        e.preventDefault();
        // The rest of this function is solid and doesn't need to change.
        if (!agree || loading || !vendors.length) return;
        setMessage(null);
        setLoading(true);

        const results = { success: 0, failed: 0, errors: [] as string[] };
        for (const vendor of vendors) {
            if (!vendor.vendorName.trim() || !vendor.vendorCode.trim()) {
                results.failed++; results.errors.push(`Vendor "${vendor.vendorName || 'Unnamed'}" skipped: Missing name or code.`); continue;
            }
            const payload = {
                customerID: (user as any)?.customer?._id || "CUSTOMER_ID_NOT_FOUND",
                companyName: vendor.vendorName,
                vendorCode: vendor.vendorCode, vendorPhone: vendor.vendorPhone, vendorEmail: vendor.vendorEmail, gstNo: vendor.gstNo,
                mode: vendor.mode, address: vendor.address, state: vendor.state, pincode: vendor.pincode,
                priceChart: { pincodes: vendor.rateMatrix.pincodes, zones: vendor.rateMatrix.zones },
                priceRate: { 
                    matrix: vendor.rateMatrix.pincodes.map(pincode => vendor.rateMatrix.zones.map(zone => vendor.rateMatrix.data[pincode]?.[zone] || '0')),
                    fuelSurcharge: vendor.fuelSurcharge, docketCharge: vendor.docketCharge, minWeight: vendor.minWeight, rovCharges: vendor.rovCharges, insuranceCharges: vendor.insuranceCharges, odaCharges: vendor.odaCharges,
                    codCharges: vendor.codCharges, prepaidCharges: vendor.prepaidCharges, topayCharges: vendor.topayCharges, handlingCharges: vendor.handlingCharges, fmCharges: vendor.fmCharges, appointmentCharges: vendor.appointmentCharges,
                    divisorCoefficient: vendor.divisorCoefficient, minCharges: vendor.minCharges, greenTax: vendor.greenTax, daccCharges: vendor.daccCharges, miscellaneousCharges: vendor.miscellaneousCharges,
                },
              };
            try {
                await axios.post('http://localhost:8000/api/transporter/addtiedupcompanies', payload, { headers: { 'Authorization': 'Bearer ' + token } });
                results.success++;
            } catch (err: any) {
                results.failed++; results.errors.push(err.response?.data?.message || `Failed to save ${vendor.vendorName}`);
            }
        }
        setLoading(false);
        if (results.failed > 0) setMessage({ type: 'error', text: `Failed to save ${results.failed} vendor(s). ${results.errors.join('. ')}`});
        if (results.success > 0) { setMessage({ type: 'success', text: `Successfully saved ${results.success} vendor(s)! All data has been reset.`}); setVendors([initialVendorState]); handleSetVendorIndex(0); setAgree(false); }
    };
    
    // The main JSX render
    return (
        <div className="min-h-screen w-full bg-slate-50 font-sans">
             <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-indigo-50 to-purple-50" style={{clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0% 100%)'}}></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Vendor Onboarding</h1>
                    <p className="mt-4 text-lg text-slate-600">A simple step-by-step guide to configure your partners.</p>
                </header>

                <form onSubmit={handleSaveAll} className="w-full space-y-8">
                    {/* Top Vendor Selection Tabs */}
                      

                    {/* Stepped Form for the Active Vendor */}
                    {!activeVendor ? (
                         <div className="text-center py-20 bg-white rounded-xl shadow-sm border"><Building2 size={48} className="mx-auto text-slate-300" /><h3 className="mt-4 text-lg font-semibold text-slate-800">No Vendor Selected</h3><p className="mt-1 text-sm text-slate-500">Add or select a vendor to begin.</p></div>
                    ) : (
                        <div className="w-full space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80"><StepIndicator currentStep={currentStep} /></div>
                            
                            <AnimatePresence mode="wait">
                            <motion.div key={currentStep}>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                                    <div className="flex items-center mb-6 pb-5 border-b border-slate-200">
                                        <div className="text-indigo-600">{formSteps[currentStep].icon}</div>
                                        <h3 className="text-xl font-semibold text-slate-800 ml-4">{formSteps[currentStep].name}</h3>
                                    </div>

                                    {/* --- RENDER CURRENT STEP --- */}

                                    {/* Step 1: Details */}
                                    {currentStep === 0 && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><InputField label="Vendor Name *" type="text" value={activeVendor.vendorName} onChange={e => updateField('vendorName', e.target.value)} required /><InputField label="Vendor Code *" type="text" value={activeVendor.vendorCode} onChange={e => updateField('vendorCode', e.target.value)} required /><InputField label="Mode of Transport" type="text" value={activeVendor.mode} onChange={e => updateField('mode', e.target.value)} /><InputField label="Vendor Phone" type="tel" value={activeVendor.vendorPhone} onChange={e => updateField('vendorPhone', e.target.value)} /><InputField label="Vendor Email" type="email" value={activeVendor.vendorEmail} onChange={e => updateField('vendorEmail', e.target.value)} /><InputField label="GST No." type="text" value={activeVendor.gstNo} onChange={e => updateField('gstNo', e.target.value)} /><InputField label="Vendor Address" type="text" className="md:col-span-2 lg:col-span-3" value={activeVendor.address} onChange={e => updateField('address', e.target.value)} /><InputField label="State" type="text" value={activeVendor.state} onChange={e => updateField('state', e.target.value)} /><InputField label="Pincode" type="text" value={activeVendor.pincode} onChange={e => updateField('pincode', e.target.value)} /></div>)}

                                    {/* Step 2: Surcharges */}
                                    {currentStep === 1 && (<div className="space-y-8"><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><h4 className="text-md font-semibold text-slate-600 md:col-span-3">Standard Charges</h4><InputField label="Fuel Surcharge (%)" type="number" min="0" value={activeVendor.fuelSurcharge} onChange={e => updateField('fuelSurcharge', e.target.value)} /><InputField label="Docket Charge (₹)" type="number" min="0" value={activeVendor.docketCharge} onChange={e => updateField('docketCharge', e.target.value)} /><InputField label="Minimum Weight (Kg)" type="number" min="0" value={activeVendor.minWeight} onChange={e => updateField('minWeight', e.target.value)} /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><h4 className="text-md font-semibold text-slate-600 md:col-span-2">Conditional Surcharges</h4><ChargeInputGroup label="ROV Charges" variableValue={activeVendor.rovCharges.variable} onVariableChange={e => updateChargeField('rovCharges', 'variable', e.target.value)} fixedValue={activeVendor.rovCharges.fixed} onFixedChange={e => updateChargeField('rovCharges', 'fixed', e.target.value)} /><ChargeInputGroup label="Insurance Charges" variableValue={activeVendor.insuranceCharges.variable} onVariableChange={e => updateChargeField('insuranceCharges', 'variable', e.target.value)} fixedValue={activeVendor.insuranceCharges.fixed} onFixedChange={e => updateChargeField('insuranceCharges', 'fixed', e.target.value)} /><ChargeInputGroup label="ODA Charges" variableValue={activeVendor.odaCharges.variable} onVariableChange={e => updateChargeField('odaCharges', 'variable', e.target.value)} fixedValue={activeVendor.odaCharges.fixed} onFixedChange={e => updateChargeField('odaCharges', 'fixed', e.target.value)} /><ChargeInputGroup label="COD Charges" variableValue={activeVendor.codCharges.variable} onVariableChange={e => updateChargeField('codCharges', 'variable', e.target.value)} fixedValue={activeVendor.codCharges.fixed} onFixedChange={e => updateChargeField('codCharges', 'fixed', e.target.value)} /></div><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"><h4 className="text-md font-semibold text-slate-600 col-span-full">Fixed Surcharges</h4><FixedChargeInput label="Prepaid" value={activeVendor.prepaidCharges.fixed} onChange={e => updateChargeField('prepaidCharges', 'fixed', e.target.value)} /><FixedChargeInput label="To-Pay" value={activeVendor.topayCharges.fixed} onChange={e => updateChargeField('topayCharges', 'fixed', e.target.value)} /><FixedChargeInput label="Handling" value={activeVendor.handlingCharges.fixed} onChange={e => updateChargeField('handlingCharges', 'fixed', e.target.value)} /><FixedChargeInput label="FM Charges" value={activeVendor.fmCharges.fixed} onChange={e => updateChargeField('fmCharges', 'fixed', e.target.value)} /><FixedChargeInput label="Appointment" value={activeVendor.appointmentCharges.fixed} onChange={e => updateChargeField('appointmentCharges', 'fixed', e.target.value)} /></div><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"><h4 className="text-md font-semibold text-slate-600 col-span-full">Additional Parameters</h4><InputField label="Divisor Coefficient" type="number" min="0" value={activeVendor.divisorCoefficient} onChange={e => updateField('divisorCoefficient', e.target.value)} /><InputField label="Min Charges (₹)" type="number" min="0" value={activeVendor.minCharges} onChange={e => updateField('minCharges', e.target.value)} /><InputField label="Green Tax (₹)" type="number" min="0" value={activeVendor.greenTax} onChange={e => updateField('greenTax', e.target.value)} /><InputField label="DACC Charges (₹)" type="number" min="0" value={activeVendor.daccCharges} onChange={e => updateField('daccCharges', e.target.value)} /><InputField label="Misc. Charges (₹)" type="number" min="0" value={activeVendor.miscellaneousCharges} onChange={e => updateField('miscellaneousCharges', e.target.value)} /></div></div>)}

                                    {/* Step 3: Matrix */}
                                    {currentStep === 2 && (<> <div className="flex justify-between items-center mb-6"> <p className="text-sm text-slate-500">Define origin pincodes & destination zones.</p> <button type="button" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"> <FileUp size={16} /> Upload Excel </button> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6"> <div> <label className="block text-sm font-medium text-slate-700 mb-2">Origin Pincodes (6 digits)</label> <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="text" placeholder="Enter pincode and press Enter" value={currentPincode} onChange={e => setCurrentPincode(e.target.value)} onKeyDown={handlePincodeKeyDown} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div> <div className="flex flex-wrap mt-3 min-h-[42px]"><AnimatePresence>{activeVendor.rateMatrix.pincodes.map(p => <Tag key={p} text={p} onRemove={() => removePincode(p)} />)}</AnimatePresence></div> </div> <div> <label className="block text-sm font-medium text-slate-700 mb-2">Destination Zones</label> <div className="relative"><Tags className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="text" placeholder="Enter zone and press Enter" value={currentZone} onChange={e => setCurrentZone(e.target.value)} onKeyDown={handleZoneKeyDown} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div> <div className="flex flex-wrap mt-3 min-h-[42px]"><AnimatePresence>{activeVendor.rateMatrix.zones.map(z => <Tag key={z} text={z} onRemove={() => removeZone(z)} />)}</AnimatePresence></div> </div> </div> <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-1/4 sticky left-0 bg-slate-50 z-10">Pincode</th>{activeVendor.rateMatrix.zones.map(zone => (<th key={zone} scope="col" className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">{zone}</th>))}</tr></thead><tbody className="bg-white divide-y divide-slate-200">{activeVendor.rateMatrix.pincodes.length === 0 ? (<tr><td colSpan={activeVendor.rateMatrix.zones.length + 1} className="text-center py-12 text-slate-500"><MapPin className="mx-auto mb-2 text-slate-400" />Add a pincode to get started.</td></tr>) : activeVendor.rateMatrix.zones.length === 0 ? (activeVendor.rateMatrix.pincodes.map(pincode => (<tr key={pincode}><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 sticky left-0 bg-white">{pincode}</td>{pincode === activeVendor.rateMatrix.pincodes[0] && (<td rowSpan={activeVendor.rateMatrix.pincodes.length} className="text-center py-12 text-slate-500"><Tags className="mx-auto mb-2 text-slate-400" />Add a zone to define charges.</td>)}</tr>))) : (activeVendor.rateMatrix.pincodes.map((pincode) => (<tr key={pincode} className="hover:bg-slate-50/70 transition-colors"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 sticky left-0 bg-white/70 backdrop-blur-sm">{pincode}</td>{activeVendor.rateMatrix.zones.map(zone => (<td key={zone} className="px-2 py-1 whitespace-nowrap"><input type="number" value={activeVendor.rateMatrix.data[pincode]?.[zone] ?? ''} onChange={e => handleMatrixInputChange(pincode, zone, e.target.value)} className="w-24 p-2 text-center bg-white border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition" placeholder="-"/></td>))}</tr>)))}</tbody></table></div> </>)}

                                    {/* Navigation Buttons */}
                                    <div className="mt-8 pt-5 border-t border-slate-200 flex justify-between">
                                        <button type="button" onClick={prevStep} disabled={currentStep === 0} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"> <ArrowLeft size={16} /> Previous </button>
                                        <button type="button" onClick={nextStep} className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${ currentStep === formSteps.length - 1 ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"}`}> {currentStep === formSteps.length - 1 ? 'Finish Setup' : 'Next'} {currentStep !== formSteps.length - 1 && <ArrowRight size={16} />} </button>
                                    </div>

                                </div>
                            </motion.div>
                            </AnimatePresence>
                        </div>
                    )}
                    
                     {/* Final Submission Block */}
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 mt-8 space-y-4">
                        {message && (<div className={`flex items-start p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}><div className="flex-shrink-0">{message.type === 'success' ? <CheckCircleIcon className="h-6 w-6" /> : <ExclamationTriangleIcon className="h-6 w-6" />}</div><div className="ml-3 flex-grow"><p className="font-medium">{message.text}</p></div><button onClick={() => setMessage(null)}><XMarkIcon className="h-5 w-5"/></button></div>)}
                        <div className="flex items-center">
                            <input type="checkbox" id="agree-checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                            <label htmlFor="agree-checkbox" className="ml-3 block text-sm text-slate-600">I have reviewed all vendor details and confirm they are ready for final submission.</label>
                        </div>
                        <button type="submit" disabled={!agree || loading || !vendors.length} className="w-full inline-flex items-center justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/50">
                            {loading ? (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) : (`Save all ${vendors.length} Vendor(s)`)}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}