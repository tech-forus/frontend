import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type SuggestionList = string[][];

type TransporterResponse = {
  success: boolean;
  data: { companyName: string; _id: string }[];
};

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState<string[]>(['']);
  const [suggestionsList, setSuggestionsList] = useState<SuggestionList>([[]]);
  const [validVendors, setValidVendors] = useState<boolean[]>([false]);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem('vendorsOnboarded');
    if (done === 'true') {
      navigate('/compare');
      return;
    }
    setInitialCheckDone(true);
  }, [navigate]);

  const handleInputChange = (idx: number, event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const updatedVendors = [...vendors];
    updatedVendors[idx] = raw;
    setVendors(updatedVendors);

    const updatedValidity = [...validVendors];
    updatedValidity[idx] = false;
    setValidVendors(updatedValidity);

    if (raw.trim() === '') {
      const updatedSug = [...suggestionsList];
      updatedSug[idx] = [];
      setSuggestionsList(updatedSug);
      return;
    }

    axios
      .get<TransporterResponse>('http://localhost:8000/api/transporter/gettransporter', {
        params: { search: raw.trim() },
      })
      .then((response) => {
        const data = response.data.data;
        if (Array.isArray(data)) {
          const rawLower = raw.trim().toLowerCase();
          const sorted = data
            .map((v) => v.companyName)
            .sort((a, b) => {
              const aStarts = a.toLowerCase().startsWith(rawLower);
              const bStarts = b.toLowerCase().startsWith(rawLower);
              if (aStarts && !bStarts) return -1;
              if (!aStarts && bStarts) return 1;
              return a.localeCompare(b);
            });

          const updatedSug = [...suggestionsList];
          updatedSug[idx] = sorted;
          setSuggestionsList(updatedSug);
        }
      });
  };

  const handleSuggestionClick = (idx: number, choice: string) => {
    const updatedVendors = [...vendors];
    updatedVendors[idx] = choice;
    setVendors(updatedVendors);

    const updatedSug = [...suggestionsList];
    updatedSug[idx] = [];
    setSuggestionsList(updatedSug);

    const updatedValidity = [...validVendors];
    updatedValidity[idx] = true;
    setValidVendors(updatedValidity);
  };

  const handleBlur = (idx: number) => {
    const val = vendors[idx].trim();
    if (val === '') return;

    axios
      .get<TransporterResponse>('http://localhost:8000/api/transporter/gettransporter', {
        params: { search: val },
      })
      .then((response) => {
        const validNames = response.data.data.map((v) => v.companyName);
        const updatedValidity = [...validVendors];
        updatedValidity[idx] = validNames.includes(val);
        setValidVendors(updatedValidity);
      })
      .catch(() => {
        const updatedValidity = [...validVendors];
        updatedValidity[idx] = false;
        setValidVendors(updatedValidity);
      });
  };

  const addField = () => {
    setVendors((prev) => [...prev, '']);
    setSuggestionsList((prev) => [...prev, []]);
    setValidVendors((prev) => [...prev, false]);
  };

  const removeField = (idx: number) => {
    if (vendors.length === 1) return;
    setVendors((prev) => prev.filter((_, i) => i !== idx));
    setSuggestionsList((prev) => prev.filter((_, i) => i !== idx));
    setValidVendors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const trimmed = vendors.map((v) => v.trim()).filter((_, i) => validVendors[i]);

    if (trimmed.length === 0) {
      return;
    }

    try {
      const transporterIds: string[] = [];

      for (const name of trimmed) {
        const res = await axios.get<TransporterResponse>(
          'http://localhost:8000/api/transporter/gettransporter',
          {
            params: { search: name },
          }
        );

        const match = res.data.data.find((t) => t.companyName === name);
        if (match) {
          transporterIds.push(match._id);
        }
      }

      if (transporterIds.length === 0) {
        return;
      }

      const customerId = localStorage.getItem('customerId');
      if (!customerId) {
        console.error('No customerId found in localStorage');
        return;
      }

      await axios.put(`http://localhost:8000/api/customers/${customerId}/transporters`, {
        transporterIds,
      });

      localStorage.setItem('vendorsOnboarded', 'true');
      navigate('/compare');
    } catch (error) {
      console.error('Error during onboarding submit:', error);
    }
  };

  if (!initialCheckDone) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
          Welcome! Let’s select your vendors
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Start typing and pick the logistics partners you currently use so we can compare pricing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {vendors.map((vendor, idx) => {
            const isInvalidField = touched && vendor.trim() !== '' && !validVendors[idx];

            return (
              <div key={idx} className="relative">
                <div className="flex items-center">
                  <input
                    type="text"
                    autoComplete="off"
                    value={vendor}
                    onChange={(e) => handleInputChange(idx, e)}
                    onBlur={() => handleBlur(idx)}
                    placeholder="Search vendor..."
                    className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                      isInvalidField ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  {vendors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      aria-label={`Remove vendor field ${idx + 1}`}
                    >
                      &times;
                    </button>
                  )}
                </div>

                {suggestionsList[idx].length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-md max-h-40 overflow-y-auto">
                    {suggestionsList[idx].map((option) => (
                      <li
                        key={option}
                        onMouseDown={() => handleSuggestionClick(idx, option)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                )}

                {isInvalidField && (
                  <p className="mt-1 text-sm text-red-500">
                    Please choose a valid vendor from the list.
                  </p>
                )}
              </div>
            );
          })}

          <div className="text-sm text-indigo-600 mb-2">
            <a href="/vendor-request" className="hover:underline">
              Can’t find your vendor?
            </a>
          </div>

          <button
            type="button"
            onClick={addField}
            className="w-full flex items-center justify-center py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition"
          >
            + Add another vendor
          </button>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition mt-2"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
