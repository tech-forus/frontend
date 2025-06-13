import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

interface RatesPayload {
  vendorName: string;
  rates: {
    zones: string[];
    matrix: string[][];
  };
}

const AddTransporter: React.FC = () => {
  const [vendorName, setVendorName] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [zones, setZones] = useState<string[]>(['Zone A', 'Zone B']);
  const [matrix, setMatrix] = useState<string[][]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize empty matrix when zones change
  useEffect(() => {
    const size = zones.length;
    const emptyMatrix: string[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => '')
    );
    setMatrix(emptyMatrix);
  }, [zones]);

  const downloadTemplate = () => {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const header = ['From Zone', ...zones];
    const data = zones.map(rowZone => [rowZone, ...zones.map(() => '')]);
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    XLSX.utils.book_append_sheet(wb, ws, 'Rates');
    XLSX.writeFile(wb, `${vendorName || 'vendor'}_template.xlsx`);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setUploadFile(file);
  };

  const uploadTemplate = async () => {
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('vendorName', vendorName);

    try {
      await axios.post('/api/transporters/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('File uploaded successfully');
      setError(null);
    } catch (err) {
      setError('Upload failed');
      setMessage(null);
    }
  };

  const addZone = () => {
    setZones(prev => [...prev, `Zone ${prev.length + 1}`]);
  };

  const handleZoneNameChange = (idx: number, value: string) => {
    setZones(prev => prev.map((z, i) => (i === idx ? value : z)));
  };

  const handlePriceChange = (row: number, col: number, value: string) => {
    setMatrix(prev => {
      const newMatrix = prev.map(rowArr => [...rowArr]);
      newMatrix[row][col] = value;
      return newMatrix;
    });
  };

  const saveManual = async () => {
    const payload: RatesPayload = { vendorName, rates: { zones, matrix } };
    try {
      await axios.post('/api/transporters/manual', payload);
      setMessage('Rates saved');
      setError(null);
    } catch (err) {
      setError('Save failed');
      setMessage(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Add Vendor</h1>

      <div className="mb-4">
        <label className="block mb-1">Vendor Name</label>
        <input
          type="text"
          value={vendorName}
          onChange={e => setVendorName(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Enter vendor name"
        />
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          type="button"
          onClick={downloadTemplate}
          disabled={!vendorName}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Download Format
        </button>

        <div>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="mb-2"
          />
          <button
            type="button"
            onClick={uploadTemplate}
            disabled={!uploadFile}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload Format
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Or add details manually:</label>
        <select
          value={manualMode ? 'manual' : ''}
          onChange={() => setManualMode(prev => !prev)}
          className="w-full border rounded p-2"
        >
          <option value="">-- Select --</option>
          <option value="manual">Manual Entry</option>
        </select>
      </div>

      {manualMode && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Zones & Rates</h2>
          <button
            type="button"
            onClick={addZone}
            className="mb-4 text-blue-600 underline"
          >
            + Add Zone
          </button>

          <div className="overflow-auto">
            <table className="table-auto border-collapse w-full">
              <thead>
                <tr>
                  <th className="border p-2">From / To</th>
                  {zones.map((z, i) => (
                    <th key={i} className="border p-2">
                      <input
                        type="text"
                        value={z}
                        onChange={e => handleZoneNameChange(i, e.target.value)}
                        className="w-full"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {zones.map((rowZone, r) => (
                  <tr key={r}>
                    <th className="border p-2">{rowZone}</th>
                    {zones.map((_, c) => (
                      <td key={c} className="border p-2">
                        <input
                          type="number"
                          value={matrix[r]?.[c] || ''}
                          onChange={e => handlePriceChange(r, c, e.target.value)}
                          className="w-full"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={saveManual}
            className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}
      {message && <p className="text-green-600 mt-4">{message}</p>}
    </div>
  );
};

export default AddTransporter;
