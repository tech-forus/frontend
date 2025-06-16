import React, { useState } from 'react';
import axios from 'axios';

interface VendorEntry {
  vendorName: string;
  isOda: boolean;
  fuelSurcharge: string;
  docketCharge: string;
  fov: string;
  pincodes: string[];
  zones: string[];
  prices: string[][];
}

const AddVendors: React.FC = () => {
  const [vendors, setVendors] = useState<VendorEntry[]>([{ 
    vendorName: '',
    isOda: false,
    fuelSurcharge: '',
    docketCharge: '',
    fov: '',
    pincodes: [''],
    zones: [''],
    prices: [['']]
  }]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addVendor = () => {
    setVendors(prev => [
      ...prev,
      {
        vendorName: '',
        isOda: false,
        fuelSurcharge: '',
        docketCharge: '',
        fov: '',
        pincodes: [''],
        zones: [''],
        prices: [['']]
      }
    ]);
  };

  const updateField = (
    vidx: number,
    field: keyof Omit<VendorEntry, 'pincodes' | 'zones' | 'prices'>,
    value: string | boolean
  ) => {
    setVendors(prev =>
      prev.map((v, i) => (i === vidx ? { ...v, [field]: value } : v))
    );
  };

  const addPincode = (vidx: number) => {
    setVendors(prev =>
      prev.map((v, i) => {
        if (i !== vidx) return v;
        const pincodes = [...v.pincodes, ''];
        const prices = [...v.prices, Array(v.zones.length).fill('')];
        return { ...v, pincodes, prices };
      })
    );
  };

  const updatePincode = (vidx: number, pidx: number, value: string) => {
    setVendors(prev =>
      prev.map((v, i) => {
        if (i !== vidx) return v;
        const pincodes = v.pincodes.map((p, j) => (j === pidx ? value : p));
        return { ...v, pincodes };
      })
    );
  };

  const addZone = (vidx: number) => {
    setVendors(prev =>
      prev.map((v, i) => {
        if (i !== vidx) return v;
        const zones = [...v.zones, ''];
        const prices = v.prices.map(row => [...row, '']);
        return { ...v, zones, prices };
      })
    );
  };

  const updateZone = (vidx: number, zidx: number, value: string) => {
    setVendors(prev =>
      prev.map((v, i) => {
        if (i !== vidx) return v;
        const zones = v.zones.map((z, j) => (j === zidx ? value : z));
        return { ...v, zones };
      })
    );
  };

  const updatePrice = (vidx: number, r: number, c: number, value: string) => {
    setVendors(prev =>
      prev.map((v, i) => {
        if (i !== vidx) return v;
        const prices = v.prices.map((row, ri) =>
          ri === r ? row.map((col, ci) => (ci === c ? value : col)) : row
        );
        return { ...v, prices };
      })
    );
  };

  const saveVendor = async (vidx: number) => {
    const v = vendors[vidx];
    try {
      await axios.post('/api/transporters/manual', {
        vendorName: v.vendorName,
        isOda: v.isOda,
        fuelSurcharge: parseFloat(v.fuelSurcharge),
        docketCharge: parseFloat(v.docketCharge),
        fov: parseFloat(v.fov),
        pincodes: v.pincodes,
        zones: v.zones,
        matrix: v.prices
      });
      setMessage(`Vendor ${vidx + 1} saved successfully.`);
      setError(null);
    } catch {
      setError(`Error saving vendor ${vidx + 1}.`);
      setMessage(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6">
      {vendors.map((v, idx) => (
        <div key={idx} className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Vendor {idx + 1}</h2>
            <button
              type="button"
              onClick={() => saveVendor(idx)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1">Name</label>
              <input
                type="text"
                value={v.vendorName}
                onChange={e => updateField(idx, 'vendorName', e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Vendor name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={v.isOda}
                onChange={e => updateField(idx, 'isOda', e.target.checked)}
                id={`oda-${idx}`}
              />
              <label htmlFor={`oda-${idx}`}>ODA Zone</label>
            </div>
            <div>
              <label className="block mb-1">Fuel Surcharge (%)</label>
              <input
                type="number"
                min="0"
                value={v.fuelSurcharge}
                onChange={e => updateField(idx, 'fuelSurcharge', e.target.value)}
                className="w-full border rounded p-2"
                placeholder="e.g. 5"
              />
            </div>
            <div>
              <label className="block mb-1">Docket Charge</label>
              <input
                type="number"
                min="0"
                value={v.docketCharge}
                onChange={e => updateField(idx, 'docketCharge', e.target.value)}
                className="w-full border rounded p-2"
                placeholder="e.g. 50"
              />
            </div>
            <div>
              <label className="block mb-1">FOV (Insurance %)</label>
              <input
                type="number"
                min="0"
                value={v.fov}
                onChange={e => updateField(idx, 'fov', e.target.value)}
                className="w-full border rounded p-2"
                placeholder="e.g. 2.5"
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Pincodes</h3>
            {v.pincodes.map((p, pi) => (
              <input
                key={pi}
                type="text"
                value={p}
                onChange={e => updatePincode(idx, pi, e.target.value)}
                className="w-1/2 border rounded p-2 mb-2"
                placeholder="Enter pincode"
              />
            ))}
            <button
              type="button"
              onClick={() => addPincode(idx)}
              className="text-blue-600 underline"
            >
              + Add Pincode
            </button>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Zones</h3>
            {v.zones.map((z, zi) => (
              <input
                key={zi}
                type="text"
                value={z}
                onChange={e => updateZone(idx, zi, e.target.value)}
                className="w-1/2 border rounded p-2 mb-2"
                placeholder="Enter zone"
              />
            ))}
            <button
              type="button"
              onClick={() => addZone(idx)}
              className="text-blue-600 underline"
            >
              + Add Zone
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table-auto border-collapse w-full">
              <thead>
                <tr>
                  <th className="border p-2">Pincode \ Zone</th>
                  {v.zones.map((z, zi) => (
                    <th key={zi} className="border p-2">
                      {z || `Zone ${zi + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {v.pincodes.map((p, pi) => (
                  <tr key={pi}>
                    <th className="border p-2 text-left">
                      {p || `Pincode ${pi + 1}`}
                    </th>
                    {v.zones.map((_, zi) => (
                      <td key={zi} className="border p-2">
                        <input
                          type="number"
                          min="0"
                          value={v.prices[pi]?.[zi] || ''}
                          onChange={e => updatePrice(idx, pi, zi, e.target.value)}
                          className="w-full"
                          placeholder="Rate"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-red-600 mt-2">{error}</p>
          <p className="text-sm text-green-600 mt-2">{message}</p>
        </div>
      ))}

      <button
        type="button"
        onClick={addVendor}
        className="text-2xl text-blue-600 font-bold"
      >
        + Add Vendor
      </button>
    </div>
  );
};

export default AddVendors;
