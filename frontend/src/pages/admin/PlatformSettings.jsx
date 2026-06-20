export default function PlatformSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#161d16]">Platform Settings</h1>

      <div className="bg-white border border-[#bccbb9] rounded-lg overflow-hidden">
        <div className="flex border-b border-[#bccbb9] bg-[#f3fcef]">
          {['General', 'Security', 'Notifications', 'API Keys'].map((tab, i) => (
            <button key={tab} className={`px-6 py-4 text-sm font-semibold ${i === 0 ? 'text-[#006e2f] border-b-2 border-[#006e2f] bg-white' : 'text-[#3d4a3d] hover:text-[#161d16]'}`}>
              {tab}
            </button>
          ))}
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-bold text-[#161d16] mb-4">Platform Details</h3>
            <div className="grid grid-cols-2 gap-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-[#3d4a3d] mb-1">Platform Name</label>
                <input type="text" defaultValue="GreenKrt Admin" className="w-full border border-[#bccbb9] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#006e2f]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3d4a3d] mb-1">Support Email</label>
                <input type="email" defaultValue="support@greenkrt.com" className="w-full border border-[#bccbb9] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#006e2f]" />
              </div>
            </div>
          </div>

          <div className="border-t border-[#bccbb9] pt-6">
            <h3 className="font-bold text-[#161d16] mb-4">Regional Settings</h3>
            <div className="grid grid-cols-2 gap-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-[#3d4a3d] mb-1">Default Currency</label>
                <select className="w-full border border-[#bccbb9] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#006e2f]">
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3d4a3d] mb-1">Timezone</label>
                <select className="w-full border border-[#bccbb9] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#006e2f]">
                  <option>Asia/Kolkata (IST)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-[#bccbb9] pt-6 flex justify-end gap-3">
            <button className="px-6 py-2 border border-[#bccbb9] rounded text-sm font-semibold text-[#3d4a3d] hover:bg-[#f3fcef]">Cancel</button>
            <button className="px-6 py-2 bg-[#006e2f] text-white rounded text-sm font-semibold hover:bg-[#006e2f]/90">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}
