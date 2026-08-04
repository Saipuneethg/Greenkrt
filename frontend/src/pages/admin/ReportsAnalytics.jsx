export default function ReportsAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#161d16]">Reports & Analytics</h1>
        <button 
          onClick={() => window.print()}
          className="h-[40px] px-4 border border-[#006e2f] text-[#006e2f] rounded font-semibold text-sm flex items-center gap-2 hover:bg-[#006e2f]/5"
        >
          <span className="material-symbols-outlined text-[18px]">download</span> Download PDF
        </button>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-[#edf6ea] border border-[#22c55e]/30 rounded-lg p-6 flex items-center gap-4">
        <div className="bg-[#22c55e] text-white p-3 rounded-full shrink-0">
          <span className="material-symbols-outlined text-[28px]">bar_chart</span>
        </div>
        <div>
          <h2 className="font-bold text-[#161d16] text-lg">Advanced Analytics — Coming Soon</h2>
          <p className="text-sm text-[#3d4a3d] mt-1">
            Detailed revenue charts, product sales breakdowns, and farmer acquisition analytics will be available here. 
            Current data is visible on the main <strong>Dashboard</strong> page.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#bccbb9] rounded-lg p-5">
            <h2 className="font-bold text-[#161d16] mb-4">Revenue Growth</h2>
            <div className="h-64 bg-[#f3fcef] rounded flex flex-col items-center justify-center border border-dashed border-[#bccbb9] gap-2">
              <span className="material-symbols-outlined text-4xl text-[#bccbb9]">show_chart</span>
              <span className="text-[#3d4a3d] font-medium">Revenue chart coming soon</span>
              <span className="text-xs text-[#6d7a6d]">Monthly revenue data is available on the Admin Dashboard</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-[#bccbb9] rounded-lg p-5">
              <h2 className="font-bold text-[#161d16] mb-4">Service vs Product Sales</h2>
              <div className="h-48 bg-[#f3fcef] rounded flex flex-col items-center justify-center border border-dashed border-[#bccbb9] gap-2">
                <span className="material-symbols-outlined text-3xl text-[#bccbb9]">pie_chart</span>
                <span className="text-sm text-[#3d4a3d]">Coming soon</span>
              </div>
            </div>
            <div className="bg-white border border-[#bccbb9] rounded-lg p-5">
              <h2 className="font-bold text-[#161d16] mb-4">Farmer Acquisition</h2>
              <div className="h-48 bg-[#f3fcef] rounded flex flex-col items-center justify-center border border-dashed border-[#bccbb9] gap-2">
                <span className="material-symbols-outlined text-3xl text-[#bccbb9]">people</span>
                <span className="text-sm text-[#3d4a3d]">Coming soon</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-[#bccbb9] rounded-lg p-5">
            <h2 className="font-bold text-[#161d16] mb-4">Top Selling Products</h2>
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <span className="material-symbols-outlined text-3xl text-[#bccbb9]">inventory_2</span>
              <p className="text-sm text-[#3d4a3d]">Product sales ranking will appear here once orders are processed.</p>
            </div>
          </div>
          
          <div className="bg-[#edf6ea] border border-[#22c55e]/30 rounded-lg p-5">
            <h2 className="font-bold text-[#161d16] mb-2">AI Insights</h2>
            <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
              <span className="material-symbols-outlined text-3xl text-[#22c55e]/50">psychology</span>
              <p className="text-sm text-[#3d4a3d]">AI-powered insights will be generated based on your real order and booking patterns.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

