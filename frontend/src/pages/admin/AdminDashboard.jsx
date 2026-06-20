import { useLanguage } from '../../context/LanguageContext'

export default function AdminDashboard() {
  const { t } = useLanguage()
  const kpis = [
    { label: t('admin_dashboard.active_farmers'), value: '12,480', icon: 'agriculture', trend: '+8% from last month', positive: true },
    { label: t('admin_nav.orders'), value: '3,241', icon: 'shopping_cart', trend: '+12% from last month', positive: true },
    { label: t('admin_dashboard.total_sales'), value: '₹18,40,200', icon: 'payments', trend: '+15% from last month', positive: true },
    { label: t('admin_dashboard.pending_orders'), value: '47', icon: 'local_shipping', trend: 'Needs attention', positive: false },
    { label: t('admin_dashboard.services_booked'), value: '23', icon: 'build', trend: 'Ongoing today', positive: true },
  ]

  const orders = [
    { id: '#ORD-9021', farmer: 'Ramesh Singh', products: 'Urea, NPK...', amount: '₹4,200', status: 'Pending', statusColor: 'bg-[#cfe6c9] text-[#546850]' },
    { id: '#ORD-9020', farmer: 'Suresh Patel', products: 'Neem Oil...', amount: '₹1,850', status: 'Delivered', statusColor: 'bg-[#22c55e] text-white' },
    { id: '#ORD-9019', farmer: 'Kamal Hasan', products: 'Seeds, Tools...', amount: '₹6,300', status: 'In Progress', statusColor: 'bg-[#dbeafe] text-[#1e3a8a]' },
    { id: '#ORD-9018', farmer: 'Vikas Reddy', products: 'Tractor Parts', amount: '₹12,000', status: 'Cancelled', statusColor: 'bg-[#ffdad6] text-[#93000a]' },
  ]

  const serviceBookings = [
    { icon: 'agriculture', title: 'Soil Testing', detail: 'Farm ID: F-102 • 10:00 AM' },
    { icon: 'water_drop', title: 'Irrigation Setup', detail: 'Farm ID: F-44 • 01:30 PM' },
    { icon: 'build', title: 'Equipment Repair', detail: 'Farm ID: F-89 • 04:00 PM' },
  ]

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
          <h2 className="font-semibold text-[#161d16] mb-4">Monthly Revenue (2025)</h2>
          <div className="h-56 bg-[#f3fcef] flex items-end justify-around p-4 rounded border border-[#bccbb9]/30">
            {[
              { label: 'Jan', h: '50%', color: 'bg-[#22c55e]' },
              { label: 'Feb', h: '65%', color: 'bg-[#22c55e]' },
              { label: 'Mar', h: '35%', color: 'bg-[#22c55e]' },
              { label: 'Apr', h: '75%', color: 'bg-[#22c55e]' },
              { label: 'May', h: '85%', color: 'bg-[#d97706]' },
              { label: 'Jun', h: '25%', color: 'bg-[#dce5d9] border border-dashed border-[#bccbb9]' },
            ].map(bar => (
              <div key={bar.label} className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-10 ${bar.color} rounded-t`} style={{ height: bar.h }}></div>
                <span className="text-xs text-[#3d4a3d]">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Donut Chart */}
        <div className="lg:col-span-5 bg-white border border-[#bccbb9] rounded-lg p-4">
          <h2 className="font-semibold text-[#161d16] mb-4">Orders by Category</h2>
          <div className="flex items-center justify-center h-48">
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center"
              style={{ background: 'conic-gradient(#22c55e 0% 45%, #4ae176 45% 73%, #cfe6c9 73% 90%, #dce5d9 90% 100%)' }}>
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-xs text-[#3d4a3d]">Top Cat</span>
                <span className="text-sm font-bold text-[#161d16]">Fertilizers</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {[
              { color: '#22c55e', label: 'Fertilizers (45%)' },
              { color: '#4ae176', label: 'Pesticides (28%)' },
              { color: '#cfe6c9', label: 'Micro (17%)' },
              { color: '#dce5d9', label: 'Others (10%)' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div>
                <span className="text-xs text-[#3d4a3d]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders + Service Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white border border-[#bccbb9] rounded-lg overflow-hidden">
          <div className="p-4 border-b border-[#bccbb9] flex justify-between items-center bg-[#edf6ea]">
            <h2 className="font-semibold text-[#161d16]">{t('admin_dashboard.recent_orders')}</h2>
            <button className="text-[#006e2f] text-sm font-semibold hover:underline">View All</button>
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
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-[#bccbb9]/30 hover:bg-[#edf6ea] transition-colors text-sm">
                    <td className="p-3 font-bold text-[#161d16]">{o.id}</td>
                    <td className="p-3">{o.farmer}</td>
                    <td className="p-3 text-[#3d4a3d]">{o.products}</td>
                    <td className="p-3 font-semibold">{o.amount}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${o.statusColor}`}>{o.status}</span></td>
                    <td className="p-3"><button className="text-[#006e2f] hover:underline text-xs font-semibold">Details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="lg:col-span-4 bg-white border border-[#bccbb9] rounded-lg flex flex-col">
          <div className="p-4 border-b border-[#bccbb9] bg-[#edf6ea]">
            <h2 className="font-semibold text-[#161d16]">Today's Service Bookings</h2>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {serviceBookings.map(s => (
              <div key={s.title} className="flex items-start gap-3 p-3 border border-[#bccbb9]/50 rounded-lg hover:border-[#006e2f] transition-colors cursor-pointer bg-[#f3fcef]">
                <div className="bg-[#cfe6c9] text-[#546850] p-2 rounded-full">
                  <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#161d16]">{s.title}</div>
                  <div className="text-xs text-[#3d4a3d]">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#fef3c7] border border-[#fde68a] rounded-lg p-4 flex items-center gap-4">
          <div className="bg-[#f59e0b] text-white p-2 rounded-full"><span className="material-symbols-outlined">warning</span></div>
          <div>
            <div className="text-sm font-bold text-[#92400e]">{t('admin_dashboard.inventory_alerts')}</div>
            <div className="text-xs text-[#b45309]">12 items below threshold.</div>
          </div>
        </div>
        <div className="bg-[#edf6ea] border border-[#22c55e]/30 rounded-lg p-4 flex items-center gap-4">
          <div className="bg-[#22c55e] text-white p-2 rounded-full"><span className="material-symbols-outlined">person_add</span></div>
          <div>
            <div className="text-sm font-bold text-[#161d16]">New Registrations</div>
            <div className="text-xs text-[#3d4a3d]">+45 farmers joined this week.</div>
          </div>
        </div>
        <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-lg p-4 flex items-center gap-4">
          <div className="bg-[#ba1a1a] text-white p-2 rounded-full"><span className="material-symbols-outlined">inventory_2</span></div>
          <div>
            <div className="text-sm font-bold text-[#93000a]">Unassigned Orders</div>
            <div className="text-xs text-[#ba1a1a]">8 orders need delivery partners.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
