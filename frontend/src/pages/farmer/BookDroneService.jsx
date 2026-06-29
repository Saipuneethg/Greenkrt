import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import LocationInput from '../../components/LocationInput'

export default function BookDroneService() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  
  const [cropType, setCropType] = useState('')
  const [farmSize, setFarmSize] = useState('')
  const [chemicalType, setChemicalType] = useState('Pesticide - Chlorpyrifos')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [farmLocation, setFarmLocation] = useState('')
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
          setCropType(plot.crop || '')
          setFarmSize(plot.acres ? plot.acres.toString() : '')
          setFarmLocation(plot.location || '')
        }
      } catch (e) {
        console.error('Failed to parse farmer plots', e)
      }
    }
  }, [])

  // Calculate pricing
  const acres = parseFloat(farmSize) || 0
  const serviceCost = acres * 800
  const travelCharge = serviceCost > 0 ? 200 : 0
  const gst = Math.round((serviceCost + travelCharge) * 0.18)
  const totalCost = serviceCost + travelCharge + gst

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!date) {
      setError(t('book_drone.select_date'))
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
          serviceType: 'drone',
          details: {
            farmLocation,
            farmSize: acres,
            cropType,
            chemicalType,
            date,
            time,
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
        setError(t('book_drone.booking_failed'))
      }
    } catch {
      setError(t('book_drone.server_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1c1c] mb-1">{t('book_drone.title')}</h1>
        <p className="text-[#40493d] text-sm">{t('book_drone.subtitle')}</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-[#f3fcef] border border-[#9cf49c] rounded-xl text-center">
          <span className="material-symbols-outlined text-[#0d631b] text-3xl mb-2">task_alt</span>
          <h3 className="font-bold text-[#1a1c1c] mb-1">{t('book_drone.booking_confirmed')}</h3>
          <p className="text-sm text-[#40493d]">{t('book_drone.redirecting')}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2">
          <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[#bfcaba] shadow-sm p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_drone.crop_type')}</label>
                <select value={cropType} onChange={e => setCropType(e.target.value)} className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white">
                  <option value="Paddy (Rice)">{t('book_drone.opt_paddy')}</option>
                  <option value="Cotton">{t('book_drone.opt_cotton')}</option>
                  <option value="Chilli">{t('book_drone.opt_chilli')}</option>
                  <option value="Other">{t('book_drone.opt_other')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_drone.farm_size')}</label>
                <input value={farmSize} onChange={e => setFormSize(e.target.value)} type="number" step="0.1" className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_drone.chemical_type')}</label>
              <select value={chemicalType} onChange={e => setChemicalType(e.target.value)} className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white">
                <option value="Pesticide - Chlorpyrifos">{t('book_drone.opt_pest')}</option>
                <option value="Fertilizer - Nano Urea">{t('book_drone.opt_fert')}</option>
                <option value="Fungicide">{t('book_drone.opt_fung')}</option>
                <option value="I need chemical supplied too">{t('book_drone.opt_chem_supply')}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_drone.date')}</label>
                <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_drone.preferred_time')}</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_drone.farm_location')}</label>
              <LocationInput 
                value={farmLocation} 
                onChange={val => setFarmLocation(val)} 
                placeholder={t('book_drone.search_location')} 
                className="w-full h-[48px] px-3 pr-10 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white"
              />
            </div>
            
            <button disabled={loading} type="submit" className="w-full h-[52px] bg-[#0d631b] hover:bg-[#0d631b]/90 text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors shadow-sm mt-4 flex items-center justify-center gap-2">
              {loading ? t('book_drone.processing') : t('book_drone.submit')}
            </button>
          </form>
        </div>

        {/* Pricing / Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#bfcaba] shadow-sm p-6">
            <h3 className="font-bold text-[#1a1c1c] mb-4 border-b border-[#bfcaba] pb-2">{t('book_drone.booking_summary')}</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#40493d]">{t('book_drone.service_cost')}</span>
                <span className="font-semibold text-[#1a1c1c]">₹{serviceCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#40493d]">{t('book_drone.travel_charge')}</span>
                <span className="font-semibold text-[#1a1c1c]">₹{travelCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#40493d]">{t('book_drone.taxes')}</span>
                <span className="font-semibold text-[#1a1c1c]">₹{gst.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#0d631b] border-t border-[#bfcaba] pt-3">
              <span>{t('book_drone.total_payable')}</span>
              <span>₹{totalCost.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="bg-[#edf6ea] rounded-xl border border-[#22c55e]/30 p-5">
            <h3 className="font-bold text-[#161d16] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#19722b]">verified</span>
              {t('book_drone.govt_certified')}
            </h3>
            <p className="text-sm text-[#3d4a3d]">{t('book_drone.govt_desc')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
