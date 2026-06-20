import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../context/LanguageContext'

export default function SoilTestAI() {
  const { t } = useLanguage()
  const [requests, setRequests] = useState([])
  const [soilType, setSoilType] = useState('')
  const [prevCrop, setPrevCrop] = useState('')
  const [cropPlanned, setCropPlanned] = useState('')
  const [reportFile, setReportFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeChatReq, setActiveChatReq] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const messagesEndRef = useRef(null)

  const fetchSoilTests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/soil-tests', {
        headers: {
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
      })
      if (res.ok) {
        const data = await res.json()
        // Since we removed Pending, all should be Completed
        setRequests(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchSoilTests()
  }, [])

  useEffect(() => {
    if (activeChatReq && chatMessages.length === 0) {
      setChatMessages([
        { sender: 'ai', text: `Hi! I'm GreenKrt AI. I've analyzed your report. Your soil score is ${activeChatReq.results?.score}%. How can I help you understand these results?` }
      ])
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChatReq, chatMessages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reportFile) {
      alert("Please select a soil lab report to upload.")
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
        setActiveChatReq(data)
      } else {
        const errData = await res.json()
        alert(errData.message || 'Analysis failed. Please try again.')
      }
    } catch {
      alert('Error connecting to server.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMsg = { sender: 'user', text: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')

    // Mock AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "Based on the nutrient profile, I recommend adding 20kg of Urea per acre. This will help with the planned crop. Any other questions?" 
      }])
    }, 1500)
  }

  const closeChat = () => {
    setActiveChatReq(null)
    setChatMessages([])
  }

  if (activeChatReq) {
    return (
      <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white rounded-xl shadow-lg border border-[#bfcaba] overflow-hidden">
        <div className="bg-[#0d631b] text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined">smart_toy</span>
              GreenKrt Agronomy AI
            </h2>
            <p className="text-xs text-white/80">Discussing Report ID: {activeChatReq.requestId}</p>
          </div>
          <div className="flex gap-4">
            <a href={`http://localhost:5000${activeChatReq.reportUrl}`} target="_blank" rel="noreferrer" className="text-sm font-bold bg-white text-[#0d631b] px-3 py-1.5 rounded hover:bg-[#eaf4e7] transition-colors">
              View Report
            </a>
            <button onClick={closeChat} className="text-white hover:text-[#d3e3cd]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#f8fcf7] space-y-4">
          <div className="flex justify-center mb-6">
            <div className="bg-[#e8f3e5] px-4 py-2 rounded-full text-xs font-bold text-[#0d631b] border border-[#bfcaba]">
              Analysis Completed • Soil Score: {activeChatReq.results?.score}%
            </div>
          </div>
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-[#0d631b] text-white rounded-tr-sm' : 'bg-white border border-[#bfcaba] text-[#1a1c1c] rounded-tl-sm shadow-sm'}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-[#bfcaba]">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text" 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask the AI about your soil health..." 
              className="flex-1 h-12 px-4 border border-[#bfcaba] rounded-full focus:outline-none focus:border-[#0d631b] bg-[#f8fcf7]"
            />
            <button type="submit" disabled={!chatInput.trim()} className="w-12 h-12 rounded-full bg-[#0d631b] text-white flex items-center justify-center hover:bg-[#0a4a14] disabled:opacity-50 transition-colors">
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a1c1c] mb-2">{t('soil_test.title')}</h1>
        <p className="text-[#40493d] text-base">Upload your lab report and get instant, interactive AI agronomy advice tailored to your farm.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Upload Form */}
        <div className="bg-white rounded-2xl border border-[#bfcaba] shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#f0f6ec] p-5 border-b border-[#bfcaba]">
            <h3 className="font-bold text-xl text-[#0d631b] flex items-center gap-2">
              <span className="material-symbols-outlined">upload_file</span>
              Upload Lab Report
            </h3>
            <p className="text-sm text-[#40493d] mt-1">Upload a PDF or image of your soil test for instant analysis.</p>
          </div>
          <div className="p-6 flex-1">
            <form onSubmit={handleSubmit} className="space-y-5 h-full flex flex-col">
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">Report File <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-[#bfcaba] rounded-xl p-6 text-center bg-[#fafdf9] hover:bg-[#f0f6ec] transition-colors cursor-pointer relative">
                  <input required type="file" onChange={e => setReportFile(e.target.files[0])} accept=".pdf,image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <span className="material-symbols-outlined text-[#0d631b] text-4xl mb-2">cloud_upload</span>
                  <p className="text-sm font-bold text-[#1a1c1c]">{reportFile ? reportFile.name : 'Click or drag file to upload'}</p>
                  <p className="text-xs text-[#40493d] mt-1">Supports PDF, JPG, PNG</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Soil Type</label>
                <select value={soilType} onChange={e => setSoilType(e.target.value)} className="w-full h-11 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b] focus:ring-1 focus:ring-[#0d631b] bg-white text-[#1a1c1c]">
                  <option value="">Select Soil Type</option>
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
                  <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Previous Crop</label>
                  <input value={prevCrop} onChange={e => setPrevCrop(e.target.value)} type="text" placeholder="e.g. Rice" className="w-full h-11 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b] focus:ring-1 focus:ring-[#0d631b]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Planned Crop</label>
                  <input value={cropPlanned} onChange={e => setCropPlanned(e.target.value)} type="text" placeholder="e.g. Cotton" className="w-full h-11 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b] focus:ring-1 focus:ring-[#0d631b]" />
                </div>
              </div>
              
              <div className="mt-auto pt-4">
                <button disabled={loading} type="submit" className="w-full h-[52px] bg-[#0d631b] hover:bg-[#0a4a14] text-white font-bold text-base uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                  {loading ? 'Analyzing...' : <><span className="material-symbols-outlined">auto_awesome</span> Analyze with AI</>}
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
              Your AI Analyses
            </h3>
          </div>
          <div className="p-5 flex-1 overflow-y-auto bg-[#fafdf9]">
            {requests.length === 0 ? (
              <div className="text-center text-[#40493d] mt-10">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">science</span>
                <p>No analyses yet. Upload a report to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => (
                  <div key={req.requestId} className="bg-white border border-[#bfcaba] p-4 rounded-xl shadow-sm hover:border-[#0d631b] transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-[#1a1c1c]">Analysis {req.requestId}</h4>
                        <p className="text-xs text-[#40493d] mt-0.5">{req.soilType ? req.soilType : 'Unknown Soil Type'}</p>
                      </div>
                      <div className="bg-[#e8f3e5] px-2 py-1 rounded text-xs font-bold text-[#0d631b] border border-[#cfe6c9]">
                        Score: {req.results?.score}%
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => setActiveChatReq(req)}
                        className="flex-1 h-9 bg-[#0d631b] hover:bg-[#0a4a14] text-white text-xs font-bold uppercase rounded flex items-center justify-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span> Chat with AI
                      </button>
                      {req.reportUrl && (
                        <a 
                          href={`http://localhost:5000${req.reportUrl}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="px-3 h-9 border border-[#0d631b] text-[#0d631b] hover:bg-[#f0f6ec] text-xs font-bold uppercase rounded flex items-center justify-center transition-colors"
                        >
                          View PDF
                        </a>
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
