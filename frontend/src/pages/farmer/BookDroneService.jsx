import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

export default function BookDroneService() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [cropType, setCropType] = useState('Paddy (Rice)')
  const [farmSize, setFarmSize] = useState('4.5')
  const [chemicalType, setChemicalType] = useState('Pesticide - Chlorpyrifos')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [farmLocation, setFarmLocation] = useState('Plot 42, Ramapuram Village, Guntur')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Calculate pricing
  const acres = parseFloat(farmSize) || 0
  const serviceCost = acres * 800
  const travelCharge = serviceCost > 0 ? 200 : 0
  const gst = Math.round((serviceCost + travelCharge) * 0.18)
  const totalCost = serviceCost + travelCharge + gst

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
        <h1 className="text-2xl font-bold text-[#1a1c1c] mb-1">{t('book_drone.title')}</h1>
        <p className="text-[#40493d] text-sm">{t('book_drone.subtitle')}</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-[#f3fcef] border border-[#9cf49c] rounded-xl text-center">
          <span className="material-symbols-outlined text-[#0d631b] text-3xl mb-2">task_alt</span>
          <h3 className="font-bold text-[#1a1c1c] mb-1">Booking Confirmed!</h3>
          <p className="text-sm text-[#40493d]">Redirecting you to dashboard...</p>
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
                  <option>Paddy (Rice)</option>
                  <option>Cotton</option>
                  <option>Chilli</option>
                  <option>Other</option>
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
                <option>Pesticide - Chlorpyrifos</option>
                <option>Fertilizer - Nano Urea</option>
                <option>Fungicide</option>
                <option>I need chemical supplied too</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_drone.date')}</label>
                <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">Preferred Time</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('book_drone.farm_location')}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#0d631b]">my_location</span>
                <input type="text" value={farmLocation} onChange={e => setFarmLocation(e.target.value)} className="w-full h-[48px] pl-12 pr-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white" />
              </div>
              <img src="https://maps.googleapis.com/maps/api/staticmap?center=16.3067,80.4365&zoom=14&size=600x200&maptype=satellite&key=YOUR_API_KEY" alt="Map Preview" className="w-full h-32 object-cover rounded-lg mt-3 bg-[#e2e2e2]" />
            </div>
            
            <button disabled={loading} type="submit" className="w-full h-[52px] bg-[#0d631b] hover:bg-[#0d631b]/90 text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors shadow-sm mt-4 flex items-center justify-center gap-2">
              {loading ? 'Processing...' : t('book_drone.submit')}
            </button>
          </form>
        </div>

        {/* Pricing / Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#bfcaba] shadow-sm p-6">
            <h3 className="font-bold text-[#1a1c1c] mb-4 border-b border-[#bfcaba] pb-2">Booking Summary</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#40493d]">Service Cost (₹800/acre)</span>
                <span className="font-semibold text-[#1a1c1c]">₹{serviceCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#40493d]">Travel Charge</span>
                <span className="font-semibold text-[#1a1c1c]">₹{travelCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#40493d]">Taxes (18% GST)</span>
                <span className="font-semibold text-[#1a1c1c]">₹{gst.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#0d631b] border-t border-[#bfcaba] pt-3">
              <span>Total Payable</span>
              <span>₹{totalCost.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="bg-[#edf6ea] rounded-xl border border-[#22c55e]/30 p-5">
            <h3 className="font-bold text-[#161d16] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#19722b]">verified</span>
              Govt Certified
            </h3>
            <p className="text-sm text-[#3d4a3d]">All our drone pilots are DGCA certified and use approved agricultural drones.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
