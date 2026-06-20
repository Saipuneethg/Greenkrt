import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'

export default function OrderManagement() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState([])
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')

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
    }
  }

  const fetchPartners = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/delivery-partners', {
        headers: {
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
      })
      if (res.ok) {
        const data = await res.json()
        setPartners(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchOrders(), fetchPartners()])
      setLoading(false)
    }
    init()
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        fetchOrders()
      } else {
        alert('Failed to update status.')
      }
    } catch {
      alert('Error connecting to server.')
    }
  }

  const handleAssignPartner = async (orderId, partnerId) => {
    if (!partnerId) return
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
        body: JSON.stringify({ deliveryPartnerId: partnerId }),
      })
      if (res.ok) {
        fetchOrders()
        alert('Delivery partner assigned successfully!')
      } else {
        alert('Failed to assign partner.')
      }
    } catch {
      alert('Error connecting to server.')
    }
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderId.toLowerCase().includes(search.toLowerCase()) || 
                          `${o.user?.firstName} ${o.user?.lastName}`.toLowerCase().includes(search.toLowerCase())
    
    // Status mapping: Processing, Shipped, Out for Delivery, Delivered
    const matchesStatus = statusFilter === 'All Statuses' || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#161d16]">{t('admin_orders.title')}</h1>

      <div className="bg-white border border-[#bccbb9] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#bccbb9] flex gap-4 bg-[#f3fcef]">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4a3d] text-[20px]">search</span>
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('admin_orders.search')} 
              className="w-full pl-10 pr-4 py-2 border border-[#bccbb9] rounded bg-white text-sm focus:outline-none focus:border-[#006e2f]" 
            />
          </div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-[#bccbb9] rounded px-4 py-2 text-sm bg-white outline-none"
          >
            <option>All Statuses</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Out for Delivery</option>
            <option>Delivered</option>
          </select>
        </div>
        
        {loading ? (
          <p className="p-4 text-sm text-[#3d4a3d]">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="p-4 text-sm text-[#3d4a3d]">No orders found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#bccbb9] bg-[#edf6ea] text-[#3d4a3d] font-bold">
                <th className="p-4">{t('admin_orders.order_id')}</th>
                <th className="p-4">{t('admin_orders.date')}</th>
                <th className="p-4">{t('admin_orders.customer')}</th>
                <th className="p-4">Products</th>
                <th className="p-4">{t('admin_orders.total')}</th>
                <th className="p-4">{t('admin_orders.status')}</th>
                <th className="p-4">Delivery Partner</th>
                <th className="p-4">Change Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => {
                const itemString = o.items.map(i => `${i.name} × ${i.quantity}`).join(', ')
                return (
                  <tr key={o._id} className="border-b border-[#bccbb9]/30 hover:bg-[#f3fcef]">
                    <td className="p-4 font-semibold text-[#161d16]">{o.orderId}</td>
                    <td className="p-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">{o.user?.firstName} {o.user?.lastName} ({o.user?.district || 'Guntur'})</td>
                    <td className="p-4">{itemString}</td>
                    <td className="p-4 font-bold text-[#006e2f]">₹{o.totalAmount}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${o.status === 'Delivered' ? 'bg-green-100 text-green-800' : (o.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : (o.status === 'Out for Delivery' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'))}`}>{o.status}</span>
                    </td>
                    <td className="p-4">
                      <select 
                        onChange={(e) => handleAssignPartner(o.orderId, e.target.value)}
                        value={o.deliveryPartner?._id || ""}
                        className="text-xs border rounded p-1 bg-white"
                      >
                        <option value="" disabled>Assign...</option>
                        {partners.map(p => (
                          <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                        className="text-xs border rounded p-1 bg-white"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
