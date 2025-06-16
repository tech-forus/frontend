// client/src/components/TransporterUploader.tsx
import { useState, ChangeEvent } from 'react';
import guidlines from '../assets/guidlines.jpg'; 
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AddTransporter() {
  const [transporter, setTransporter] = useState('');
  const [zoneCount, setZoneCount] = useState<number>(0);
  const [zones, setZones] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);  // ← loading state

  const navigate = useNavigate();

  const handleTransporterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTransporter(e.target.value);
  };

  const handleZoneCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10) || 0;
    setZoneCount(count);
    setZones(Array(count).fill(''));
  };

  const handleZoneNameChange = (index: number, value: string) => {
    const updated = [...zones];
    updated[index] = value;
    setZones(updated);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0].name.endsWith('.xlsx')) {
      setFile(e.target.files[0]);
    } else {
      alert('Please upload an .xlsx file only');
      e.target.value = '';
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !transporter) {
      return alert('Fill in transporter name and select a .xlsx file');
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('transporter', transporter);
    formData.append('zones', JSON.stringify(zones));
    formData.append('sheet', file);
    sessionStorage.setItem('companyName', transporter);
    sessionStorage.setItem('priceRate', JSON.stringify(zones));

    try {
      const res = await fetch('http://localhost:85000/api/admin/addtransporter', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Transporter registered successfully!`);
        navigate('/addprice');
      } else {
        throw new Error(data.message || 'Upload failed');
      }

    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = async () => {
    const res = await fetch('http://localhost:8000/api/admin/downloadtemplate');
    if (!res.ok) {
      return alert('Download failed');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pincodes_template.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Transporter Serviceability</h2>
      <div className="space-y-4">
        {/* Transporter Name */}
        <div>
          <label htmlFor="transporter" className="block font-medium mb-1">
            Transporter Name
          </label>
          <input
            id="transporter"
            type="text"
            value={transporter}
            onChange={handleTransporterChange}
            placeholder="Enter transporter name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        {/* Zone Count */}
        <div>
          <label htmlFor="zone-count" className="block font-medium mb-1">
            Number of Zones
          </label>
          <input
            id="zone-count"
            type="number"
            min={0}
            value={zoneCount}
            onChange={handleZoneCountChange}
            className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        {/* Zone Names */}
        {zones.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {zones.map((z, i) => (
              <div key={i}>
                <label htmlFor={`zone-${i}`} className="block font-medium mb-1">
                  Zone {i + 1} Name
                </label>
                <input
                  id={`zone-${i}`}
                  type="text"
                  value={z}
                  onChange={(e) => handleZoneNameChange(i, e.target.value)}
                  placeholder={`Zone ${i + 1}`}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
            ))}
          </div>
        )}

        {/* File Upload */}
        <div>
          <label htmlFor="file-upload" className="block font-medium mb-1">
            Upload Excel (.xlsx)
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx"
            onChange={handleFileSelect}
            className="block"
          />
          {file && <p className="text-sm mt-1">Selected: {file.name}</p>}
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            onClick={downloadTemplate}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-md px-4 py-2 transition"
          >
            Download Template
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || !file || !transporter}
            className={`flex-1 rounded-md px-4 py-2 text-white transition ${
              isUploading || !file || !transporter
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isUploading ? 'Uploading…' : 'Upload Sheet'}
          </button>
        </div>
      </div>

      {/* Guidelines Image */}
      <h3 className="text-lg font-semibold mt-8">Template to upload the excel file</h3>
      <img src={guidlines} alt="Guidelines" className="mt-6 w-full h-auto rounded-md shadow-md" />
    </div>
  );
}
