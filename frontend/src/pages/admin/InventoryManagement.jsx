export default function InventoryManagement() {
  const warehouses = [
    { id: 'WH-01', name: 'Guntur Main Hub', capacity: '85%', status: 'Operational' },
    { id: 'WH-02', name: 'Vijayawada Dist', capacity: '92%', status: 'Warning' },
    { id: 'WH-03', name: 'Tenali Local', capacity: '45%', status: 'Operational' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#161d16]">Inventory & Warehouses</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {warehouses.map(w => (
          <div key={w.id} className="bg-white border border-[#bccbb9] rounded-lg p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-[#161d16]">{w.name}</h3>
                <span className="text-xs text-[#3d4a3d]">{w.id}</span>
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded ${w.status === 'Warning' ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#cfe6c9] text-[#19722b]'}`}>{w.status}</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#3d4a3d]">Capacity Utilization</span>
                <span className="font-bold text-[#161d16]">{w.capacity}</span>
              </div>
              <div className="w-full bg-[#dce5d9] rounded-full h-2">
                <div className={`h-2 rounded-full ${w.status === 'Warning' ? 'bg-[#ba1a1a]' : 'bg-[#006e2f]'}`} style={{ width: w.capacity }}></div>
              </div>
            </div>
            <button className="w-full h-[36px] bg-[#f3fcef] border border-[#bccbb9] text-[#161d16] rounded font-semibold text-sm hover:bg-[#e8f0e4]">Manage Stock</button>
          </div>
        ))}
      </div>
      
      <div className="bg-white border border-[#bccbb9] rounded-lg p-5">
        <h2 className="font-bold text-[#161d16] mb-4">Stock Transfer Requests</h2>
        <div className="p-8 text-center text-[#3d4a3d] bg-[#f3fcef] rounded-lg border border-dashed border-[#bccbb9]">
          <span className="material-symbols-outlined text-4xl mb-2 text-[#bccbb9]">swap_horiz</span>
          <p>No active transfer requests.</p>
        </div>
      </div>
    </div>
  )
}
