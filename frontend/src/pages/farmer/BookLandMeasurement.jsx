import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

export default function BookLandMeasurement() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [purpose, setPurpose] = useState('Boundary Dispute / Legal')
  const [estimatedSize, setEstimatedSize] = useState('5')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const size = parseFloat(estimatedSize) || 0
  const totalCost = size * 500

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!date) {
      alert('Please select a date.')
      return
    }
    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/services/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
        body: JSON.stringify({
          serviceType: 'land',
          details: {
            purpose,
            farmSize: size,
            date,
          },
          cost: totalCost,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        alert('Booking failed. Please try again.')
      }
    } catch {
      alert('Error connecting to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1c1c] mb-1">{t('book_land.title')}</h1>
        <p className="text-[#40493d] text-sm">{t('book_land.subtitle')}</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-[#f3fcef] border border-[#9cf49c] rounded-xl text-center">
          <span className="material-symbols-outlined text-[#0d631b] text-3xl mb-2">task_alt</span>
          <h3 className="font-bold text-[#1a1c1c] mb-1">Survey Scheduled Successfully!</h3>
          <p className="text-sm text-[#40493d]">Redirecting you to dashboard...</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#bfcaba] shadow-sm p-6 max-w-2xl">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_land.purpose')}</label>
            <select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white">
              <option>Boundary Dispute / Legal</option>
              <option>Crop Planning / Area Calculation</option>
              <option>Insurance Claim</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_land.estimated_size')}</label>
            <input required type="number" step="0.1" value={estimatedSize} onChange={e => setEstimatedSize(e.target.value)} placeholder="e.g. 5" className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_land.date')}</label>
            <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white" />
          </div>
          
          <div className="bg-[#f3f3f3] p-4 rounded-lg mt-6">
            <div className="flex justify-between items-center font-bold text-[#1a1c1c]">
              <span>Estimated Cost:</span>
              <span className="text-[#0d631b]">₹{totalCost.toLocaleString()} (₹500 / acre)</span>
            </div>
            <p className="text-xs text-[#40493d] mt-2">Final cost will be calculated after the survey based on actual area measured.</p>
          </div>

          <button disabled={loading} type="submit" className="w-full h-[52px] bg-[#0d631b] hover:bg-[#0d631b]/90 text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
            {loading ? 'Scheduling...' : t('book_land.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
