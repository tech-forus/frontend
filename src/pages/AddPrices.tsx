// src/components/PriceForm.tsx
import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import axios from 'axios'

interface VariableFixed {
  variable: number
  fixed: number
}

interface PriceRate {
  minWeight: number
  docketCharges: number
  fuel: number
  rovCharges: VariableFixed
  inuaranceCharges: VariableFixed
  odaCharges: VariableFixed
  codCharges: VariableFixed
  prepaidCharges: VariableFixed
  topayCharges: VariableFixed
  handlingCharges: VariableFixed
  fmCharges: VariableFixed
  appointmentCharges: VariableFixed
  divisor: number
  minCharges: number
  greenTax: number
  daccCharges: number
  miscellanousCharges: number
}

type ZoneRatesMatrix = number[][]

export default function AddPrice() {
  const [priceRate, setPriceRate] = useState<PriceRate>({
    minWeight: 0,
    docketCharges: 0,
    fuel: 0,
    rovCharges: { variable: 0, fixed: 0 },
    inuaranceCharges: { variable: 0, fixed: 0 },
    odaCharges: { variable: 0, fixed: 0 },
    codCharges: { variable: 0, fixed: 0 },
    prepaidCharges: { variable: 0, fixed: 0 },
    topayCharges: { variable: 0, fixed: 0 },
    handlingCharges: { variable: 0, fixed: 0 },
    fmCharges: { variable: 0, fixed: 0 },
    appointmentCharges: { variable: 0, fixed: 0 },
    divisor: 1,
    minCharges: 0,
    greenTax: 0,
    daccCharges: 0,
    miscellanousCharges: 0,
  })

  // Zones come from backend
  const [zoneCount, setZoneCount] = useState<number>(0)
  const [zoneRates, setZoneRates] = useState<ZoneRatesMatrix>([])
  const [loadingZones, setLoadingZones] = useState(true)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch number of zones on mount
  useEffect(() => {
    axios.get('http://localhost:8000/api/admin/gettransporter') // Adjust URL as needed
      .then(res => {
        const count = res.data.count as number
        setZoneCount(count)
        setZoneRates(Array.from({ length: count }, () => Array(count).fill(0)))
      })
      .catch(err => console.error('Failed to fetch zone count', err))
      .finally(() => setLoadingZones(false))
  }, [])

  // update numerical fields
  const handleRateChange = (
    section: keyof PriceRate,
    field: keyof VariableFixed | null,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const val = parseFloat(e.target.value) || 0
    setPriceRate(prev => {
      if (field) {
        return { ...prev, [section]: { ...(prev[section] as VariableFixed), [field]: val } } as PriceRate
      }
      return { ...prev, [section]: val } as PriceRate
    })
  }

  const handleCellChange = (i: number, j: number, val: number) => {
    setZoneRates(prev => {
      const next = prev.map(row => [...row])
      next[i][j] = val
      return next
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const zrObj: Record<string, Record<string, number>> = {}
    for (let i = 0; i < zoneCount; i++) {
      const rowLabel = `Z${i + 1}`
      zrObj[rowLabel] = {}
      for (let j = 0; j < zoneCount; j++) {
        zrObj[rowLabel][`Z${j + 1}`] = zoneRates[i][j] || 0
      }
    }

    const payload = { priceRate, zoneRates: zrObj }
    try {
      setLoading(true)
      await axios.post('/api/prices', payload)
      alert('✅ Saved successfully!')
      setPriceRate(prev => ({ ...prev }))
      setZoneRates(Array.from({ length: zoneCount }, () => Array(zoneCount).fill(0)))
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-white border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-indigo-600 py-4 px-8">
          <h2 className="text-2xl font-semibold text-white text-center">Add Price Configuration</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          {/* Basic Rates */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Basic Rates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {['minWeight','docketCharges','fuel'].map(field => (
                <div key={field}>
                  <label className="block text-sm text-gray-600 mb-2 capitalize">
                    {field.replace(/([A-Z])/g,' $1')}
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    value={(priceRate as any)[field]}
                    onChange={e => handleRateChange(field as any,null,e)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Variable/Fixed Sections */}
          {(
            ['rovCharges','inuaranceCharges','odaCharges','codCharges','prepaidCharges','topayCharges','handlingCharges','fmCharges','appointmentCharges'] as Array<keyof Omit<PriceRate,'minWeight'|'docketCharges'|'fuel'|'divisor'|'minCharges'|'greenTax'|'daccCharges'|'miscellanousCharges'>>
          ).map(section => (
            <div key={section}>
              <h3 className="text-lg font-medium text-gray-800 mb-3 capitalize">{section.replace(/([A-Z])/g,' $1')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(['variable','fixed'] as (keyof VariableFixed)[]).map(sub => (
                  <div key={sub}>
                    <label className="block text-sm text-gray-600 mb-2 capitalize">{sub}</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={(priceRate[section] as VariableFixed)[sub]}
                      onChange={e => handleRateChange(section,sub,e)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Other Charges */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Other Charges</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['divisor','minCharges','greenTax','daccCharges','miscellanousCharges'].map(field => (
                <div key={field}>
                  <label className="block text-sm text-gray-600 mb-2 capitalize">{field.replace(/([A-Z])/g,' $1')}</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={(priceRate as any)[field]}
                    onChange={e => handleRateChange(field as any,null,e)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Zone Rates Table */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Zone Rates</h3>
            {loadingZones ? (
              <p className="text-gray-500">Loading zones...</p>
            ) : (
              zoneCount > 0 && (
                <div className="overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">From \ To</th>
                        {Array.from({ length: zoneCount }, (_, i) => (
                          <th key={i} className="px-6 py-3 text-sm font-medium text-gray-700">Z{i+1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {zoneRates.map((row, i) => (
                        <tr key={i}>
                          <td className="px-6 py-3 text-sm font-medium text-gray-700">Z{i+1}</td>
                          {row.map((val, j) => (
                            <td key={j} className="px-4 py-2">
                              <input
                                type="number"
                                className="w-full bg-white border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                value={val}
                                onChange={e => handleCellChange(i,j,parseFloat(e.target.value) || 0)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition"
          >
            {loading ? 'Saving…' : 'Save Price Config'}
          </button>
        </form>
      </div>
    </div>
  )
}
