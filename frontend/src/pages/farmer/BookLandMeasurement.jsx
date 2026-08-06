import { useState, useEffect } from 'react'
import API_BASE from '../../config/api'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import LocationInput from '../../components/LocationInput'
import { useData } from '../../context/DataContext'

export default function BookLandMeasurement() {
  const { t } = useLanguage()
  const { services } = useData()
  const navigate = useNavigate()
  const [purpose, setPurpose] = useState('Boundary Dispute / Legal')
  const [estimatedSize, setEstimatedSize] = useState('')
  const [farmLocation, setFarmLocation] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('greenkrt_farmer_plots')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.length > 0) {
          const plot = parsed[0]
          setEstimatedSize(plot.acres ? plot.acres.toString() : '')
          setFarmLocation(plot.location || '')
        }
      } catch (e) {
        console.error('Failed to parse farmer plots', e)
      }
    }
  }, [])

  const size = parseFloat(estimatedSize) || 0
  
  const landService = services.find(s => s.name === 'Land Measurement' || s.title === 'Land Measurement')
  const defaultPrice = 500
  const basePriceValue = landService && landService.basePrice ? parseInt(landService.basePrice.replace(/\D/g, '')) || defaultPrice : defaultPrice
  
  const totalCost = size * basePriceValue

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!date) {
      setError(t('book_land.select_date'))
      return
    }
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/services/bookings`, {
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
            farmLocation,
            date,
          },
          cost: totalCost,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/dashboard/services')
        }, 2000)
      } else {
        setError(t('book_land.booking_failed'))
      }
    } catch {
      setError(t('book_land.server_error'))
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
          <h3 className="font-bold text-[#1a1c1c] mb-1">{t('book_land.booking_confirmed')}</h3>
          <p className="text-sm text-[#40493d]">{t('book_land.redirecting')}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2 max-w-2xl">
          <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#bfcaba] shadow-sm p-6 max-w-2xl">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_land.purpose')}</label>
            <select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white">
              <option value="Boundary Dispute / Legal">{t('book_land.opt_boundary')}</option>
              <option value="Crop Planning / Area Calculation">{t('book_land.opt_crop_plan')}</option>
              <option value="Insurance Claim">{t('book_land.opt_insurance')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_land.estimated_size')}</label>
            <input required type="number" step="0.1" value={estimatedSize} onChange={e => setEstimatedSize(e.target.value)} placeholder={t('book_land.eg_size')} className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_land.farm_location')}</label>
            <LocationInput 
              value={farmLocation} 
              onChange={val => setFarmLocation(val)} 
              placeholder={t('book_land.search_location')} 
              className="w-full h-[48px] px-3 pr-10 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_land.date')}</label>
            <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white" />
          </div>
          
          <div className="bg-[#f3f3f3] p-4 rounded-lg mt-6">
            <div className="flex justify-between items-center font-bold text-[#1a1c1c]">
              <span>{t('book_land.estimated_cost')}</span>
              <span className="text-[#0d631b]">₹{totalCost.toLocaleString()} ({t('book_land.cost_per_acre')})</span>
            </div>
            <p className="text-xs text-[#40493d] mt-2">{t('book_land.cost_note')}</p>
          </div>

          <button disabled={loading} type="submit" className="w-full h-[52px] bg-[#0d631b] hover:bg-[#0d631b]/90 text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
            {loading ? t('book_land.scheduling') : t('book_land.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
