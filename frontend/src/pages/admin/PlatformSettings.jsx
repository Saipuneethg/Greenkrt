import { useState } from 'react'
import API_BASE from '../../config/api'
import { useAuth } from '../../context/AuthContext'

export default function PlatformSettings() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('Admin Profile')
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [profileError, setProfileError] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')

  const [platformSaving, setPlatformSaving] = useState(false)
  const [platformSuccess, setPlatformSuccess] = useState('')

  const handlePlatformSave = () => {
    setPlatformSaving(true)
    setPlatformSuccess('')
    setTimeout(() => {
      setPlatformSaving(false)
      setPlatformSuccess('Platform settings saved successfully!')
    }, 600)
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('greenkrt_token')
        },
        body: JSON.stringify(profileData)
      })
      const data = await res.json()
      if (res.ok) {
        updateUser(data)
        setProfileSuccess('Profile updated successfully!')
      } else {
        setProfileError(data.message || 'Failed to update profile')
      }
    } catch (err) {
      setProfileError('Network error, please try again.')
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#161d16]">Settings</h1>

      <div className="bg-white border border-[#bccbb9] rounded-lg overflow-hidden">
        <div className="flex border-b border-[#bccbb9] bg-[#f3fcef]">
          {['Admin Profile', 'Platform Settings'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-semibold ${activeTab === tab ? 'text-[#006e2f] border-b-2 border-[#006e2f] bg-white' : 'text-[#3d4a3d] hover:text-[#161d16]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {activeTab === 'Admin Profile' && (
          <div className="p-6">
            <h3 className="font-bold text-[#161d16] mb-4">Edit Admin Profile</h3>
            {profileError && (
              <div className="mb-4 p-3 bg-[#fff0f0] border border-[#ffdad6] text-[#ba1a1a] rounded text-sm font-semibold">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="mb-4 p-3 bg-[#f0f6ec] border border-[#cfe6c9] text-[#0d631b] rounded text-sm font-semibold">
                {profileSuccess}
              </div>
            )}
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-[#3d4a3d] mb-1">First Name</label>
                  <input required value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} type="text" className="w-full border border-[#bccbb9] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#006e2f]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3d4a3d] mb-1">Last Name</label>
                  <input required value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} type="text" className="w-full border border-[#bccbb9] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#006e2f]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3d4a3d] mb-1">Email</label>
                  <input required value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} type="email" className="w-full border border-[#bccbb9] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#006e2f]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3d4a3d] mb-1">Phone Number</label>
                  <input required value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} type="text" className="w-full border border-[#bccbb9] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#006e2f]" />
                </div>
              </div>
              <div className="border-t border-[#bccbb9] pt-6 flex justify-end gap-3 max-w-xl">
                <button type="submit" disabled={profileSaving} className="px-6 py-2 bg-[#006e2f] text-white rounded text-sm font-semibold hover:bg-[#006e2f]/90 disabled:opacity-50">
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'Platform Settings' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-bold text-[#161d16] mb-4">Platform Details</h3>
              {platformSuccess && (
                <div className="mb-4 p-3 bg-[#f0f6ec] border border-[#cfe6c9] text-[#0d631b] rounded text-sm font-semibold">
                  {platformSuccess}
                </div>
              )}
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
              <button 
                onClick={handlePlatformSave} 
                disabled={platformSaving} 
                className="px-6 py-2 bg-[#006e2f] text-white rounded text-sm font-semibold hover:bg-[#006e2f]/90 disabled:opacity-50"
              >
                {platformSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
