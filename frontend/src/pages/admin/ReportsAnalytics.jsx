export default function ReportsAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#161d16]">Reports & Analytics</h1>
        <button className="h-[40px] px-4 border border-[#006e2f] text-[#006e2f] rounded font-semibold text-sm flex items-center gap-2 hover:bg-[#006e2f]/5">
          <span className="material-symbols-outlined text-[18px]">download</span> Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#bccbb9] rounded-lg p-5">
            <h2 className="font-bold text-[#161d16] mb-4">Revenue Growth</h2>
            <div className="h-64 bg-[#f3fcef] rounded flex items-center justify-center border border-dashed border-[#bccbb9]">
              <span className="text-[#3d4a3d]">Line Chart Placeholder</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-[#bccbb9] rounded-lg p-5">
              <h2 className="font-bold text-[#161d16] mb-4">Service vs Product Sales</h2>
              <div className="h-48 bg-[#f3fcef] rounded flex items-center justify-center border border-dashed border-[#bccbb9]">
                <span className="text-[#3d4a3d]">Pie Chart Placeholder</span>
              </div>
            </div>
            <div className="bg-white border border-[#bccbb9] rounded-lg p-5">
              <h2 className="font-bold text-[#161d16] mb-4">Farmer Acquisition</h2>
              <div className="h-48 bg-[#f3fcef] rounded flex items-center justify-center border border-dashed border-[#bccbb9]">
                <span className="text-[#3d4a3d]">Bar Chart Placeholder</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-[#bccbb9] rounded-lg p-5">
            <h2 className="font-bold text-[#161d16] mb-4">Top Selling Products</h2>
            <div className="space-y-3">
              {[
                { name: 'Urea (Granular)', sales: '840 units' },
                { name: 'NPK 20:20:20', sales: '620 units' },
                { name: 'Neem Oil', sales: '415 units' },
              ].map((p, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-[#bccbb9]/30 rounded">
                  <span className="font-semibold text-sm text-[#161d16]">{p.name}</span>
                  <span className="text-xs text-[#006e2f] bg-[#cfe6c9] px-2 py-1 rounded">{p.sales}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[#edf6ea] border border-[#22c55e]/30 rounded-lg p-5">
            <h2 className="font-bold text-[#161d16] mb-2">AI Insights</h2>
            <ul className="space-y-2 text-sm text-[#3d4a3d]">
              <li className="flex gap-2"><span className="text-[#006e2f]">•</span> Fertilizer demand is projected to spike by 15% next week due to monsoon onset in Guntur.</li>
              <li className="flex gap-2"><span className="text-[#006e2f]">•</span> Drone spraying service bookings increased by 40% among cotton farmers.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
