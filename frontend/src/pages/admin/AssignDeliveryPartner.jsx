import { Link } from 'react-router-dom'

export default function AssignDeliveryPartner() {
  const unassignedOrders = [
    { id: '#ORD-9025', farmer: 'Prakash Rao', location: 'Guntur Rural', items: '2 Bags Urea', distance: '12 km' },
    { id: '#ORD-9026', farmer: 'Naveen Kumar', location: 'Tenali', items: '1L Neem Oil', distance: '18 km' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link to="/admin/delivery">
          <button className="p-2 rounded-full hover:bg-[#bccbb9]/20 text-[#3d4a3d] transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </Link>
        <h1 className="text-2xl font-bold text-[#161d16]">Assign Delivery</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#bccbb9] rounded-lg p-5">
          <h2 className="font-bold text-[#161d16] mb-4">Unassigned Orders (2)</h2>
          <div className="space-y-4">
            {unassignedOrders.map(o => (
              <div key={o.id} className="p-4 border border-[#bccbb9] rounded-lg flex items-start gap-4">
                <input type="checkbox" className="mt-1 w-4 h-4 accent-[#006e2f]" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-[#161d16]">{o.id}</span>
                    <span className="text-xs bg-[#f3fcef] text-[#3d4a3d] px-2 py-0.5 rounded">{o.distance}</span>
                  </div>
                  <div className="text-sm text-[#3d4a3d] mb-1">{o.farmer} • {o.location}</div>
                  <div className="text-xs text-[#006e2f] font-semibold">{o.items}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#bccbb9] rounded-lg p-5">
          <h2 className="font-bold text-[#161d16] mb-4">Available Partners Nearby</h2>
          <div className="space-y-4">
            <div className="p-4 border border-[#006e2f] bg-[#edf6ea] rounded-lg cursor-pointer flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#161d16]">Kumar Logistics</h3>
                <div className="text-sm text-[#3d4a3d]">Capacity: High • 5 km away</div>
              </div>
              <span className="material-symbols-outlined text-[#006e2f]">check_circle</span>
            </div>
            <div className="p-4 border border-[#bccbb9]/50 rounded-lg cursor-pointer hover:border-[#006e2f]">
              <h3 className="font-bold text-[#161d16]">AP Fast Delivery</h3>
              <div className="text-sm text-[#3d4a3d]">Capacity: Medium • 8 km away</div>
            </div>
          </div>
          
          <button className="w-full mt-6 h-[48px] bg-[#006e2f] text-white rounded font-bold uppercase tracking-wider text-sm hover:opacity-90">
            Assign Selected Orders
          </button>
        </div>
      </div>
    </div>
  )
}
