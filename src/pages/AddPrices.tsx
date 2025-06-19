// src/pages/admin/AddPrices.tsx
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {useNavigate} from 'react-router-dom';

interface VariableFixed { variable: number; fixed: number; }

type PriceRate = {
  minWeight: number;
  docketCharges: number;
  fuel: number;
  rovCharges: VariableFixed;
  inuaranceCharges: VariableFixed;
  odaCharges: VariableFixed;
  codCharges: VariableFixed;
  prepaidCharges: VariableFixed;
  topayCharges: VariableFixed;
  handlingCharges: VariableFixed;
  fmCharges: VariableFixed;
  appointmentCharges: VariableFixed;
  divisor: number;
  minCharges: number;
  greenTax: number;
  daccCharges: number;
  miscellanousCharges: number;
};

export default function AddPrices() {
  const navigate = useNavigate();
  const defaultZones = ['N1','N2','N3','C1','W1','W2','S1','S2','E1','NE1','NE2'];

  const [transporterName, setTransporterName] = useState('');
  const [zoneLabels, setZoneLabels] = useState<string[]>([]);
  const [zoneRates, setZoneRates] = useState<number[][]>([]);
  const [priceRate, setPriceRate] = useState<PriceRate>({
    minWeight: 0, docketCharges: 0, fuel: 0,
    rovCharges: { variable: 0, fixed: 0 },
    inuaranceCharges: { variable: 0, fixed: 0 },
    odaCharges: { variable: 0, fixed: 0 },
    codCharges: { variable: 0, fixed: 0 },
    prepaidCharges: { variable: 0, fixed: 0 },
    topayCharges: { variable: 0, fixed: 0 },
    handlingCharges: { variable: 0, fixed: 0 },
    fmCharges: { variable: 0, fixed: 0 },
    appointmentCharges: { variable: 0, fixed: 0 },
    divisor: 1, minCharges: 0, greenTax: 0, daccCharges: 0, miscellanousCharges: 0
  });
  const [manualFrom, setManualFrom] = useState('');
  const [manualTo, setManualTo] = useState('');
  const [manualPrice, setManualPrice] = useState(0);
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass = 'w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

    useEffect(() => {
    const savedName = sessionStorage.getItem('companyName');
    const savedZones = sessionStorage.getItem('zones');

    if (savedName) {
      setTransporterName(savedName);
    }

    if (savedZones) {
      try {
        const arr = JSON.parse(savedZones);
        if (Array.isArray(arr)) {
          setZoneLabels(arr);

          // build a [n x n] zero-matrix for the table
          const matrix = arr.map(_ => arr.map(__ => 0));
          setZoneRates(matrix);
        }
      } catch {
        console.warn('Invalid JSON in sessionStorage.zones');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('addPricesData', JSON.stringify({ transporterName, zoneLabels, zoneRates, priceRate, manualFrom, manualTo, manualPrice, showManual }));
  }, [transporterName, zoneLabels, zoneRates, priceRate, manualFrom, manualTo, manualPrice, showManual]);

  const rebuildMatrix = (labels: string[]) => {
    setZoneRates(prev => labels.map((_, i) => labels.map((__, j) => prev[i]?.[j] ?? 0)));
  };

  const handleRateChange = (section: keyof PriceRate, field: keyof VariableFixed | null, e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setPriceRate(prev => field
      ? { ...prev, [section]: { ...(prev[section] as VariableFixed), [field]: val } } as PriceRate
      : { ...prev, [section]: val } as PriceRate
    );
  };

  const handleCellChange = (i: number, j: number, val: number) => {
    setZoneRates(prev => { const next = prev.map(r => [...r]); next[i][j] = val; return next; });
  };

  const handleAddUnitPrice = () => {
    const i = zoneLabels.indexOf(manualFrom);
    const j = zoneLabels.indexOf(manualTo);
    if (i >= 0 && j >= 0) {
      handleCellChange(i, j, manualPrice);
      setManualPrice(0);
    }
  };

  const handleToggleManual = () => {
    if (!showManual && zoneLabels.length === 0) { setZoneLabels(defaultZones); rebuildMatrix(defaultZones); }
    setShowManual(prev => !prev);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(null);
    if (!transporterName.trim()) { setError('Please enter a transporter name.'); return; }
    const zr: Record<string, Record<string, number>> = {};
    zoneLabels.forEach((from, i) => { zr[from] = {}; zoneLabels.forEach((to, j) => zr[from][to] = zoneRates[i]?.[j]||0); });
    const payload = { companyName: transporterName, priceRate, zoneRates: zr };
    console.log('Submitting payload:', payload);
    try { setLoading(true); await axios.post('http://localhost:8000/api/admin/addprice', payload); toast.success('✅ Saved'); navigate("/compare")}
    catch(err:any){ setError(err.response?.data?.message||'Save failed'); }
    finally{ setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-indigo-600 p-6"><h1 className="text-2xl font-semibold text-white">Add Price Configuration</h1></div>
        <form className="p-8 space-y-6" onSubmit={handleSubmit}>

          {/* Transporter Name */}
          <input
            type="text"
            className={inputClass}
            value={transporterName}
            disabled        // ← user can’t change this now
          />

          {/* Basic Rates */}
          <div><h2 className="font-medium mb-2">Basic Rates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['minWeight','docketCharges','fuel'] as Array<keyof PriceRate>).map(field=>(
                <div key={field}><label className="block mb-1 capitalize">{field}</label>
                  <input type="number" className={inputClass} value={(priceRate as any)[field]} onChange={e=>handleRateChange(field,null,e)} /></div>
              ))}
            </div></div>

          {/* Variable/Fixed */}
          {(['rovCharges','inuaranceCharges','odaCharges','codCharges','prepaidCharges','topayCharges','handlingCharges','fmCharges','appointmentCharges'] as Array<keyof PriceRate>).map(section=> (
            <div key={section}><h2 className="font-medium mb-2 capitalize">{section}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['variable','fixed'] as (keyof VariableFixed)[]).map(sub=>(
                  <div key={sub}><label className="block mb-1 capitalize">{sub}</label>
                    <input type="number" className={inputClass} value={(priceRate[section] as VariableFixed)[sub]} onChange={e=>handleRateChange(section,sub,e)} /></div>
                ))}
              </div></div>
          ))}

          {/* Other Charges */}
          <div><h2 className="font-medium mb-2">Other Charges</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['divisor','minCharges','greenTax','daccCharges','miscellanousCharges'] as Array<keyof PriceRate>).map(field=>(
                <div key={field}><label className="block mb-1 capitalize">{field}</label>
                  <input type="number" className={inputClass} value={(priceRate as any)[field]} onChange={e=>handleRateChange(field,null,e)} /></div>
              ))}
            </div></div>

          {/* Matrix */}
          {zoneLabels.length>0 && (
            <div><h2 className="font-medium mb-2">Zone Rates</h2>
              <div className="overflow-auto border rounded mb-6">
                <table className="min-w-full"><thead className="bg-gray-50"><tr>
                  <th className="px-4 py-2">From \ To</th>
                  {zoneLabels.map(l=><th key={l} className="px-4 py-2 text-center">{l}</th>)}
                </tr></thead><tbody>
                  {zoneRates.map((row,i)=><tr key={i} className="border-t">
                    <td className="px-4 py-2 font-medium">{zoneLabels[i]}</td>
                    {row.map((v,j)=><td key={j} className="px-2 py-1">
                      <input type="number" className="w-full text-sm" value={v} onChange={e=>handleCellChange(i,j,parseFloat(e.target.value)||0)} />
                    </td>)}
                  </tr>)}
                </tbody></table>
              </div></div>
          )}

          {/* Toggle Manual Details */}
          <div className="text-right">
            <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleToggleManual}>
              {showManual ? 'Hide Manual Details' : 'Add Details Manually'}
            </button>
          </div>

          {/* Manual Unit Price */}
          {showManual && zoneLabels.length>0 && (
            <div><h2 className="font-medium mb-2">Manual Unit Price</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div><label className="block mb-1">From Zone</label>
                  <select className={inputClass} value={manualFrom} onChange={e=>setManualFrom(e.target.value)}>
                    <option value="">-- Select --</option>
                    {zoneLabels.map(z=><option key={z} value={z}>{z}</option>)}
                  </select></div>
                <div><label className="block mb-1">To Zone</label>
                  <select className={inputClass} value={manualTo} onChange={e=>setManualTo(e.target.value)}>
                    <option value="">-- Select --</option>
                    {zoneLabels.map(z=><option key={z} value={z}>{z}</option>)}
                  </select></div>
                <div><label className="block mb-1">Unit Price</label>
                  <input type="number" className={inputClass} value={manualPrice} onChange={e=>setManualPrice(parseFloat(e.target.value)||0)} /></div>
                <div className="flex items-end">
                  <button type="button" className="w-full py-2 bg-blue-600 text-white rounded" onClick={handleAddUnitPrice}>Add Price</button>
                </div>
              </div></div>
          )}

          {error && <p className="text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Saving…' : 'Save Price Config'}
          </button>
        </form>
      </div>
    </div>
  );
}
