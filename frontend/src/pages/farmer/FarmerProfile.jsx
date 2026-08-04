import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import LocationInput from '../../components/LocationInput'
import API_BASE from '../../config/api'

export default function FarmerProfile() {
  const { user, updateUser } = useAuth()
  const { t } = useLanguage()
  
  const [plots, setPlots] = useState([])
  const [plotsLoading, setPlotsLoading] = useState(true)

  // Fetch farms from backend (same source as FarmerDashboard)
  const fetchFarms = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/farms`, {
        headers: { 'x-auth-token': sessionStorage.getItem('greenkrt_token') }
      })
      if (res.ok) {
        setPlots(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch farms:', err)
    } finally {
      setPlotsLoading(false)
    }
  }

  useEffect(() => {
    fetchFarms()
  }, [])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlot, setEditingPlot] = useState(null)
  const [formData, setFormData] = useState({ name: '', location: '', crop: '', acres: '', soilType: '' })

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', phone: '', email: '', district: '' })
  const [profileError, setProfileError] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)

  const handleOpenEditProfile = () => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      email: user?.email || '',
      district: user?.district || ''
    })
    setProfileError('')
    setIsEditProfileOpen(true)
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileError('')
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
        setIsEditProfileOpen(false)
      } else {
        setProfileError(data.message || 'Failed to update profile')
      }
    } catch (err) {
      setProfileError('Network error, please try again.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingPlot(null)
    setFormData({ name: '', location: '', crop: '', acres: '', soilType: '' })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (plot) => {
    setEditingPlot(plot)
    setFormData({ name: plot.name, location: plot.location || '', crop: plot.crop, acres: plot.acres, soilType: plot.soilType })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/api/farms/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': sessionStorage.getItem('greenkrt_token') }
      })
      setPlots(plots.filter(p => p._id !== id))
    } catch (err) {
      console.error('Failed to delete farm:', err)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingPlot) {
        const res = await fetch(`${API_BASE}/api/farms/${editingPlot._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': sessionStorage.getItem('greenkrt_token') },
          body: JSON.stringify(formData)
        })
        if (res.ok) {
          const updated = await res.json()
          setPlots(plots.map(p => p._id === editingPlot._id ? updated : p))
        }
      } else {
        const res = await fetch(`${API_BASE}/api/farms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': sessionStorage.getItem('greenkrt_token') },
          body: JSON.stringify(formData)
        })
        if (res.ok) {
          const newFarm = await res.json()
          setPlots([newFarm, ...plots])
        }
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to save farm:', err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1c1c] mb-1">{t('profile.title')}</h1>
          <p className="text-[#40493d] text-sm">{t('profile.subtitle')}</p>
        </div>
        <button onClick={handleOpenEditProfile} className="h-[40px] px-4 border border-[#0d631b] text-[#0d631b] rounded-lg text-sm font-semibold hover:bg-[#0d631b]/5 transition-colors">
          {t('profile.edit_profile') || 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-[#bfcaba] shadow-sm p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[#2e7d32] border-4 border-[#88d982] flex items-center justify-center text-white text-3xl font-bold mb-4 uppercase">
            {user?.firstName?.[0] || 'U'}
          </div>
          <h2 className="text-xl font-bold text-[#1a1c1c]">{user?.firstName} {user?.lastName}</h2>
          <p className="text-[#40493d] text-sm mb-4">{user?.phone || <span className="italic text-[#707a6c]">Phone not set</span>}</p>
          <span className="px-3 py-1 bg-[#ffddb5] text-[#643f00] text-xs font-bold rounded-full mb-6 capitalize">{user?.role === 'farmer' ? t('profile.farmer') : user?.role || t('profile.farmer')}</span>
          
          <div className="w-full text-left space-y-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#707a6c]">mail</span>
              <span className="text-sm text-[#1a1c1c]">{user?.email || <span className="italic text-[#707a6c]">Email not set</span>}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#707a6c]">location_on</span>
              <span className="text-sm text-[#1a1c1c]">{user?.district ? `${user.district}, AP` : <span className="italic text-[#707a6c]">District not set</span>}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#707a6c]">translate</span>
              <span className="text-sm text-[#1a1c1c]">{t('profile.languages')}</span>
            </div>
          </div>
        </div>

        {/* Farm Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#bfcaba] shadow-sm overflow-hidden">
            <div className="bg-[#f3f3f3] px-6 py-4 border-b border-[#bfcaba] flex justify-between items-center">
              <h3 className="font-bold text-[#1a1c1c] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0d631b]">landscape</span>
                {t('profile.my_farms')}
              </h3>
              <button onClick={handleOpenAdd} className="text-[#0d631b] text-sm font-semibold hover:underline">{t('profile.add_farm')}</button>
            </div>
            <div className="p-6 space-y-4">
              {plotsLoading ? (
                <p className="text-[#40493d] text-sm">Loading farms...</p>
              ) : plots.length === 0 ? (
                <p className="text-[#40493d] text-sm">{t('profile.no_farms')}</p>
              ) : null}
              {plots.map(plot => (
                <div key={plot._id} className="border border-[#bfcaba] rounded-xl p-6 flex justify-between items-center bg-[#f9f9f9] shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-[#9cf49c] rounded-xl flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-[#19722b] text-[32px]">grass</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-[#1a1c1c]">{plot.name} - {plot.crop}</h4>
                      <div className="text-base text-[#40493d] font-medium">{plot.acres} {t('dashboard.acres')} • {plot.soilType}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleOpenEdit(plot)} className="text-[#707a6c] hover:text-[#0d631b] p-2 bg-white rounded-full border border-transparent hover:border-[#0d631b] transition-colors">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button onClick={() => handleDelete(plot._id)} className="text-[#707a6c] hover:text-[#ba1a1a] p-2 bg-white rounded-full border border-transparent hover:border-[#ba1a1a] transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="bg-[#f0f6ec] px-6 py-4 border-b border-[#bfcaba] flex justify-between items-center rounded-t-2xl shrink-0">
              <h3 className="font-bold text-lg text-[#0d631b]">
                {editingPlot ? t('profile.edit_plot') : t('profile.add_new_plot')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#40493d] hover:text-[#1a1c1c]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">{t('my_farm.farm_name')}</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder={t('my_farm.eg_plot_b')} className="w-full h-10 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">{t('my_farm.location')}</label>
                  <LocationInput 
                    value={formData.location} 
                    onChange={val => setFormData({...formData, location: val})} 
                    placeholder={t('my_farm.eg_ramapuram')} 
                    className="w-full h-10 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">{t('my_farm.crop_type')}</label>
                    <input required value={formData.crop} onChange={e => setFormData({...formData, crop: e.target.value})} type="text" placeholder={t('my_farm.eg_cotton')} className="w-full h-10 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">{t('my_farm.acres')}</label>
                    <input required value={formData.acres} onChange={e => setFormData({...formData, acres: e.target.value})} type="number" step="0.1" placeholder={t('my_farm.eg_acres')} className="w-full h-10 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">{t('my_farm.soil_type')}</label>
                  <select required value={formData.soilType} onChange={e => setFormData({...formData, soilType: e.target.value})} className="w-full h-10 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b] bg-white text-[#1a1c1c]">
                    <option value="">{t('my_farm.select_soil')}</option>
                    <option value="Black Cotton Soil">{t('my_farm.black_cotton')}</option>
                    <option value="Red Soil">{t('my_farm.red_soil')}</option>
                    <option value="Alluvial Soil">{t('my_farm.alluvial_soil')}</option>
                    <option value="Laterite Soil">{t('my_farm.laterite_soil')}</option>
                    <option value="Sandy Soil">{t('my_farm.sandy_soil')}</option>
                    <option value="Clayey Soil">{t('my_farm.clayey_soil')}</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3 shrink-0">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-10 border border-[#bfcaba] text-[#40493d] font-bold rounded-lg hover:bg-[#f3f3f3] transition-colors">
                    {t('my_farm.cancel')}
                  </button>
                  <button type="submit" className="flex-1 h-10 bg-[#0d631b] text-white font-bold rounded-lg hover:bg-[#0a4a14] transition-colors">
                    {editingPlot ? t('my_farm.save_changes') : t('profile.add_plot')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isEditProfileOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="bg-[#f0f6ec] px-6 py-4 border-b border-[#bfcaba] flex justify-between items-center rounded-t-2xl shrink-0">
              <h3 className="font-bold text-lg text-[#0d631b]">
                {t('profile.edit_profile') || 'Edit Profile'}
              </h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-[#40493d] hover:text-[#1a1c1c]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {profileError && (
                <div className="mb-4 p-3 bg-[#fff0f0] border border-[#ffdad6] text-[#ba1a1a] rounded text-sm font-semibold">
                  {profileError}
                </div>
              )}
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">First Name</label>
                    <input required value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} type="text" className="w-full h-10 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Last Name</label>
                    <input required value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} type="text" className="w-full h-10 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Phone Number</label>
                  <input required value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} type="text" className="w-full h-10 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Email</label>
                  <input required value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} type="email" className="w-full h-10 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">District</label>
                  <LocationInput 
                    value={profileData.district} 
                    onChange={val => setProfileData({...profileData, district: val})} 
                    placeholder="Search district..." 
                    className="w-full h-10 px-3 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b]" 
                  />
                </div>
                <div className="pt-4 flex gap-3 shrink-0">
                  <button type="button" onClick={() => setIsEditProfileOpen(false)} className="flex-1 h-10 border border-[#bfcaba] text-[#40493d] font-bold rounded-lg hover:bg-[#f3f3f3] transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={profileSaving} className="flex-1 h-10 bg-[#0d631b] text-white font-bold rounded-lg hover:bg-[#0a4a14] transition-colors disabled:opacity-50">
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
