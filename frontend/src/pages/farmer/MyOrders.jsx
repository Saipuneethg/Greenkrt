import { useEffect, useState } from 'react'
import API_BASE from '../../config/api'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useLanguage } from '../../context/LanguageContext'

export default function MyOrders() {
  const { t, language } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelModal, setCancelModal] = useState({ isOpen: false, booking: null, error: '' })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ordersRes, bookingsRes] = await Promise.all([
          fetch(`${API_BASE}/api/orders`, { headers: { 'x-auth-token': sessionStorage.getItem('greenkrt_token') } }),
          fetch(`${API_BASE}/api/services/bookings`, { headers: { 'x-auth-token': sessionStorage.getItem('greenkrt_token') } })
        ])

        let allItems = []
        if (ordersRes.ok) {
          const data = await ordersRes.json()
          allItems = [...allItems, ...data.map(o => ({ ...o, itemType: 'product' }))]
        }
        if (bookingsRes.ok) {
          const data = await bookingsRes.json()
          allItems = [...allItems, ...data.map(b => ({ ...b, itemType: 'service' }))]
        }

        allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setOrders(allItems)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAll()
    // Only poll if there might be active orders (not a completed/cancelled state)
    // Use 20s interval instead of 3s to reduce server load
    const interval = setInterval(() => {
      // Check if there are any non-final orders before polling
      setOrders(prev => {
        const hasActiveOrders = prev.some(o => 
          !['Delivered', 'Completed', 'Cancelled'].includes(o.status)
        )
        if (hasActiveOrders || prev.length === 0) fetchAll()
        return prev
      })
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  const openCancelModal = (booking) => {
    // Check client-side first for immediate feedback
    if (booking.details && booking.details.date && booking.details.time) {
      const bookedDateTime = new Date(`${booking.details.date}T${booking.details.time}`)
      const now = new Date()
      const diffMs = bookedDateTime - now
      const hoursUntil = diffMs / (1000 * 60 * 60)
      
      if (hoursUntil <= 1 && hoursUntil >= 0) {
        setCancelModal({ isOpen: true, booking, error: t('my_orders.err_1_hour') })
        return
      }
      if (hoursUntil < 0) {
        setCancelModal({ isOpen: true, booking, error: t('my_orders.err_past') })
        return
      }
    }
    setCancelModal({ isOpen: true, booking, error: '' })
  }

  const confirmCancelBooking = async () => {
    const booking = cancelModal.booking
    if (!booking) return

    try {
      const res = await fetch(`${API_BASE}/api/services/bookings/${booking.bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'x-auth-token': sessionStorage.getItem('greenkrt_token') }
      })
      if (res.ok) {
        setOrders(orders.map(o => o.bookingId === booking.bookingId ? { ...o, status: 'Cancelled' } : o))
        setCancelModal({ isOpen: false, booking: null, error: '' })
      } else {
        const data = await res.json()
        setCancelModal(prev => ({ ...prev, error: data.message || t('my_orders.err_failed') }))
      }
    } catch (err) {
      setCancelModal(prev => ({ ...prev, error: t('my_orders.err_server') }))
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Processing':
      case 'Pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: 'pending_actions' }
      case 'Shipped':
      case 'Scheduled':
        return { color: 'bg-blue-100 text-blue-800', icon: 'event' }
      case 'Out for Delivery':
        return { color: 'bg-purple-100 text-purple-800', icon: 'electric_moped' }
      case 'Delivered':
      case 'Completed':
        return { color: 'bg-green-100 text-green-800', icon: 'check_circle' }
      case 'Cancelled':
        return { color: 'bg-red-100 text-red-800', icon: 'cancel' }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: 'shopping_bag' }
    }
  }

  // Stats calculation
  const totalCount = orders.length
  const inTransitCount = orders.filter(o => o.status === 'Shipped' || o.status === 'Scheduled').length
  const deliveredCount = orders.filter(o => o.status === 'Delivered' || o.status === 'Completed').length
  const processingCount = orders.filter(o => o.status === 'Processing' || o.status === 'Pending').length

  const TrackingSteps = ({ status, type }) => {
    const steps = type === 'service' ? ['Pending', 'Scheduled', 'Completed'] : ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentIndex = steps.indexOf(status);

    return (
      <div className="mt-5 pt-4 border-t border-[#bfcaba]/30">
        <div className="flex items-center justify-between relative max-w-sm mx-auto">
          {/* Background line */}
          <div className="absolute left-4 right-4 top-3 -translate-y-1/2 h-1 bg-[#e0e5de] -z-10 rounded"></div>
          {/* Active progress line */}
          <div 
            className="absolute left-4 top-3 -translate-y-1/2 h-1 bg-[#0d631b] -z-10 rounded transition-all duration-500 ease-in-out" 
            style={{ width: `calc(${currentIndex / (steps.length - 1)} * (100% - 2rem))` }}
          ></div>

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div key={step} className="flex flex-col items-center bg-white px-2 z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-500 ${isCompleted ? 'bg-[#0d631b] text-white ring-4 ring-[#0d631b]/20 shadow-md' : 'bg-[#e0e5de] text-[#707a6c]'}`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`text-[10px] uppercase font-bold mt-2 transition-colors duration-500 ${isCurrent ? 'text-[#1a1c1c]' : isCompleted ? 'text-[#0d631b]' : 'text-[#707a6c]'}`}>{step}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1c1c] mb-1">{t('my_orders.title')}</h1>
        <p className="text-[#40493d] text-sm">{t('my_orders.subtitle')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: t('my_orders.total_orders'), value: totalCount, icon: 'shopping_bag', color: '#0d631b' },
          { label: t('my_orders.processing'), value: processingCount, icon: 'pending_actions', color: '#d97706' },
          { label: t('my_orders.in_transit'), value: inTransitCount, icon: 'local_shipping', color: '#1e3a8a' },
          { label: t('my_orders.delivered'), value: deliveredCount, icon: 'check_circle', color: '#126d27' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#bfcaba] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${s.color}15` }}>
              <span className="material-symbols-outlined" style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <div className="text-xl font-bold text-[#1a1c1c]">{s.value}</div>
              <div className="text-xs text-[#40493d]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <p className="text-sm text-[#40493d]">{t('my_orders.loading')}</p>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#bfcaba] p-8 text-center text-[#40493d]">
          <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">shopping_cart</span>
          <p className="text-sm">{t('my_orders.no_orders')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => {
            const { color, icon } = getStatusStyle(o.status)
            
            if (o.itemType === 'service') {
              let serviceName = t('my_orders.drone_service')
              if (o.serviceType === 'land') serviceName = t('my_orders.land_service')
              if (o.serviceType === 'soil') serviceName = 'Soil Test Collection'
              
              const translateCrop = (crop) => {
                if (!crop) return ''
                if (language !== 'te') return crop
                const lower = crop.toLowerCase()
                const cropMap = {
                  cotton: 'పత్తి',
                  paddy: 'వరి',
                  rice: 'వరి',
                  chilli: 'మిరప',
                  chili: 'మిరప',
                  maize: 'మొక్కజొన్న',
                  wheat: 'గోధుమ'
                }
                return cropMap[lower] || crop
              }

              const translatePurpose = (purpose) => {
                if (!purpose) return ''
                if (language !== 'te') return purpose
                const lower = purpose.toLowerCase()
                if (lower.includes('boundary') || lower.includes('dispute') || lower.includes('legal')) return 'సరిహద్దు వివాదం / చట్టపరమైనది'
                if (lower.includes('crop planning') || lower.includes('area calculation') || lower.includes('planning')) return 'పంట ప్రణాళిక / విస్తీర్ణం లెక్కింపు'
                if (lower.includes('insurance')) return 'భీమా క్లెయిమ్'
                return purpose
              }

              const cropStr = translateCrop(o.details?.cropType)
              const purposeStr = translatePurpose(o.details?.purpose)
              const dateLabel = language === 'te' ? 'తేదీ' : 'Date'

              let detailsString = ''
              if (o.serviceType === 'drone') {
                detailsString = `${cropStr} • ${o.details?.farmSize || 1} ${t('dashboard.acres')} • ${dateLabel}: ${o.details?.date}`
              } else if (o.serviceType === 'land') {
                detailsString = `${purposeStr} • ${o.details?.farmSize || 1} ${t('dashboard.acres')} • ${dateLabel}: ${o.details?.date}`
              } else if (o.serviceType === 'soil') {
                detailsString = `Soil Sample Collection • ${o.details?.farmSize || 1} ${t('dashboard.acres')} • ${dateLabel}: ${o.details?.date}`
              }
              
              let iconName = 'flight'
              if (o.serviceType === 'land') iconName = 'square_foot'
              if (o.serviceType === 'soil') iconName = 'biotech'
              
              return (
                <div key={o.bookingId} className="bg-white rounded-xl border border-[#bfcaba] shadow-sm p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#f3f3f3] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#0d631b] text-[20px]">{iconName}</span>
                      </div>
                      <div>
                        <div className="font-bold text-[#1a1c1c] mb-1">{o.bookingId} - {serviceName}</div>
                        <div className="text-sm text-[#40493d]">{detailsString}</div>
                        <div className="text-xs text-[#707a6c] mt-1">{t('my_orders.booked')} {new Date(o.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${color}`}>{t(`my_orders.${o.status.toLowerCase().replace(/ /g, '_')}`) || o.status}</span>
                      <div className="text-lg font-bold text-[#0d631b]">₹{o.cost.toLocaleString()}</div>
                      {(o.status === 'Pending' || o.status === 'Scheduled') && (
                        <button onClick={() => openCancelModal(o)} className="h-[32px] px-4 rounded-lg border border-[#ba1a1a] text-[#ba1a1a] text-xs font-bold hover:bg-[#ba1a1a]/5 flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-[16px]">cancel</span>
                          {t('my_orders.cancel_booking')}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Real-time Tracking */}
                  <TrackingSteps status={o.status} type="service" />
                </div>
              )
            }

            const itemString = o.items.map(i => `${i.name} × ${i.quantity}`).join(', ')
            return (
              <div key={o.orderId} className="bg-white rounded-xl border border-[#bfcaba] shadow-sm p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f3f3f3] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#0d631b] text-[20px]">{icon}</span>
                    </div>
                    <div>
                      <div className="font-bold text-[#1a1c1c] mb-1">{o.orderId}</div>
                      <div className="text-sm text-[#40493d]">{itemString}</div>
                      <div className="text-xs text-[#707a6c] mt-1">{t('my_orders.placed')} {new Date(o.createdAt).toLocaleDateString()}</div>
                      {o.deliveryPartner && (
                        <div className="mt-3 bg-[#e8f3e5] border border-[#cfe6c9] px-3 py-2 rounded-lg flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#0d631b] text-[18px]">electric_moped</span>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-[#40493d]">{t('my_orders.assigned_partner')}</p>
                            <p className="text-xs font-bold text-[#0d631b]">{o.deliveryPartner.firstName} {o.deliveryPartner.lastName} • {o.deliveryPartner.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${color}`}>{t(`my_orders.${o.status.toLowerCase().replace(/ /g, '_')}`) || o.status}</span>
                    <div className="text-lg font-bold text-[#0d631b]">₹{o.totalAmount.toLocaleString()}</div>
                    {o.status !== 'Delivered' && (
                      <button onClick={() => navigate(`/dashboard/tracking?id=${o.orderId}`)} className="h-[32px] px-4 rounded-lg border border-[#0d631b] text-[#0d631b] text-xs font-bold hover:bg-[#0d631b]/5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {t('my_orders.track_details')}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Real-time Order Tracking */}
                <TrackingSteps status={o.status} type="product" />
              </div>
            )
          })}
        </div>
      )}

      {/* Custom Cancel Modal */}
      {cancelModal.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#fff0f0] px-6 py-4 border-b border-[#ffdad6] flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#ba1a1a] flex items-center gap-2">
                <span className="material-symbols-outlined">cancel</span>
                {t('my_orders.cancel_booking')}
              </h3>
              <button onClick={() => setCancelModal({ isOpen: false, booking: null, error: '' })} className="text-[#40493d] hover:text-[#1a1c1c] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              {cancelModal.error ? (
                <div className="bg-[#fff0f0] border border-[#ffdad6] text-[#ba1a1a] p-4 rounded-xl text-sm font-semibold flex items-start gap-3">
                  <span className="material-symbols-outlined shrink-0">error</span>
                  <div>{cancelModal.error}</div>
                </div>
              ) : (
                <p className="text-[#40493d]">
                  {t('my_orders.cancel_confirm_q')} <strong>{cancelModal.booking?.bookingId}</strong>? 
                  {t('my_orders.cannot_undone')}
                </p>
              )}
            </div>
            <div className="p-4 border-t border-[#bfcaba] bg-[#fcfcfc] flex gap-3 justify-end">
              <button onClick={() => setCancelModal({ isOpen: false, booking: null, error: '' })} className="px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest text-[#40493d] border border-[#bfcaba] hover:bg-[#f3f3f3] transition-all duration-300">
                {cancelModal.error ? t('my_orders.close') : t('my_orders.no_keep_it')}
              </button>
              {!cancelModal.error && (
                <button onClick={confirmCancelBooking} className="px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest text-white bg-[#ba1a1a] hover:bg-[#93000a] transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow">
                  {t('my_orders.yes_cancel_it')}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
