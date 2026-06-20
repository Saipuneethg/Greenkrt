import { useState, useEffect } from 'react'

export default function SoilCropManagement() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReq, setSelectedReq] = useState(null)
  
  // Results inputs
  const [score, setScore] = useState(75)
  const [ph, setPh] = useState(6.5)
  const [carbon, setCarbon] = useState(0.5)
  const [nitrogen, setNitrogen] = useState(250)
  const [phosphorus, setPhosphorus] = useState(22)
  const [potassium, setPotassium] = useState(180)
  const [recs, setRecs] = useState('Apply 20kg Urea per acre to boost Nitrogen.\nSoil is slightly acidic; consider adding 50kg Lime.\nExcellent condition for growing Cotton or Chilli.')

  const regions = [
    { name: 'Guntur, AP', primaryCrop: 'Chilli, Cotton', soilTypes: 'Black Cotton, Red', activeFarmers: 4200 },
    { name: 'Krishna, AP', primaryCrop: 'Paddy, Sugarcane', soilTypes: 'Alluvial, Black', activeFarmers: 3800 },
    { name: 'Nalgonda, TS', primaryCrop: 'Paddy, Sweet Orange', soilTypes: 'Red, Chalky', activeFarmers: 2100 },
  ]

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/soil-tests', {
        headers: {
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
      })
      if (res.ok) {
        const data = await res.json()
        setRequests(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!selectedReq) return

    try {
      const res = await fetch(`http://localhost:5000/api/soil-tests/${selectedReq.requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
        body: JSON.stringify({
          status: 'Completed',
          score,
          ph,
          carbon,
          nitrogen,
          phosphorus,
          potassium,
          recommendations: recs.split('\n').filter(r => r.trim() !== ''),
        }),
      })

      if (res.ok) {
        alert('Soil test completed successfully!')
        setSelectedReq(null)
        fetchRequests()
      } else {
        alert('Failed to update soil test request.')
      }
    } catch {
      alert('Error connecting to server.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#161d16]">Soil & Crop Intelligence</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Farmer Soil Test Requests */}
        <div className="bg-white border border-[#bccbb9] rounded-lg p-5 lg:col-span-2">
          <h2 className="font-bold text-[#161d16] mb-4">Farmer Soil Test Requests</h2>
          {loading ? (
            <p className="text-sm text-[#3d4a3d]">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-[#3d4a3d]">No requests found.</p>
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.requestId} className="p-3 border rounded-lg flex justify-between items-center bg-[#fcfcfc] hover:border-[#006e2f] transition-all">
                  <div>
                    <h3 className="font-bold text-sm text-[#161d16]">{req.requestId} • {req.user?.firstName} {req.user?.lastName}</h3>
                    <p className="text-xs text-[#3d4a3d]">Location: {req.farmLocation} | Crop Planned: {req.cropPlanned || 'N/A'}</p>
                    {req.reportUrl && (
                      <a href={`http://localhost:5000${req.reportUrl}`} target="_blank" rel="noreferrer" className="text-xs text-[#006e2f] font-semibold hover:underline mt-1 inline-block">
                        View Uploaded Report
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${req.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{req.status}</span>
                    {req.status !== 'Completed' && (
                      <button 
                        onClick={() => setSelectedReq(req)}
                        className="text-xs font-bold text-white bg-[#006e2f] hover:bg-[#005a26] px-3 py-1 rounded"
                      >
                        Enter Results
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Regional Profiles */}
        <div className="bg-white border border-[#bccbb9] rounded-lg p-5">
          <h2 className="font-bold text-[#161d16] mb-4">Regional Profiles</h2>
          <div className="space-y-4">
            {regions.map(r => (
              <div key={r.name} className="p-4 border border-[#bccbb9]/50 rounded-lg bg-[#f3fcef]">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#161d16]">{r.name}</h3>
                  <span className="text-xs font-semibold text-[#006e2f] bg-[#cfe6c9] px-2 py-1 rounded">{r.activeFarmers} Farmers</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[#3d4a3d] text-xs uppercase">Primary Crops</span>
                    <div className="font-semibold">{r.primaryCrop}</div>
                  </div>
                  <div>
                    <span className="text-[#3d4a3d] text-xs uppercase">Soil Types</span>
                    <div className="font-semibold">{r.soilTypes}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enter Results Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1a1c1c]">Enter Soil Test Results ({selectedReq.requestId})</h2>
              <button onClick={() => setSelectedReq(null)} className="text-[#40493d] hover:text-[#1a1c1c]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Soil Health Score (%)</label>
                  <input required type="number" value={score} onChange={e => setScore(e.target.value)} className="w-full h-9 px-3 border rounded focus:outline-none focus:border-[#0d631b]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">pH Level</label>
                  <input required type="number" step="0.1" value={ph} onChange={e => setPh(e.target.value)} className="w-full h-9 px-3 border rounded focus:outline-none focus:border-[#0d631b]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Organic Carbon (%)</label>
                  <input required type="number" step="0.01" value={carbon} onChange={e => setCarbon(e.target.value)} className="w-full h-9 px-3 border rounded focus:outline-none focus:border-[#0d631b]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Nitrogen (kg/ac)</label>
                  <input required type="number" value={nitrogen} onChange={e => setNitrogen(e.target.value)} className="w-full h-9 px-3 border rounded focus:outline-none focus:border-[#0d631b]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Phosphorus (kg/ac)</label>
                  <input required type="number" value={phosphorus} onChange={e => setPhosphorus(e.target.value)} className="w-full h-9 px-3 border rounded focus:outline-none focus:border-[#0d631b]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Potassium (kg/ac)</label>
                  <input required type="number" value={potassium} onChange={e => setPotassium(e.target.value)} className="w-full h-9 px-3 border rounded focus:outline-none focus:border-[#0d631b]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">AI Recommendations (one per line)</label>
                <textarea required rows="4" value={recs} onChange={e => setRecs(e.target.value)} className="w-full p-2 border rounded focus:outline-none focus:border-[#0d631b] text-sm"></textarea>
              </div>
              <button type="submit" className="w-full h-11 bg-[#006e2f] hover:bg-[#005a26] text-white font-bold text-sm uppercase tracking-wider rounded transition-colors mt-2">
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
