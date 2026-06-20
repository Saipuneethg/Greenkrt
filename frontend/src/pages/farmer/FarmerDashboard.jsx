import { Link } from 'react-router-dom'

export default function FarmerDashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1c1c] mb-1">My Farm Details</h1>
          <p className="text-[#40493d] text-sm">Detailed overview of Plot A (4.5 Acres)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Crop Info */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[#bfcaba] shadow-sm overflow-hidden">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB949DLBiT_tLpc7-DHzejG5OCoo1Yb29dVIIOpagox6HxNlB52d0Jn7T3h8VSGBnGQdbZkXB9KHc2Kx0jR-dX5Wt1j7HtwAdih8Le2ooPJ9FfqNxsh_mEbl_hBfJJumcP_ViYeTysJLL84o7e0oG5McGA09SsCYQI_nUxE8FAQiSA-dW0WeVJ-ZmGKC7JDbbi7ZAC6KImILkMJNdUB0EwEr0CIhYec1NiaLx2vc6oWLRX5xGD1lUZQLOsCZ5DpKNKpp5q9kCQJmnC5" alt="Farm" className="w-full h-48 object-cover" />
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#1a1c1c]">Paddy (BPT 5204)</h2>
                <p className="text-[#40493d]">Sown on: 15 May 2025 • Stage: Tillering</p>
              </div>
              <div className="bg-[#cfe6c9] text-[#19722b] px-3 py-1 rounded-full text-xs font-bold">Healthy</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-t border-[#bfcaba] pt-6">
              <div>
                <div className="text-xs text-[#707a6c] uppercase font-semibold mb-1">Soil Type</div>
                <div className="font-bold text-[#1a1c1c]">Black Cotton</div>
              </div>
              <div>
                <div className="text-xs text-[#707a6c] uppercase font-semibold mb-1">Est. Yield</div>
                <div className="font-bold text-[#1a1c1c]">28 Quintals/Ac</div>
              </div>
              <div>
                <div className="text-xs text-[#707a6c] uppercase font-semibold mb-1">Next Harvest</div>
                <div className="font-bold text-[#1a1c1c]">Oct 2025</div>
              </div>
            </div>
          </div>
        </div>

        {/* Soil Health Widget */}
        <div className="bg-white rounded-xl border border-[#bfcaba] shadow-sm p-6">
          <h3 className="font-bold text-[#1a1c1c] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0d631b]">science</span>
            Latest Soil Report
          </h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#40493d]">Nitrogen (N)</span>
              <span className="font-bold text-[#ba1a1a]">Low</span>
            </div>
            <div className="w-full bg-[#e2e2e2] rounded-full h-2"><div className="bg-[#ba1a1a] h-2 rounded-full" style={{width:'30%'}}></div></div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#40493d]">Phosphorus (P)</span>
              <span className="font-bold text-[#0d631b]">Optimal</span>
            </div>
            <div className="w-full bg-[#e2e2e2] rounded-full h-2"><div className="bg-[#0d631b] h-2 rounded-full" style={{width:'75%'}}></div></div>
          </div>
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#40493d]">Potassium (K)</span>
              <span className="font-bold text-[#0d631b]">Optimal</span>
            </div>
            <div className="w-full bg-[#e2e2e2] rounded-full h-2"><div className="bg-[#0d631b] h-2 rounded-full" style={{width:'60%'}}></div></div>
          </div>
          <Link to="/dashboard/soil-test">
            <button className="w-full h-[40px] border border-[#0d631b] text-[#0d631b] rounded-lg text-sm font-semibold hover:bg-[#0d631b]/5 transition-colors">
              View Full Report
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
