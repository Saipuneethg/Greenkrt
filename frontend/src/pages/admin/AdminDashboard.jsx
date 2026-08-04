import { useState, useEffect } from 'react'
import API_BASE from '../../config/api'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/analytics`, {
          headers: {
            'x-auth-token': sessionStorage.getItem('greenkrt_token'),
          },
        })
        if (res.ok) {
          const result = await res.json()
          setData(result)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  // KPI Calculations
  const kpis = [
    { 
      label: t('admin_dashboard.active_farmers'), 
      value: data ? data.kpis.totalFarmers.toLocaleString() : '...', 
      icon: 'agriculture', 
      trend: data ? data.kpis.trends.farmerGrowth : '...', 
      positive: data ? data.kpis.trends.farmerPositive : true 
    },
    { 
      label: t('admin_nav.orders'), 
      value: data ? data.kpis.totalOrders.toLocaleString() : '...', 
      icon: 'shopping_cart', 
      trend: data ? data.kpis.trends.orderGrowth : '...', 
      positive: data ? data.kpis.trends.orderPositive : true 
    },
    { 
      label: t('admin_dashboard.total_sales'), 
      value: data ? `₹${data.kpis.totalRevenue.toLocaleString()}` : '...', 
      icon: 'payments', 
      trend: data ? data.kpis.trends.revenueGrowth : '...', 
      positive: data ? data.kpis.trends.revenuePositive : true 
    },
    { 
      label: t('admin_dashboard.pending_orders'), 
      value: data ? data.kpis.pendingDeliveries.toString() : '...', 
      icon: 'local_shipping', 
      trend: data ? data.kpis.trends.pendingTrend : '...', 
      positive: data ? data.kpis.trends.pendingPositive : false 
    },
    { 
      label: t('admin_dashboard.services_booked'), 
      value: data ? data.kpis.activeServices.toString() : '...', 
      icon: 'build', 
      trend: data ? data.kpis.trends.servicesTrend : '...', 
      positive: data ? data.kpis.trends.servicesPositive : true 
    },
  ]

  // Recent Orders table mapping
  const orders = data ? data.recentOrders.map(o => {
    const itemString = o.items.map(i => `${i.name} × ${i.quantity}`).join(', ')
    let statusColor = 'bg-yellow-100 text-yellow-800'
    if (o.status === 'Delivered') statusColor = 'bg-green-100 text-green-800'
    else if (o.status === 'Shipped') statusColor = 'bg-blue-100 text-blue-800'
    else if (o.status === 'Out for Delivery') statusColor = 'bg-purple-100 text-purple-800'
    
    return {
      id: o.orderId,
      farmer: o.user ? `${o.user.firstName} ${o.user.lastName}` : 'Unknown',
      products: itemString || 'None',
      amount: `₹${o.totalAmount.toLocaleString()}`,
      status: o.status,
      statusColor
    }
  }) : []

  // Service bookings list mapping
  const serviceBookings = data ? data.recentServices.map(s => {
    let icon = 'agriculture'
    if (s.serviceType === 'drone') icon = 'flight'
    else if (s.serviceType === 'land') icon = 'straighten'
    else if (s.serviceType?.toLowerCase().includes('soil')) icon = 'biotech'

    const title = s.serviceType === 'drone' ? 'Drone Spraying' : (s.serviceType === 'land' ? 'Land Prep / Survey' : 'Soil Testing')
    const dateStr = s.details?.date || ''
    const timeStr = s.details?.time || ''
    const detail = `${s.user ? s.user.firstName + ' ' + s.user.lastName : 'Farmer'} • ${dateStr} ${timeStr}`
    
    return {
      id: s._id,
      icon,
      title,
      detail
    }
  }) : []

  // Dynamic Revenue Chart Heights
  const maxRevenue = data?.monthlyRevenue 
    ? Math.max(...data.monthlyRevenue.map(m => m.revenue), 1000) 
    : 1000;
  
  const monthlyRevenueData = data?.monthlyRevenue ? data.monthlyRevenue.map((m, idx) => {
    const isCurrentMonth = idx === new Date().getMonth();
    const heightPercent = Math.max(10, Math.round((m.revenue / maxRevenue) * 90));
    return {
      label: m.label,
      h: `${heightPercent}%`,
      color: isCurrentMonth 
        ? 'bg-[#dce5d9] border border-dashed border-[#bccbb9]' 
        : 'bg-[#22c55e]',
      revenue: m.revenue
    }
  }) : [
    { label: 'Jan', h: '50%', color: 'bg-[#22c55e]', revenue: 0 },
    { label: 'Feb', h: '65%', color: 'bg-[#22c55e]', revenue: 0 },
    { label: 'Mar', h: '35%', color: 'bg-[#22c55e]', revenue: 0 },
    { label: 'Apr', h: '75%', color: 'bg-[#22c55e]', revenue: 0 },
    { label: 'May', h: '85%', color: 'bg-[#22c55e]', revenue: 0 },
    { label: 'Jun', h: '25%', color: 'bg-[#dce5d9] border border-dashed border-[#bccbb9]', revenue: 0 },
  ]

  // Dynamic Donut Chart conic-gradient calculation
  const categoryColors = {
    Fertilizers: '#22c55e',
    Pesticides: '#4ae176',
    Micronutrients: '#cfe6c9',
    Seeds: '#dce5d9',
    Others: '#a1b39c'
  }

  const categoryShareData = data?.categoryShare && data.categoryShare.length > 0
    ? data.categoryShare
    : []

  let accumPercent = 0
  const gradientParts = []
  categoryShareData.forEach(item => {
    const start = accumPercent
    accumPercent += item.percentage
    const end = accumPercent
    const color = categoryColors[item.category] || '#a1b39c'
    gradientParts.push(`${color} ${start}% ${end}%`)
  })
  
  if (accumPercent < 100 && gradientParts.length > 0) {
    const lastColor = categoryColors[categoryShareData[categoryShareData.length - 1].category] || '#a1b39c'
    gradientParts.push(`${lastColor} ${accumPercent}% 100%`)
  }

  const conicGradient = gradientParts.length > 0 
    ? `conic-gradient(${gradientParts.join(', ')})` 
    : 'conic-gradient(#22c55e 0% 100%)'

  let topCategory = 'None'
  let topCategoryVal = -1
  categoryShareData.forEach(item => {
    if (item.percentage > topCategoryVal) {
      topCategoryVal = item.percentage
      topCategory = item.category
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#161d16]">{t('admin_nav.dashboard')}</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white border border-[#bccbb9] rounded-lg p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-semibold text-[#3d4a3d] uppercase tracking-wide">{kpi.label}</div>
              <span className="material-symbols-outlined text-[#006e2f] text-[20px]">{kpi.icon}</span>
            </div>
            <div>
              <div className="text-lg font-bold text-[#161d16] mb-1">{kpi.value}</div>
              <div className={`flex items-center gap-1 text-xs font-medium ${kpi.positive ? 'text-[#22c55e]' : 'text-[#d97706]'}`}>
                <span className="material-symbols-outlined text-[14px]">{kpi.positive ? 'arrow_upward' : 'arrow_downward'}</span>
                {kpi.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-[#bccbb9] rounded-lg p-4">
          <h2 className="font-semibold text-[#161d16] mb-4">Monthly Revenue ({new Date().getFullYear()})</h2>
          <div className="h-56 bg-[#f3fcef] flex items-end justify-around p-4 rounded border border-[#bccbb9]/30">
            {monthlyRevenueData.map((bar, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 flex-1 group relative">
                {/* Tooltip to show revenue value */}
                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#2f3131] text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow z-10">
                  ₹{bar.revenue.toLocaleString()}
                </div>
                <div className={`w-10 ${bar.color} rounded-t transition-all duration-500`} style={{ height: bar.h }}></div>
                <span className="text-xs text-[#3d4a3d]">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Donut Chart */}
        <div className="lg:col-span-5 bg-white border border-[#bccbb9] rounded-lg p-4">
          <h2 className="font-semibold text-[#161d16] mb-4">Orders by Category</h2>
          {categoryShareData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#3d4a3d]">
              <span className="material-symbols-outlined text-4xl text-[#bccbb9] mb-2">donut_large</span>
              <p className="text-sm font-medium">No orders yet</p>
              <p className="text-xs text-[#6d7a6d] mt-1">Category breakdown will appear here once orders are placed.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center h-48">
                <div 
                  className="relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-inner"
                  style={{ background: conicGradient }}
                >
                  <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-xs text-[#3d4a3d]">Top Cat</span>
                    <span className="text-sm font-bold text-[#161d16] truncate max-w-[120px] px-2">{topCategory}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {categoryShareData.map(item => (
                  <div key={item.category} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ background: categoryColors[item.category] || '#a1b39c' }}
                    ></div>
                    <span className="text-xs text-[#3d4a3d]">{item.category} ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Orders + Service Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white border border-[#bccbb9] rounded-lg overflow-hidden">
          <div className="p-4 border-b border-[#bccbb9] flex justify-between items-center bg-[#edf6ea]">
            <h2 className="font-semibold text-[#161d16]">{t('admin_dashboard.recent_orders')}</h2>
            <Link to="/admin/orders" className="text-[#006e2f] text-sm font-semibold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#bccbb9]/50 bg-[#f3fcef] text-[#3d4a3d] text-xs font-bold uppercase">
                  {['ID', t('admin_dashboard.customer'), t('admin_dashboard.product'), t('admin_dashboard.amount'), t('admin_dashboard.status'), 'Action'].map(h => (
                    <th key={h} className="p-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-sm text-[#3d4a3d]">Loading recent orders...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-sm text-[#3d4a3d]">No recent orders found.</td>
                  </tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id} className="border-b border-[#bccbb9]/30 hover:bg-[#edf6ea] transition-colors text-sm">
                      <td className="p-3 font-bold text-[#161d16]">{o.id}</td>
                      <td className="p-3">{o.farmer}</td>
                      <td className="p-3 text-[#3d4a3d] truncate max-w-[200px]" title={o.products}>{o.products}</td>
                      <td className="p-3 font-semibold">{o.amount}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${o.statusColor}`}>{o.status}</span></td>
                      <td className="p-3">
                        <Link to="/admin/orders" className="text-[#006e2f] hover:underline text-xs font-semibold">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="lg:col-span-4 bg-white border border-[#bccbb9] rounded-lg flex flex-col">
          <div className="p-4 border-b border-[#bccbb9] bg-[#edf6ea] flex justify-between items-center">
            <h2 className="font-semibold text-[#161d16]">Recent Service Bookings</h2>
            <Link to="/admin/services" className="text-[#006e2f] text-sm font-semibold hover:underline">View All</Link>
          </div>
          <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto max-h-[350px]">
            {loading ? (
              <div className="text-center p-4 text-sm text-[#3d4a3d]">Loading service bookings...</div>
            ) : serviceBookings.length === 0 ? (
              <div className="text-center p-4 text-sm text-[#3d4a3d]">No service bookings found.</div>
            ) : (
              serviceBookings.map(s => (
                <Link 
                  to="/admin/services" 
                  key={s.id} 
                  className="flex items-start gap-3 p-3 border border-[#bccbb9]/50 rounded-lg hover:border-[#006e2f] transition-colors cursor-pointer bg-[#f3fcef]"
                >
                  <div className="bg-[#cfe6c9] text-[#546850] p-2 rounded-full">
                    <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#161d16]">{s.title}</div>
                    <div className="text-xs text-[#3d4a3d]">{s.detail}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#fef3c7] border border-[#fde68a] rounded-lg p-4 flex items-center gap-4">
          <div className="bg-[#f59e0b] text-white p-2 rounded-full"><span className="material-symbols-outlined">warning</span></div>
          <div>
            <div className="text-sm font-bold text-[#92400e]">{t('admin_dashboard.inventory_alerts')}</div>
            <div className="text-xs text-[#b45309]">
              {data ? `${data.kpis.lowStockCount} items below threshold.` : 'Loading...'}
            </div>
          </div>
        </div>
        <div className="bg-[#edf6ea] border border-[#22c55e]/30 rounded-lg p-4 flex items-center gap-4">
          <div className="bg-[#22c55e] text-white p-2 rounded-full"><span className="material-symbols-outlined">person_add</span></div>
          <div>
            <div className="text-sm font-bold text-[#161d16]">New Registrations</div>
            <div className="text-xs text-[#3d4a3d]">
              {data ? `+${data.newRegistrations} farmers joined this week.` : 'Loading...'}
            </div>
          </div>
        </div>
        <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-lg p-4 flex items-center gap-4">
          <div className="bg-[#ba1a1a] text-white p-2 rounded-full"><span className="material-symbols-outlined">inventory_2</span></div>
          <div>
            <div className="text-sm font-bold text-[#93000a]">Unassigned Orders</div>
            <div className="text-xs text-[#ba1a1a]">
              {data ? `${data.unassignedOrders} orders need delivery partners.` : 'Loading...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
