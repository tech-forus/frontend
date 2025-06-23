import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Calculator as CalculatorIcon,
  Navigation,
  MapPin,
  MoveRight,
  Package,
  Boxes,
  Truck,
  Train,
  Plane,
  Ship as ShipIcon,
  Sparkles,
  Shield,
  Loader2,
  AlertCircle
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import VendorTable from "../components/VendorTable";
import { motion } from "framer-motion";


// --- TYPE DEFINITIONS ---
type VendorQuote = {
  transporterData: any;
  totalPrice: any;
  estimatedDelivery: any;
  companyName: string;
  price: any;
  transporterName: string;
  deliveryTime: string;
  estimatedTime?: number;
  chargeableWeight: number;
  totalCharges: number;
  logoUrl?: string;
  isBestValue?: boolean;
};


// --- STYLED HELPER COMPONENTS (Now with corrected types) ---

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/80 ${className}`}
    >
        {children}
    </motion.div>
);

const ModeButton = ({ label, icon, selected, onClick }: { label: string, icon: React.ReactNode, selected: boolean, onClick: () => void }) => (
    <button type="button" onClick={onClick} className={`flex-1 p-4 rounded-xl text-center transition-all duration-300 border-2 ${selected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white hover:bg-slate-50 border-white hover:border-slate-300'}`}>
        {icon}
        <span className="mt-2 block font-semibold">{label}</span>
    </button>
);

const Toggle = ({ label, icon, description, checked, onChange }: { label: string; icon: React.ReactNode; description: string, checked: boolean, onChange: (checked: boolean) => void }) => (
  <div onClick={() => onChange(!checked)} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
      <div className="text-indigo-600 mt-1">{icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-slate-800">{label}</h4>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className={`relative inline-block w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}>
        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`}/>
      </div>
    </div>
);

// ✨ A consistently styled InputField component for the form
const InputField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-slate-600 mb-1.5">{props.label}</label>
        <input {...props} className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:bg-slate-100 disabled:border-slate-200 disabled:cursor-not-allowed"/>
    </div>
);


const CalculatorPage: React.FC = () => {
  const { user } = useAuth();
  
  // --- STATE (functionality unchanged) ---
  const [isExpressShipment, setIsExpressShipment] = useState(false);
  const [isFragileShipment, setIsFragileShipment] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VendorQuote[] | null>(null);
  const [modeOfTransport, setModeOfTransport] = useState<'Road' | 'Rail' | 'Air' | 'Ship'>('Road');
  const [fromPincode, setFromPincode] = useState("");
  const [toPincode, setToPincode] = useState("");
  const [noofboxes, setNoofboxes] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
  const [length, setLength] = useState<number | undefined>(undefined);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [weightperbox, setWeightperbox] = useState<number | undefined>(undefined);
  const [hiddendata, setHiddendata] = useState<VendorQuote[] | null>(null);

  const token = Cookies.get('authToken');

  const calculateQuotes = async () => {
    setError(null);
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(fromPincode) || !pincodeRegex.test(toPincode)) {
      setError("Please enter valid 6-digit Origin and Destination Pincodes.");
      return;
    }
    // Basic validation for required number fields
    if (!noofboxes || !quantity || !length || !width || !height || !weightperbox) {
        setError("Please fill in all shipment detail fields.");
        return;
    }
    
    setIsCalculating(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/transporter/calculate",
        {
          customerID: (user as any).customer._id,
          userogpincode: (user as any).customer.pincode,
          modeoftransport: modeOfTransport, fromPincode, toPincode, noofboxes,
          quantity, length, width, height, weight: weightperbox,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response) {
        setData(response.data.tiedUpResult);
        setHiddendata(response.data.companyResult);
      }
    } catch (e) {
      setError("Failed to calculate quotes. Please check your inputs and try again.");
      console.error(e);
    } finally {
      setIsCalculating(false);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-br from-indigo-50 to-purple-50" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0% 100%)' }}></div>
        <div className="relative max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <header className="text-center py-8">
                <motion.h1 initial={{y:-20, opacity:0}} animate={{y:0, opacity:1}} transition={{duration:0.5}} className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Freight Rate Calculator</motion.h1>
                <motion.p initial={{y:-20, opacity:0}} animate={{y:0, opacity:1}} transition={{duration:0.5, delay:0.1}} className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">Instantly compare quotes from multiple vendors to find the best rate for your shipment.</motion.p>
            </header>
            
            {/* --- Mode & Route --- */}
            <Card>
                <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center"><Navigation size={22} className="mr-3 text-indigo-500" /> Mode & Route</h2>
                <p className="text-sm text-slate-500 mb-6">Select your mode of transport and enter the pickup and destination pincodes.</p>
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <ModeButton label="Road" icon={<Truck className="mx-auto" />} selected={modeOfTransport === 'Road'} onClick={() => setModeOfTransport('Road')} />
                      <ModeButton label="Rail" icon={<Train className="mx-auto" />} selected={modeOfTransport === 'Rail'} onClick={() => setModeOfTransport('Rail')} />
                      <ModeButton label="Air" icon={<Plane className="mx-auto" />} selected={modeOfTransport === 'Air'} onClick={() => setModeOfTransport('Air')} />
                      <ModeButton label="Ship" icon={<ShipIcon className="mx-auto" />} selected={modeOfTransport === 'Ship'} onClick={() => setModeOfTransport('Ship')} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                         <label htmlFor="fromPincode" className="block text-sm font-medium text-slate-600 mb-1">Origin Pincode</label>
                         <div className="relative"><MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><input type="text" id="fromPincode" value={fromPincode} onChange={(e) => setFromPincode(e.target.value)} placeholder="e.g., 400001" maxLength={6} className="w-full pl-11 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"/></div>
                       </div>
                        <div>
                         <label htmlFor="toPincode" className="block text-sm font-medium text-slate-600 mb-1">Destination Pincode</label>
                         <div className="relative"><MoveRight className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><input type="text" id="toPincode" value={toPincode} onChange={(e) => setToPincode(e.target.value)} placeholder="e.g., 110001" maxLength={6} className="w-full pl-11 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"/></div>
                       </div>
                    </div>
                </div>
            </Card>

            {/* --- Shipment Details --- */}
            <Card>
                <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center"><Boxes size={22} className="mr-3 text-indigo-500" /> Shipment Details</h2>
                <p className="text-sm text-slate-500 mb-6">Enter the dimensions and weight for each type of box in your shipment.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <InputField label="Number of Boxes" id="noofboxes" type="number" value={noofboxes || ''} onChange={e => setNoofboxes(e.target.valueAsNumber)} min={1} placeholder="e.g., 10" required/>
                    <InputField label="Quantity per Box" id="quantity" type="number" value={quantity || ''} onChange={e => setQuantity(e.target.valueAsNumber)} min={1} placeholder="e.g., 50" required/>
                    <InputField label="Total Quantity" id="totalQty" type="number" value={(quantity ?? 0) * (noofboxes ?? 0) || ''} readOnly />

                    <InputField label="Length (L) in cm" id="length" type="number" value={length || ''} onChange={e => setLength(e.target.valueAsNumber)} min={0} placeholder="cm" required/>
                    <InputField label="Width (W) in cm" id="width" type="number" value={width || ''} onChange={e => setWidth(e.target.valueAsNumber)} min={0} placeholder="cm" required/>
                    <InputField label="Height (H) in cm" id="height" type="number" value={height || ''} onChange={e => setHeight(e.target.valueAsNumber)} min={0} placeholder="cm" required/>

                    <InputField label="Weight per Box (Kg)" id="weightperbox" type="number" value={weightperbox || ''} onChange={e => setWeightperbox(e.target.valueAsNumber)} min={0} step="0.01" placeholder="Kg" required/>
                    <InputField label="Total Weight (Kg)" id="totalWeight" type="number" value={((weightperbox ?? 0) * (noofboxes ?? 0)).toFixed(2) || ''} readOnly />
                    
                    <div className="flex flex-col md:col-span-1">
                      <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-1.5">Description</label>
                      <input id="description" type="text" name="description" placeholder="Item description" className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                </div>
            </Card>

            {/* --- Freight Options --- */}
             <Card>
                <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center"><Package size={22} className="mr-3 text-indigo-500" /> Freight Options</h2>
                <p className="text-sm text-slate-500 mb-6">Select any additional services required for your shipment.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Toggle label="Express Shipment" icon={<Sparkles size={20} />} description="Prioritized handling & faster delivery" checked={isExpressShipment} onChange={setIsExpressShipment} />
                  <Toggle label="Fragile Shipment" icon={<Shield size={20} />} description="Special handling for delicate items" checked={isFragileShipment} onChange={setIsFragileShipment} />
                </div>
             </Card>

            {/* --- Error and CTA Section --- */}
            <div className="text-center pt-4 pb-8">
                 {error && <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="inline-flex items-center gap-3 bg-red-100 text-red-800 font-semibold px-4 py-3 rounded-xl mb-6 shadow-sm"><AlertCircle size={20}/>{error}</motion.div>}

                <motion.button onClick={calculateQuotes} disabled={isCalculating}
                  whileHover={{ scale: isCalculating ? 1 : 1.05 }} whileTap={{ scale: isCalculating ? 1 : 0.95 }}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-full shadow-lg shadow-indigo-500/50 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-60 disabled:shadow-none"
                >
                    {isCalculating ? <Loader2 className="animate-spin" /> : <CalculatorIcon />}
                    {isCalculating ? "Calculating Rates..." : "Calculate Freight Cost"}
                </motion.button>
            </div>

            {/* --- Results Section --- */}
            <div id="results">
                {(data || hiddendata) && (
                  <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2, duration: 0.5}}>
                     <VendorTable data={data ?? undefined} hiddendata={hiddendata ?? undefined} />
                  </motion.div>
                )}
            </div>
        </div>
    </div>
  );
};

export default CalculatorPage;