import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/orders', {
          headers: {
            'x-auth-token': sessionStorage.getItem('greenkrt_token'),
          },
        })
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
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
  }, [])

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Processing':
        return { color: 'bg-yellow-100 text-yellow-800', icon: 'pending_actions' }
      case 'Shipped':
        return { color: 'bg-blue-100 text-blue-800', icon: 'local_shipping' }
      case 'Out for Delivery':
        return { color: 'bg-purple-100 text-purple-800', icon: 'electric_moped' }
      case 'Delivered':
        return { color: 'bg-green-100 text-green-800', icon: 'check_circle' }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: 'shopping_bag' }
    }
  }

  // Stats calculation
  const totalCount = orders.length
  const inTransitCount = orders.filter(o => o.status === 'Shipped').length
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length
  const processingCount = orders.filter(o => o.status === 'Processing').length

  const TrackingSteps = ({ status }) => {
    const steps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
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
        <h1 className="text-2xl font-bold text-[#1a1c1c] mb-1">My Orders</h1>
        <p className="text-[#40493d] text-sm">Track and manage all your product orders.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: totalCount, icon: 'shopping_bag', color: '#0d631b' },
          { label: 'Processing', value: processingCount, icon: 'pending_actions', color: '#d97706' },
          { label: 'In Transit', value: inTransitCount, icon: 'local_shipping', color: '#1e3a8a' },
          { label: 'Delivered', value: deliveredCount, icon: 'check_circle', color: '#126d27' },
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
        <p className="text-sm text-[#40493d]">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#bfcaba] p-8 text-center text-[#40493d]">
          <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">shopping_cart</span>
          <p className="text-sm">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => {
            const { color, icon } = getStatusStyle(o.status)
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
                      <div className="text-xs text-[#707a6c] mt-1">Placed: {new Date(o.createdAt).toLocaleDateString()}</div>
                      {o.deliveryPartner && (
                        <div className="mt-3 bg-[#e8f3e5] border border-[#cfe6c9] px-3 py-2 rounded-lg flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#0d631b] text-[18px]">electric_moped</span>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-[#40493d]">Assigned Partner</p>
                            <p className="text-xs font-bold text-[#0d631b]">{o.deliveryPartner.firstName} {o.deliveryPartner.lastName} • {o.deliveryPartner.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${color}`}>{o.status}</span>
                    <div className="text-lg font-bold text-[#0d631b]">₹{o.totalAmount.toLocaleString()}</div>
                    {o.status !== 'Delivered' && (
                      <button onClick={() => navigate(`/dashboard/tracking?id=${o.orderId}`)} className="h-[32px] px-4 rounded-lg border border-[#0d631b] text-[#0d631b] text-xs font-bold hover:bg-[#0d631b]/5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        Track Full Details
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Real-time Order Tracking */}
                <TrackingSteps status={o.status} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
