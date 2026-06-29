import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useCart } from '../../context/CartContext'

export default function SoilTestAI() {
  const { t } = useLanguage()
  const { addToCart, cartCount, toggleCart } = useCart()
  const [requests, setRequests] = useState([])
  const [soilType, setSoilType] = useState('')
  const [prevCrop, setPrevCrop] = useState('')
  const [cropPlanned, setCropPlanned] = useState('')
  const [reportFile, setReportFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeReport, setActiveReport] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }

  const fetchSoilTests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/soil-tests', {
        headers: {
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
      })
      if (res.ok) {
        const data = await res.json()
        setRequests(data.slice(0, 10))
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchSoilTests()
  }, [])



  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reportFile) {
      showToast(t('ai_soil.select_report'))
      return
    }
    setLoading(true)

    try {
      let reqBody = new FormData();
      reqBody.append('soilType', soilType);
      reqBody.append('prevCrop', prevCrop);
      reqBody.append('cropPlanned', cropPlanned);
      reqBody.append('reportFile', reportFile);

      const res = await fetch('http://localhost:5000/api/soil-tests', {
        method: 'POST',
        headers: {
          'x-auth-token': sessionStorage.getItem('greenkrt_token')
        },
        body: reqBody,
      })

      if (res.ok) {
        setSoilType('')
        setPrevCrop('')
        setCropPlanned('')
        setReportFile(null)
        await fetchSoilTests()
        const data = await res.json()
        setActiveReport(data)
      } else {
        const errData = await res.json()
        showToast(errData.message || t('ai_soil.analysis_failed'))
      }
    } catch {
      showToast(t('ai_soil.server_error'))
    } finally {
      setLoading(false)
    }
  }

  const closeReport = () => {
    setActiveReport(null)
  }

  const handleDeleteReport = async (requestId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/soil-tests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': sessionStorage.getItem('greenkrt_token')
        }
      });
      if (res.ok) {
        setRequests(requests.filter(req => req.requestId !== requestId));
        if (activeReport?.requestId === requestId) {
          setActiveReport(null);
        }
        showToast('Report deleted successfully');
      } else {
        showToast('Failed to delete report');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting report');
    } finally {
      setConfirmDeleteId(null);
    }
  }

  const handleAddToCart = (item) => {
    addToCart({
      id: item.productId,
      name: item.productName,
      price: item.productPrice || 500, // fallback price
      image: '🌿'
    });
    showToast(`Added ${item.productName} to cart!`);
  }

  const phaseTitles = {
    sowing: 'Phase 1: Sowing (1 to 4 Weeks)',
    vegetative: 'Phase 2: Vegetative (4 to 8 Weeks)',
    flowering: 'Phase 3: Flowering (8 to 12 Weeks)',
    fruiting: 'Phase 4: Fruiting (12+ Weeks)'
  };

  if (activeReport) {
    const { results } = activeReport
    return (
      <div className="max-w-4xl mx-auto flex flex-col bg-white rounded-xl shadow-lg border border-[#bfcaba] overflow-hidden">
        <div className="bg-[#0d631b] text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined">analytics</span>
              {t('ai_soil.report_title')}
            </h2>
            <p className="text-xs text-white/80">{t('ai_soil.report_id')} {activeReport.requestId} • {activeReport.soilType ? (t('soil_types.' + activeReport.soilType.toLowerCase().replace(/ /g, '_')) !== 'soil_types.' + activeReport.soilType.toLowerCase().replace(/ /g, '_') ? t('soil_types.' + activeReport.soilType.toLowerCase().replace(/ /g, '_')) : activeReport.soilType) : t('ai_soil.unknown_soil')}</p>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={toggleCart} className="relative text-white hover:text-[#d3e3cd] transition-colors mr-2 flex items-center">
              <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#ffb957] text-[#643f00] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#0d631b]">
                  {cartCount}
                </span>
              )}
            </button>

            {activeReport.reportUrl && (
              <a href={`http://localhost:5000${activeReport.reportUrl}`} target="_blank" rel="noreferrer" className="text-sm font-bold bg-white text-[#0d631b] px-3 py-1.5 rounded hover:bg-[#eaf4e7] transition-colors">
                {t('ai_soil.view_orig_pdf')}
              </a>
            )}
            <button onClick={closeReport} className="text-white hover:text-[#d3e3cd]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-[#f8fcf7]">
          <div className="flex justify-center mb-8">
            <div className="text-center">
              <div className="text-5xl font-black text-[#0d631b] mb-1">{results?.score}%</div>
              <div className="text-sm font-bold text-[#40493d] uppercase tracking-wider">{t('ai_soil.overall_score')}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-[#bfcaba] text-center shadow-sm">
              <div className="text-2xl font-bold text-[#1a1c1c]">{results?.ph}</div>
              <div className="text-xs text-[#40493d] font-semibold mt-1">{t('ai_soil.ph_level')}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#bfcaba] text-center shadow-sm">
              <div className="text-2xl font-bold text-[#1a1c1c]">{results?.carbon}%</div>
              <div className="text-xs text-[#40493d] font-semibold mt-1">{t('ai_soil.org_carbon')}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#bfcaba] text-center shadow-sm">
              <div className="text-2xl font-bold text-[#1a1c1c]">{results?.nitrogen}</div>
              <div className="text-xs text-[#40493d] font-semibold mt-1">{t('ai_soil.nitrogen')}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#bfcaba] text-center shadow-sm">
              <div className="text-2xl font-bold text-[#1a1c1c]">{results?.phosphorus}</div>
              <div className="text-xs text-[#40493d] font-semibold mt-1">{t('ai_soil.phosphorus')}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#bfcaba] text-center shadow-sm">
              <div className="text-2xl font-bold text-[#1a1c1c]">{results?.potassium}</div>
              <div className="text-xs text-[#40493d] font-semibold mt-1">{t('ai_soil.potassium')}</div>
            </div>
          </div>

          {results?.todaysAction && (
            <div className="bg-[#eaf4e7] rounded-xl border border-[#0d631b] p-6 shadow-sm mb-6 flex items-start gap-4">
              <span className="material-symbols-outlined text-[#0d631b] text-4xl">task_alt</span>
              <div>
                <h3 className="font-bold text-lg text-[#0d631b] mb-1">Today's Action</h3>
                <p className="text-[#1a1c1c]">{results.todaysAction}</p>
              </div>
            </div>
          )}

          {results?.phases && (
            <div className="bg-white rounded-xl border border-[#bfcaba] p-6 shadow-sm">
              <h3 className="font-bold text-lg text-[#1a1c1c] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0d631b]">calendar_month</span>
                4-Phase Fertilizer Schedule
              </h3>
              <div className="space-y-6">
                {['sowing', 'vegetative', 'flowering', 'fruiting'].map(phase => (
                  <div key={phase} className="border-l-2 border-[#0d631b] pl-4 relative">
                    <div className="absolute w-3 h-3 bg-[#0d631b] rounded-full -left-[7px] top-1.5"></div>
                    <h4 className="font-bold text-[#1a1c1c] capitalize mb-3 text-lg">{phaseTitles[phase]}</h4>
                    <div className="space-y-3">
                      {results.phases[phase] && results.phases[phase].map((item, idx) => (
                        <div key={idx} className="bg-[#f8fcf7] border border-[#bfcaba] p-4 rounded-lg">
                          <div className="font-bold text-[#0d631b] text-base mb-2 flex justify-between items-start">
                            <span>{item.productId ? (t('products.' + item.productId) !== 'products.' + item.productId ? t('products.' + item.productId) : item.productName) : item.productName}</span>
                            {item.productId && item.productId !== "..." && (
                              <button onClick={() => handleAddToCart(item)} className="bg-[#0d631b] hover:bg-[#0a4a14] text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                                <span className="material-symbols-outlined text-[14px]">shopping_cart</span>
                                Add to Cart
                              </button>
                            )}
                          </div>
                          <div className="text-sm text-[#40493d]">{item.reason}</div>
                        </div>
                      ))}
                      {(!results.phases[phase] || results.phases[phase].length === 0) && (
                        <p className="text-sm text-[#707a6c]">No specific fertilizers recommended for this phase.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!results?.phases && (
            <div className="bg-white rounded-xl border border-[#bfcaba] p-6 shadow-sm">
              <h3 className="font-bold text-lg text-[#1a1c1c] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0d631b]">lightbulb</span>
                {t('ai_soil.ai_rec')}
              </h3>
              <ul className="space-y-3">
                {results?.recommendations?.map((rec, i) => (
                  <li key={i} className="flex gap-3 text-[#1a1c1c]">
                    <span className="material-symbols-outlined text-[#0d631b] shrink-0 text-[20px] mt-0.5">check_circle</span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
                {!results?.recommendations?.length && (
                  <li className="text-[#40493d]">{t('ai_soil.no_rec')}</li>
                )}
              </ul>
            </div>
          )}
        </div>
        
        {/* Custom Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0d631b] text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 animate-bounce z-50 transition-all">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            {toastMessage}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a1c1c] mb-2">{t('soil_test.title')}</h1>
        <p className="text-[#40493d] text-base">{t('ai_soil.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Upload Form */}
        <div className="bg-white rounded-2xl border border-[#bfcaba] shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#f0f6ec] p-5 border-b border-[#bfcaba]">
            <h3 className="font-bold text-xl text-[#0d631b] flex items-center gap-2">
              <span className="material-symbols-outlined">upload_file</span>
              {t('ai_soil.upload_title')}
            </h3>
            <p className="text-sm text-[#40493d] mt-1">{t('ai_soil.upload_desc')}</p>
          </div>
          <div className="p-6 flex-1">
            <form onSubmit={handleSubmit} className="space-y-5 h-full flex flex-col">
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('ai_soil.report_file')} <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-[#bfcaba] rounded-xl p-6 text-center bg-[#fafdf9] hover:bg-[#f0f6ec] transition-colors cursor-pointer relative">
                  <input required type="file" onChange={e => setReportFile(e.target.files[0])} accept=".pdf,image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <span className="material-symbols-outlined text-[#0d631b] text-4xl mb-2">cloud_upload</span>
                  <p className="text-sm font-bold text-[#1a1c1c]">{reportFile ? reportFile.name : t('ai_soil.click_drag')}</p>
                  <p className="text-xs text-[#40493d] mt-1">{t('ai_soil.supports')}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">{t('ai_soil.soil_type')}</label>
                <select value={soilType} onChange={e => setSoilType(e.target.value)} className="w-full h-11 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b] focus:ring-1 focus:ring-[#0d631b] bg-white text-[#1a1c1c]">
                  <option value="">{t('ai_soil.select_soil')}</option>
                  <option value="Black Cotton Soil">Black Cotton Soil</option>
                  <option value="Red Soil">Red Soil</option>
                  <option value="Alluvial Soil">Alluvial Soil</option>
                  <option value="Laterite Soil">Laterite Soil</option>
                  <option value="Sandy Soil">Sandy Soil</option>
                  <option value="Clayey Soil">Clayey Soil</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">{t('ai_soil.prev_crop')}</label>
                  <input value={prevCrop} onChange={e => setPrevCrop(e.target.value)} type="text" placeholder="e.g. Rice" className="w-full h-11 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b] focus:ring-1 focus:ring-[#0d631b]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">{t('ai_soil.planned_crop')}</label>
                  <input value={cropPlanned} onChange={e => setCropPlanned(e.target.value)} type="text" placeholder="e.g. Cotton" className="w-full h-11 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b] focus:ring-1 focus:ring-[#0d631b]" />
                </div>
              </div>
              
              <div className="mt-auto pt-4">
                <button disabled={loading} type="submit" className="w-full h-[52px] bg-[#0d631b] hover:bg-[#0a4a14] text-white font-bold text-base uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                  {loading ? t('ai_soil.analyzing') : <><span className="material-symbols-outlined">auto_awesome</span> {t('ai_soil.analyze_btn')}</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Past Analyses */}
        <div className="bg-white rounded-2xl border border-[#bfcaba] shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#fcfcfc] p-5 border-b border-[#bfcaba]">
            <h3 className="font-bold text-xl text-[#1a1c1c] flex items-center gap-2">
              <span className="material-symbols-outlined">history</span>
              {t('ai_soil.your_analyses')}
            </h3>
          </div>
          <div className="p-5 flex-1 overflow-y-auto bg-[#fafdf9]">
            {requests.length === 0 ? (
              <div className="text-center text-[#40493d] mt-10">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">science</span>
                <p>{t('ai_soil.no_analyses')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => (
                  <div key={req.requestId} className="bg-white border border-[#bfcaba] p-4 rounded-xl shadow-sm hover:border-[#0d631b] transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-[#1a1c1c]">{t('ai_soil.analysis')} {req.requestId}</h4>
                        <p className="text-xs text-[#40493d] mt-0.5">{req.soilType ? (t('soil_types.' + req.soilType.toLowerCase().replace(/ /g, '_')) !== 'soil_types.' + req.soilType.toLowerCase().replace(/ /g, '_') ? t('soil_types.' + req.soilType.toLowerCase().replace(/ /g, '_')) : req.soilType) : t('ai_soil.unknown_soil')}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${req.status === 'Completed' ? 'bg-green-100 text-green-800 border border-[#cfe6c9]' : (req.status === 'Rejected' ? 'bg-red-100 text-red-800 border border-[#ffdad6]' : 'bg-yellow-100 text-yellow-800 border border-[#fef3c7]')}`}>
                          {req.status}
                        </span>
                        {req.status === 'Completed' && (
                          <div className="bg-[#e8f3e5] px-2 py-1 rounded text-xs font-bold text-[#0d631b] border border-[#cfe6c9] mt-1">
                            {t('ai_soil.score')} {req.results?.score}%
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      {confirmDeleteId === req.requestId ? (
                        <div className="flex-1 flex gap-2">
                          <button 
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1 h-9 bg-[#f3f3f3] text-[#40493d] hover:bg-[#e2e2e2] text-xs font-bold uppercase rounded flex items-center justify-center transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleDeleteReport(req.requestId)}
                            className="flex-1 h-9 bg-[#ba1a1a] text-white hover:bg-[#93000a] text-xs font-bold uppercase rounded flex items-center justify-center transition-colors shadow-sm"
                          >
                            Confirm Delete
                          </button>
                        </div>
                      ) : (
                        <>
                          {req.status === 'Completed' && (
                            <button 
                              onClick={() => setActiveReport(req)}
                              className="flex-1 h-9 bg-[#0d631b] hover:bg-[#0a4a14] text-white text-xs font-bold uppercase rounded flex items-center justify-center gap-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">analytics</span> {t('ai_soil.view_report')}
                            </button>
                          )}
                          <button 
                            onClick={() => setConfirmDeleteId(req.requestId)}
                            className={`h-9 bg-[#fff0f0] border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffdad6] rounded flex items-center justify-center transition-colors shrink-0 ${req.status === 'Completed' ? 'w-10' : 'flex-1 font-bold text-xs uppercase'}`}
                            title="Delete Report"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            {req.status !== 'Completed' && <span className="ml-1">Delete Request</span>}
                          </button>
                          {req.status === 'Completed' && req.reportUrl && (
                            <a 
                              href={`http://localhost:5000${req.reportUrl}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="px-3 h-9 border border-[#0d631b] text-[#0d631b] hover:bg-[#f0f6ec] text-xs font-bold uppercase rounded flex items-center justify-center transition-colors"
                            >
                              {t('ai_soil.view_pdf')}
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
