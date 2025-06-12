import React, { useState } from 'react';

const Onboarding: React.FC = () => {
  const [vendor, setVendor] = useState('');

  // State for additional charge fields
  const [charges, setCharges] = useState({
    docket: '',
    fuelSurcharge: '',
    fovCharge: '',
    collectionCharge: '',
    greenTax: '',
    handlingCharge: '',
    daccCharge: '',
    miscCharge: ''
  });

  // Initialize a 14x14 matrix for zone-to-zone rates
  const initialMatrix = Array.from({ length: 14 }, () => Array(14).fill(''));
  const [matrix, setMatrix] = useState(initialMatrix);

  // Define lowercase zone labels
  const zoneLabels = Array.from({ length: 14 }, (_, idx) => `Z${idx + 1}`);

  // Handlers
  const handleChargeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCharges(prev => ({ ...prev, [name]: value }));
  };

  const handleMatrixChange = (i: number, j: number, value: string) => {
    setMatrix(prev => {
      const copy = prev.map(row => [...row]);
      copy[i][j] = value;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Build rates object: { z1: { z1: val, z2: val }, z2: {...} }
    const rates: Record<string, Record<string, string>> = {};
    matrix.forEach((row, i) => {
      const from = zoneLabels[i];
      rates[from] = row.reduce((acc, val, j) => {
        acc[zoneLabels[j]] = val;
        return acc;
      }, {} as Record<string, string>);
    });

    const payload = { vendor, charges, rates };
    const jsonString = JSON.stringify(payload, null, 2);
    console.log('Pricing JSON:', jsonString);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-4xl w-full bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
          Vendor Pricing Matrix
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vendor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Vendor</label>
            <input
              type="text"
              value={vendor}
              onChange={e => setVendor(e.target.value)}
              placeholder="Enter vendor name"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Additional Charges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(charges).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 capitalize">{key}</label>
                <input
                  type="number"
                  name={key}
                  value={value}
                  onChange={handleChargeChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            ))}
          </div>

          {/* 14x14 Zone Matrix */}
          <div className="overflow-auto">
            <table className="min-w-full table-fixed border-collapse">
              <thead>
                <tr>
                  <th className="border px-2 py-1 bg-gray-100 text-sm">zone</th>
                  {zoneLabels.map(label => (
                    <th key={label} className="border px-2 py-1 bg-gray-100 text-sm">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1 bg-gray-100 text-sm">{zoneLabels[i]}</td>
                    {row.map((cell, j) => (
                      <td key={j} className="border px-1 py-1">
                        <input
                          type="number"
                          value={cell}
                          onChange={e => handleMatrixChange(i, j, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Export JSON
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
