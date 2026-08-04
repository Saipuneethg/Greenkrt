import { useEffect, useState } from 'react'
import API_BASE from '../../config/api'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

export default function OrderTracking() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const targetOrderId = searchParams.get('id')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/orders`, {
          headers: {
            'x-auth-token': sessionStorage.getItem('greenkrt_token'),
          },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.length > 0) {
            if (targetOrderId) {
              const found = data.find(o => o.orderId === targetOrderId)
              setOrder(found || data[0])
            } else {
              setOrder(data[0])
            }
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [targetOrderId])

  if (loading) {
    return <div className="max-w-3xl mx-auto p-8 text-center text-[#40493d]">{t('my_orders.loading_tracking')}</div>
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center bg-white rounded-xl border border-[#bfcaba] shadow-sm">
        <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">inventory_2</span>
        <p className="text-[#40493d]">{t('my_orders.no_active_track')}</p>
        <button onClick={() => navigate('/dashboard/orders')} className="mt-4 px-4 py-2 bg-[#0d631b] text-white rounded font-bold text-sm">{t('my_orders.view_all')}</button>
      </div>
    )
  }

  const stages = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered']
  const currentIndex = stages.indexOf(order.status)
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-yellow-100 text-yellow-800'
      case 'Shipped': return 'bg-blue-100 text-blue-800'
      case 'Out for Delivery': return 'bg-purple-100 text-purple-800'
      case 'Delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const itemString = order.items.map(i => `${i.name} × ${i.quantity}`).join(', ')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard/orders')} className="w-10 h-10 rounded-full bg-white border border-[#bfcaba] flex items-center justify-center hover:bg-[#f3fcef]">
          <span className="material-symbols-outlined text-[#1a1c1c]">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1a1c1c] mb-1">{t('my_orders.tracking_title')}</h1>
          <p className="text-[#40493d] text-sm">{t('my_orders.tracking_subtitle')}</p>
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white rounded-xl border border-[#bfcaba] shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-bold text-xl text-[#1a1c1c] mb-1">{order.orderId}</div>
            <div className="text-sm text-[#40493d]">{itemString}</div>
            <div className="text-xs text-[#707a6c] mt-1">{t('my_orders.ordered_on')} {new Date(order.createdAt).toLocaleDateString()} • ₹{order.totalAmount.toLocaleString()}</div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>{t(`my_orders.${order.status.toLowerCase().replace(/ /g, '_')}`) || order.status}</span>
        </div>
      </div>

      {/* Delivery Partner */}
      {order.deliveryPartner ? (
        <div className="bg-white rounded-xl border border-[#bfcaba] shadow-sm p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#e8f3e5] flex items-center justify-center text-2xl border border-[#cfe6c9]">
              <span className="material-symbols-outlined text-[#0d631b] text-3xl">electric_moped</span>
            </div>
            <div>
              <div className="font-bold text-[#1a1c1c]">{order.deliveryPartner.firstName} {order.deliveryPartner.lastName}</div>
              <div className="text-sm text-[#40493d]">{t('my_orders.partner_assigned')}</div>
              <div className="text-xs text-[#0d631b] font-semibold flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">call</span> {order.deliveryPartner.phone}
              </div>
            </div>
          </div>
          <a href={`tel:${order.deliveryPartner.phone}`} className="h-[48px] w-[48px] rounded-full bg-[#0d631b] flex items-center justify-center hover:opacity-90 shadow-md transition-opacity">
            <span className="material-symbols-outlined text-white">phone</span>
          </a>
        </div>
      ) : (
        <div className="bg-[#f8f9fa] rounded-xl border border-[#bfcaba] border-dashed shadow-sm p-6 mb-6 flex items-center gap-4 text-[#707a6c]">
          <span className="material-symbols-outlined text-3xl opacity-50">hourglass_empty</span>
          <p className="text-sm">{t('my_orders.partner_soon')}</p>
        </div>
      )}

      {/* Tracking Timeline */}
      <div className="bg-white rounded-xl border border-[#bfcaba] shadow-sm p-6">
        <h2 className="font-bold text-[#1a1c1c] mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0d631b]">route</span>
          {t('my_orders.progress')}
        </h2>
        <div className="relative pl-2">
          {/* Background vertical line */}
          <div className="absolute left-6 top-6 bottom-6 w-1 bg-[#e0e5de] rounded"></div>
          {/* Active green vertical line */}
          <div 
            className="absolute left-6 top-6 w-1 bg-[#0d631b] rounded transition-all duration-700 ease-in-out"
            style={{ height: `calc(${currentIndex / (stages.length - 1)} * 100% - 10px)` }}
          ></div>

          <div className="space-y-8">
            {stages.map((step, i) => {
              const isCompleted = i <= currentIndex;
              const isCurrent = i === currentIndex;
              
              return (
                <div key={i} className="flex items-start gap-5 relative">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${isCompleted ? 'bg-[#0d631b] shadow-md ring-4 ring-[#0d631b]/20' : 'bg-[#e0e5de]'}`}>
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-white text-[18px]">check</span>
                    ) : (
                      <span className="text-[12px] font-bold text-[#707a6c]">{i + 1}</span>
                    )}
                  </div>
                  <div className="pt-1.5">
                    <div className={`font-bold text-sm transition-colors duration-500 ${isCurrent ? 'text-[#1a1c1c] text-base' : isCompleted ? 'text-[#0d631b]' : 'text-[#707a6c]'}`}>
                      {t(`my_orders.${step.toLowerCase().replace(/ /g, '_')}`) || step}
                    </div>
                    {isCurrent && (
                      <div className="text-xs text-[#0d631b] font-semibold mt-1">{t('my_orders.current_status')}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
