// src/pages/AddVendors.tsx
import  {
  useState,
  useEffect,
  useCallback,
  FormEvent,
  memo
} from 'react';
import axios from 'axios';
import {
  ArrowDownTrayIcon,
  TrashIcon,
  XCircleIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/solid';
import Cookies from 'js-cookie';
import { useAuth } from '../hooks/useAuth';

type Coverage = 'none' | 'all' | 'partial';

interface Zone {
  name: string;
  pincodes: string;
  coverage: Coverage;
}

interface ChargePair {
  variable: string;
  fixed: string;
}

interface VendorEntry {
  vendorName: string;
  vendorCode: string;
  vendorPhone: string;
  vendorEmail: string;
  gstNo: string;
  mode: string;
  address: string;
  state: string;
  pincode: string;
  fuelSurcharge: string;
  docketCharge: string;
  minWeight: string; // Renamed from fov for clarity
  rovCharges: ChargePair;
  insuranceCharges: ChargePair;
  odaCharges: ChargePair;
  codCharges: ChargePair;
  prepaidCharges: ChargePair;
  topayCharges: ChargePair;
  handlingCharges: ChargePair;
  fmCharges: ChargePair;
  appointmentCharges: ChargePair;
  divisorCoefficient: string;
  minCharges: string;
  greenTax: string;
  daccCharges: string;
  miscellaneousCharges: string;
  zones: Zone[];
  prices: string[][];
}


// interface SimpleVendor {
//   id: string;
//   name: string;
// }

const INPUT_STYLE = "block w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500";
const RATE_INPUT_STYLE = "w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500";
const BTN_BLUE   = "inline-flex items-center text-blue-600 hover:text-blue-800";
const BTN_GREEN  = "bg-green-600 hover:bg-green-700 text-white";
const BTN_GRAY   = "bg-gray-400 cursor-not-allowed text-white";
const BTN_DELETE = "p-1 text-gray-400 hover:text-red-600";
const COVERAGE_COLORS: Record<Coverage,string> = {
  none:    "bg-red-100 text-red-800",
  all:     "bg-green-100 text-green-800",
  partial: "bg-yellow-100 text-yellow-800"
};

function formatPincodes(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const chunks = digits.match(/.{1,6}/g) || [];
  return chunks.join(',');
}

// ─── ZoneEditor ─────────────────────────────────────────────────────────────
const ZoneEditor = memo(({
  vidx, zidx, zone,
  onNameChange,
  onPincodesChange,
  onRemoveZone,
  onCoverageClick
}: {
  vidx: number;
  zidx: number;
  zone: Zone;
  onNameChange: (vidx: number, zidx: number, name: string) => void;
  onPincodesChange: (vidx: number, zidx: number, pincodes: string) => void;
  onRemoveZone: (vidx: number, zidx: number) => void;
  onCoverageClick: (vidx: number, zidx: number) => void;
}) => (
  <div className="mb-4 p-4 bg-gray-50 rounded-md border">
    <div className="flex justify-between items-start">
      <input
        type="text"
        value={zone.name}
        onChange={e => onNameChange(vidx, zidx, e.target.value)}
        placeholder="Zone name"
        className={`${INPUT_STYLE} flex-1 mr-2`}
      />
      <button
        onClick={() => onRemoveZone(vidx, zidx)}
        className={BTN_DELETE}
        aria-label="Remove zone"
      >
        <XCircleIcon className="h-6 w-6" />
      </button>
    </div>
    <div className="mt-3">
      {zone.coverage === 'partial' ? (
        <div className="flex items-center">
          <input
            autoFocus
            type="text"
            value={zone.pincodes}
            onChange={e => onPincodesChange(vidx, zidx, e.target.value)}
            placeholder="Comma-separate 6-digit codes"
            className={`${INPUT_STYLE} focus:ring-yellow-500 focus:border-yellow-500 flex-1`}
          />
          <button
            onClick={() => onCoverageClick(vidx, zidx)}
            className="ml-2 text-gray-400 hover:text-gray-600"
            aria-label="Revert to standard"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => onCoverageClick(vidx, zidx)}
          className={`${BTN_BLUE} text-sm`}
        >
          <PencilSquareIcon className="h-4 w-4 mr-1" /> Set Custom Pincodes
        </button>
      )}
    </div>
  </div>
));
ZoneEditor.displayName = 'ZoneEditor';

// ─── RatesTable ──────────────────────────────────────────────────────────────
const RatesTable = memo(({
  vidx, zones, prices,
  coverages,
  onCellChange,
  onToggleCoverage
}: {
  vidx: number;
  zones: Zone[];
  prices: string[][];
  coverages: Coverage[];
  onCellChange: (vidx:number, row:number, col:number, val:string) => void;
  onToggleCoverage: (vidx:number, zidx:number) => void;
}) => (
  <div>
    <div className="mb-2 px-4 py-2 bg-blue-50 rounded-md flex items-center">
      <InformationCircleIcon className="h-5 w-5 text-blue-400" />
      <span className="ml-2 text-sm text-blue-700">
        Click headers to cycle: 
        <span className="font-semibold text-red-800">Inactive</span> → 
        <span className="font-semibold text-yellow-800">Custom</span> → 
        <span className="font-semibold text-green-800">Active</span>.
      </span>
    </div>
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Origin ↔ Dest.</th>
            {zones.map((zn, ci) => (
              <th key={ci} className="p-2 text-center">
                <button
                  onClick={() => onToggleCoverage(vidx, ci)}
                  className={`px-2 py-1 rounded-full w-full ${COVERAGE_COLORS[coverages[ci]]}`}
                >
                  {zn.name || `Zone ${ci+1}`}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {zones.map((rz, ri) => (
            <tr key={ri} className="border-t">
              <td className="p-2 bg-gray-50">
                <button
                  onClick={() => onToggleCoverage(vidx, ri)}
                  className={`px-2 py-1 rounded-full w-full text-left ${COVERAGE_COLORS[coverages[ri]]}`}
                >
                  {rz.name || `Zone ${ri+1}`}
                </button>
              </td>
              {zones.map((_, ci) => (
                <td key={ci} className="p-2">
                  <input
                    type="number"
                    min="0"
                    value={prices[ri]?.[ci] || ''}
                    placeholder="Rate"
                    className={RATE_INPUT_STYLE}
                    onChange={e => onCellChange(vidx, ri, ci, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
));
RatesTable.displayName = 'RatesTable';


const initialVendorState: VendorEntry = {
    vendorName: '',
    vendorCode: '',
    vendorPhone: '',
    vendorEmail: '',
    gstNo: '',
    mode: '',
    address: '',
    state: '',
    pincode: '',
    fuelSurcharge: '',
    docketCharge: '',
    minWeight: '',
    rovCharges: { variable: '', fixed: '' },
    insuranceCharges: { variable: '', fixed: '' },
    odaCharges: { variable: '', fixed: '' },
    codCharges: { variable: '', fixed: '' },
    prepaidCharges: { variable: '', fixed: '' },
    topayCharges: { variable: '', fixed: '' },
    handlingCharges: { variable: '', fixed: '' },
    fmCharges: { variable: '', fixed: '' },
    appointmentCharges: { variable: '', fixed: '' },
    divisorCoefficient: '',
    minCharges: '',
    greenTax: '',
    daccCharges: '',
    miscellaneousCharges: '',
    zones: [{ name: '', pincodes: '', coverage: 'none' }],
    prices: [['']],
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AddVendors() {

  // This might be for a future feature to pre-fill data
  const [vendorNameInput, setVendorNameInput] = useState('');
  const [vendorSuggestions, setVendorSuggestions] = useState<string[]>([]);
  const {user} = useAuth();

  const token = Cookies.get('authToken');

  useEffect(() => {
    const delay = setTimeout(async() => {
      if (vendorNameInput.length >= 1) {
        const data = await axios.get(`http://localhost:8000/api/transporter/gettransporter?vendorName=${vendorNameInput}` , {headers: {'Authorization': 'Bearer ' + token}});
        setVendorSuggestions(data.data);
      }
    }, 300); // debounce

    return () => clearTimeout(delay);
  }, [vendorNameInput]);

  const [vendors, setVendors] = useState<VendorEntry[]>([initialVendorState]);
  const [agree,   setAgree]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string|null>(null);
  const [error,   setError]   = useState<string|null>(null);

  const updateVendors = useCallback((fn:(vs:VendorEntry[])=>VendorEntry[]) => {
    setVendors(fn);
  }, []);

  const getCoverages = (zones:Zone[]) => zones.map(z => z.coverage);

  const addVendor = useCallback(() => {
    updateVendors(vs => [...vs, { ...initialVendorState }]);
  }, [updateVendors]);

  const removeVendor = useCallback((idx:number) => {
    updateVendors(vs => vs.filter((_,i) => i !== idx));
  }, [updateVendors]);

  const updateField = useCallback((
    vidx:number,
    field: keyof Omit<VendorEntry, 'zones' | 'prices' | 'rovCharges' | 'insuranceCharges' | 'odaCharges' | 'codCharges' | 'prepaidCharges' | 'topayCharges' | 'handlingCharges' | 'fmCharges' | 'appointmentCharges'>,
    value: string
  ) => {
    updateVendors(vs =>
      vs.map((v,i) => i===vidx ? { ...v, [field]: value } : v)
    );
  }, [updateVendors]);
  
  const updateChargeField = useCallback((
    vidx: number,
    chargeType: keyof Pick<VendorEntry, 'rovCharges' | 'insuranceCharges' | 'odaCharges' | 'codCharges' | 'prepaidCharges' | 'topayCharges' | 'handlingCharges' | 'fmCharges' | 'appointmentCharges'>,
    part: 'variable' | 'fixed',
    value: string
) => {
    updateVendors(vs =>
        vs.map((v, i) => i === vidx ? {
            ...v,
            [chargeType]: {
                ...v[chargeType],
                [part]: value
            }
        } : v)
    );
}, [updateVendors]);


  const addZone = useCallback((vidx:number) => {
    updateVendors(vs =>
      vs.map((v,i) => i !== vidx ? v : {
        ...v,
        zones: [...v.zones, { name:'', pincodes:'', coverage:'none' }],
        prices: v.prices.map(r => [...r,''])
                         .concat([Array(v.zones.length+1).fill('')])
      })
    );
  }, [updateVendors]);

  const removeZone = useCallback((vidx:number, zidx:number) => {
    updateVendors(vs =>
      vs.map((v,i) => i!==vidx ? v : {
        ...v,
        zones: v.zones.filter((_,j)=>j!==zidx),
        prices: v.prices
                  .filter((_,r)=>r!==zidx)
                  .map(r=>r.filter((_,c)=>c!==zidx))
      })
    );
  }, [updateVendors]);

  const updateZoneField = useCallback((
    vidx:number, zidx:number,
    field:'name'|'pincodes',
    value:string
  ) => {
    updateVendors(vs =>
      vs.map((v,i) => i!==vidx ? v : {
        ...v,
        zones: v.zones.map((z,j) => j!==zidx ? z : {
          ...z,
          [field]: value,
          coverage: field==='pincodes' && value.trim()!=='' ? 'partial' : z.coverage
        })
      })
    );
  }, [updateVendors]);

  const handleZonePincodesChange = useCallback((
    vidx:number, zidx:number, raw:string
  ) => {
    const formatted = formatPincodes(raw);
    updateZoneField(vidx, zidx, 'pincodes', formatted);
  }, [updateZoneField]);

  const toggleCoverageCycle = useCallback((vidx:number, zidx:number) => {
    updateVendors(vs =>
      vs.map((v,i) => i!==vidx ? v : {
        ...v,
        zones: v.zones.map((z,j) => j!==zidx ? z : {
          ...z,
          coverage: z.coverage==='none' ? 'partial'
                    : z.coverage==='partial' ? 'all'
                    : 'none',
          pincodes: z.coverage==='partial' ? '' : z.pincodes
        })
      })
    );
  }, [updateVendors]);

  const handlePriceChange = useCallback((vidx:number,row:number,col:number,val:string) => {
    updateVendors(vs =>
      vs.map((v,i) => i!==vidx ? v : {
        ...v,
        prices: v.prices.map((r,ri) => ri!==row ? r : r.map((c,ci) => ci!==col ? c : val)),
        zones: v.zones.map((z,zi) =>
          (zi===row||zi===col) && val.trim()!=='' && z.coverage==='none'
            ? { ...z, coverage:'all' }
            : z
        )
      })
    );
  }, [updateVendors]);

  const handleSaveAll = async (e:FormEvent) => {
    e.preventDefault();
    if (!agree || loading) return;

    console.log("submitting")

    setError(null);
    setMessage(null);
    setLoading(true);

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const vendor of vendors) {
      if (!vendor.vendorName.trim() || !vendor.vendorCode.trim()) {
        results.failed++;
        results.errors.push(`Vendor "${vendor.vendorName || 'Unnamed'}" skipped: Missing name or code.`);
        continue;
      }

      const activeZones = vendor.zones.filter(z => z.coverage !== 'none' && z.name.trim() !== '');
      const priceChart = activeZones.map(z => ({
        name: z.name,
        pincodes: z.coverage === 'partial'
          ? z.pincodes.split(',').map(p => p.trim()).filter(Boolean)
          : []
      }));

      const activeZoneIndices = vendor.zones
        .map((z, i) => (z.coverage !== 'none' && z.name.trim() !== '') ? i : -1)
        .filter(i => i !== -1);
      
      const activePrices = activeZoneIndices.map(ri => 
        activeZoneIndices.map(ci => vendor.prices[ri]?.[ci] || '0')
      );

      const priceRate = {
        matrix: activePrices,
        fuelSurcharge: vendor.fuelSurcharge,
        docketCharge: vendor.docketCharge,
        minWeight: vendor.minWeight,
        rovCharges: vendor.rovCharges,
        insuranceCharges: vendor.insuranceCharges,
        odaCharges: vendor.odaCharges,
        codCharges: vendor.codCharges,
        prepaidCharges: vendor.prepaidCharges,
        topayCharges: vendor.topayCharges,
        handlingCharges: vendor.handlingCharges,
        fmCharges: vendor.fmCharges,
        appointmentCharges: vendor.appointmentCharges,
        divisorCoefficient: vendor.divisorCoefficient,
        minCharges: vendor.minCharges,
        greenTax: vendor.greenTax,
        daccCharges: vendor.daccCharges,
        miscellaneousCharges: vendor.miscellaneousCharges,
      };

      const payload = {
        customerID: (user as any).customer._id,
        companyName: vendor.vendorName,
        vendorCode: vendor.vendorCode,
        vendorPhone: vendor.vendorPhone,
        vendorEmail: vendor.vendorEmail,
        gstNo: vendor.gstNo,
        mode: vendor.mode,
        address: vendor.address,
        state: vendor.state,
        pincode: vendor.pincode,
        priceChart: priceChart,
        priceRate: priceRate,
      };

      try {
        console.log(payload);
        await axios.post('http://localhost:8000/api/transporter/addtiedupcompanies', payload , {headers: {'Authorization': 'Bearer ' + token}}); // Aligned with backend function
        results.success++;
      } catch (err: any) {
        results.failed++;
        const errorMessage = err.response?.data?.message || `Failed to save ${vendor.vendorName}`;
        results.errors.push(errorMessage);
      }
    }

    setLoading(false);
    if (results.failed > 0) {
      setError(`❌ Failed to save ${results.failed} vendor(s). Errors: ${results.errors.join('. ')}`);
    }
    if (results.success > 0) {
      setMessage(`✅ Successfully saved ${results.success} vendor(s).`);
    }
  };

  return (
    <div className="flex overflow-x-hidden min-h-screen bg-gray-50">
      <form onSubmit={handleSaveAll} className="w-screen p-6 space-y-8 item-center">
      {vendors.map((v, idx) => (
        <>
          <div className="p-6 bg-white rounded shadow-lg space-y-6 border border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Vendor Details #{idx+1}</h2>
            {vendors.length > 1 && (
              <button type="button" onClick={() => removeVendor(idx)} className={BTN_DELETE} aria-label="Remove Vendor">
                <TrashIcon className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              list={`vendor-suggestions-${idx}`}
              placeholder="Vendor Name *"
              value={v.vendorName}
              onChange={e => {
                const value = e.target.value;
                setVendorNameInput(value);
                updateField(idx, 'vendorName', value); // your existing updater
              }}
              className={INPUT_STYLE}
              required
            />

            <datalist id={`vendor-suggestions-${idx}`}>
              {vendorSuggestions.map((name, i) => (
                <option key={i} value={name} />
              ))}
            </datalist>
            <input type="text" placeholder="Vendor Code *" value={v.vendorCode} onChange={e => updateField(idx, 'vendorCode', e.target.value)} className={INPUT_STYLE} required />
            <input type="text" placeholder="Vendor Phone" value={v.vendorPhone} onChange={e => updateField(idx, 'vendorPhone', e.target.value)} className={INPUT_STYLE} />
            <input type="email" placeholder="Vendor Email" value={v.vendorEmail} onChange={e => updateField(idx, 'vendorEmail', e.target.value)} className={INPUT_STYLE} />
            <input type="text" placeholder="Vendor GST No." value={v.gstNo} onChange={e => updateField(idx, 'gstNo', e.target.value)} className={INPUT_STYLE} />
            <input type="text" placeholder="Mode of Transport" value={v.mode} onChange={e => updateField(idx, 'mode', e.target.value)} className={INPUT_STYLE} />
            <input type="text" placeholder="Vendor Address" value={v.address} onChange={e => updateField(idx, 'address', e.target.value)} className={INPUT_STYLE} />
            <input type="text" placeholder="State" value={v.state} onChange={e => updateField(idx, 'state', e.target.value)} className={INPUT_STYLE} />
            <input type="text" placeholder="Pincode" value={v.pincode} onChange={e => updateField(idx, 'pincode', e.target.value)} className={INPUT_STYLE} />
            <input type="number" min="0" placeholder="Fuel Surcharge (%)" value={v.fuelSurcharge} onChange={e => updateField(idx, 'fuelSurcharge', e.target.value)} className={INPUT_STYLE} />
            <input type="number" min="0" placeholder="Docket Charge" value={v.docketCharge} onChange={e => updateField(idx, 'docketCharge', e.target.value)} className={INPUT_STYLE} />
            <input type="number" min="0" placeholder="Minimum Weight" value={v.minWeight} onChange={e => updateField(idx, 'minWeight', e.target.value)} className={INPUT_STYLE} />
            
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-2">
                <h3 className="md:col-span-2 font-semibold text-gray-700">ROV Charges</h3>
                <input type="number" min="0" placeholder="Variable (%)" value={v.rovCharges.variable} onChange={e => updateChargeField(idx, 'rovCharges', 'variable', e.target.value)} className={INPUT_STYLE}/>
                <input type="number" min="0" placeholder="Fixed" value={v.rovCharges.fixed} onChange={e => updateChargeField(idx, 'rovCharges', 'fixed', e.target.value)} className={INPUT_STYLE}/>

                <h3 className="md:col-span-2 font-semibold text-gray-700">Insurance Charges</h3>
                <input type="number" min="0" placeholder="Variable (%)" value={v.insuranceCharges.variable} onChange={e => updateChargeField(idx, 'insuranceCharges', 'variable', e.target.value)} className={INPUT_STYLE}/>
                <input type="number" min="0" placeholder="Fixed" value={v.insuranceCharges.fixed} onChange={e => updateChargeField(idx, 'insuranceCharges', 'fixed', e.target.value)} className={INPUT_STYLE}/>

                <h3 className="md:col-span-2 font-semibold text-gray-700">ODA Charges</h3>
                <input type="number" min="0" placeholder="Variable (%)" value={v.odaCharges.variable} onChange={e => updateChargeField(idx, 'odaCharges', 'variable', e.target.value)} className={INPUT_STYLE}/>
                <input type="number" min="0" placeholder="Fixed" value={v.odaCharges.fixed} onChange={e => updateChargeField(idx, 'odaCharges', 'fixed', e.target.value)} className={INPUT_STYLE}/>

                <h3 className="md:col-span-2 font-semibold text-gray-700">COD Charges</h3>
                <input type="number" min="0" placeholder="Variable (%)" value={v.codCharges.variable} onChange={e => updateChargeField(idx, 'codCharges', 'variable', e.target.value)} className={INPUT_STYLE}/>
                <input type="number" min="0" placeholder="Fixed" value={v.codCharges.fixed} onChange={e => updateChargeField(idx, 'codCharges', 'fixed', e.target.value)} className={INPUT_STYLE}/>

                <h3 className="md:col-span-2 font-semibold text-gray-700">Other Surcharges</h3>
                <input type="number" min="0" placeholder="Prepaid Charges" value={v.prepaidCharges.fixed} onChange={e => updateChargeField(idx, 'prepaidCharges', 'fixed', e.target.value)} className={INPUT_STYLE}/>
                <input type="number" min="0" placeholder="Topay Charges" value={v.topayCharges.fixed} onChange={e => updateChargeField(idx, 'topayCharges', 'fixed', e.target.value)} className={INPUT_STYLE}/>
                <input type="number" min="0" placeholder="Handling Charges" value={v.handlingCharges.fixed} onChange={e => updateChargeField(idx, 'handlingCharges', 'fixed', e.target.value)} className={INPUT_STYLE}/>
                <input type="number" min="0" placeholder="FM Charges" value={v.fmCharges.fixed} onChange={e => updateChargeField(idx, 'fmCharges', 'fixed', e.target.value)} className={INPUT_STYLE}/>
                <input type="number" min="0" placeholder="Appointment Charges" value={v.appointmentCharges.fixed} onChange={e => updateChargeField(idx, 'appointmentCharges', 'fixed', e.target.value)} className={INPUT_STYLE}/>
            
                <h3 className="md:col-span-2 font-semibold text-gray-700">Additional Parameters</h3>
                <input type="number" min="0" placeholder="Divisor Coefficient" value={v.divisorCoefficient} onChange={e => updateField(idx, 'divisorCoefficient', e.target.value)} className={INPUT_STYLE}/>
                <input type="number" min="0" placeholder="Min Charges" value={v.minCharges} onChange={e => updateField(idx, 'minCharges', e.target.value)} className={INPUT_STYLE}/>
                <input type="number" min="0" placeholder="Green Tax" value={v.greenTax} onChange={e => updateField(idx, 'greenTax', e.target.value)} className={INPUT_STYLE}/>
                <input type="number" min="0" placeholder="DACC Charges" value={v.daccCharges} onChange={e => updateField(idx, 'daccCharges', e.target.value)} className={INPUT_STYLE}/>
                <input type="number" min="0" placeholder="Miscellaneous Charges" value={v.miscellaneousCharges} onChange={e => updateField(idx, 'miscellaneousCharges', e.target.value)} className={INPUT_STYLE}/>
            </div>
          </div>

           <div>
            <label className="block font-medium mb-1">Upload Excel File</label>
            <input type="file" accept=".xlsx, .xls" className="block border p-2 rounded" />
          </div>

          {/* Step 1: Define Zones */}
          <div>
            <h3 className="font-semibold mb-3">Step 1: Define Serviceable Zones</h3>
            {v.zones.map((zone, zi) => (
              <ZoneEditor
                key={zi}
                vidx={idx}
                zidx={zi}
                zone={zone}
                onNameChange={(vidx, zidx, name) => updateZoneField(vidx, zidx, 'name', name)}
                onPincodesChange={handleZonePincodesChange}
                onRemoveZone={removeZone}
                onCoverageClick={toggleCoverageCycle}
              />
            ))}
            <button type="button" onClick={() => addZone(idx)} className={BTN_BLUE}>
              <PlusCircleIcon className="h-5 w-5 mr-1" /> Add Zone
            </button>
          </div>

          {/* Step 2: Set Rates */}
          <div>
            <h3 className="font-semibold mb-3">Step 2: Set Zone-to-Zone Rates</h3>
            <RatesTable vidx={idx} zones={v.zones} prices={v.prices} coverages={getCoverages(v.zones)} onCellChange={handlePriceChange} onToggleCoverage={toggleCoverageCycle} />
          </div>
        </div>
        
        </>

        
      ))}

      {/* Final Controls */}
      <div className="space-y-4">
        <button type="button" onClick={addVendor} className={`${BTN_BLUE} px-4 py-2 bg-gray-100 rounded`}>
          <PlusCircleIcon className="h-5 w-5 mr-1" /> Add Another Vendor
        </button>

        <div className="flex items-center bg-blue-50 p-4 rounded">
          <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" id="agree-checkbox" />
          <label htmlFor="agree-checkbox" className="ml-2 text-sm">I confirm all information is correct and ready for submission.</label>
        </div>

        <button type="submit" disabled={!agree || loading} className={`w-full py-3 text-white font-bold rounded-lg transition-colors ${agree && !loading ? BTN_GREEN : BTN_GRAY}`}>
          {loading ? 'Saving…' : 'Save All Vendors'}
        </button>

        {message && <p className="text-green-600 text-center font-semibold">{message}</p>}
      </div>
    </form>
    </div>
  );
}