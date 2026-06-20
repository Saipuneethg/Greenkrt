import { useAuth } from '../../context/AuthContext'

export default function FarmerProfile() {
  const { user } = useAuth()
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1c1c] mb-1">My Profile</h1>
          <p className="text-[#40493d] text-sm">Manage your personal details and farm profiles.</p>
        </div>
        <button className="h-[40px] px-4 border border-[#0d631b] text-[#0d631b] rounded-lg text-sm font-semibold hover:bg-[#0d631b]/5 transition-colors">
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-[#bfcaba] shadow-sm p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[#2e7d32] border-4 border-[#88d982] flex items-center justify-center text-white text-3xl font-bold mb-4 uppercase">
            {user?.firstName?.[0] || 'U'}
          </div>
          <h2 className="text-xl font-bold text-[#1a1c1c]">{user?.firstName} {user?.lastName}</h2>
          <p className="text-[#40493d] text-sm mb-4">{user?.phone || '+91 98765 43210'}</p>
          <span className="px-3 py-1 bg-[#ffddb5] text-[#643f00] text-xs font-bold rounded-full mb-6 capitalize">{user?.role || 'Farmer'}</span>
          
          <div className="w-full text-left space-y-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#707a6c]">mail</span>
              <span className="text-sm text-[#1a1c1c]">{user?.email || 'farmer@greenkrt.com'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#707a6c]">location_on</span>
              <span className="text-sm text-[#1a1c1c]">{user?.district || 'Guntur'}, AP</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#707a6c]">translate</span>
              <span className="text-sm text-[#1a1c1c]">Telugu, English</span>
            </div>
          </div>
        </div>

        {/* Farm Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#bfcaba] shadow-sm overflow-hidden">
            <div className="bg-[#f3f3f3] px-6 py-4 border-b border-[#bfcaba] flex justify-between items-center">
              <h3 className="font-bold text-[#1a1c1c] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0d631b]">landscape</span>
                My Farms
              </h3>
              <button className="text-[#0d631b] text-sm font-semibold hover:underline">+ Add Farm</button>
            </div>
            <div className="p-6">
              <div className="border border-[#bfcaba] rounded-lg p-4 flex justify-between items-center bg-[#f9f9f9]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#9cf49c] rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#19722b]">grass</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a1c1c]">Plot A - Rice Field</h4>
                    <div className="text-sm text-[#40493d]">4.5 Acres • Black Cotton Soil</div>
                  </div>
                </div>
                <button className="text-[#707a6c] hover:text-[#0d631b]">
                  <span className="material-symbols-outlined">edit</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#bfcaba] shadow-sm overflow-hidden">
            <div className="bg-[#f3f3f3] px-6 py-4 border-b border-[#bfcaba]">
              <h3 className="font-bold text-[#1a1c1c] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0d631b]">settings</span>
                Preferences
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-[#1a1c1c] text-sm">WhatsApp Notifications</h4>
                  <p className="text-xs text-[#40493d]">Receive order updates on WhatsApp</p>
                </div>
                <div className="w-10 h-6 bg-[#00C853] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-[#1a1c1c] text-sm">Weather Alerts</h4>
                  <p className="text-xs text-[#40493d]">Daily SMS about severe weather conditions</p>
                </div>
                <div className="w-10 h-6 bg-[#00C853] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
