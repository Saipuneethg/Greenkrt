import { Link } from 'react-router-dom'
import API_BASE from '../../config/api'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import LocationInput from '../../components/LocationInput'
import { useLanguage } from '../../context/LanguageContext'

export default function FarmerDashboard() {
  const { t } = useLanguage()
  const [plots, setPlots] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingPlot, setDeletingPlot] = useState(null)
  const [editingPlot, setEditingPlot] = useState(null)
  const [formData, setFormData] = useState({ name: '', location: '', crop: '', acres: '', soilType: '' })
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchFarms = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/farms`, {
        headers: { 'x-auth-token': sessionStorage.getItem('greenkrt_token') }
      })
      if (res.ok) {
        setPlots(await res.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    fetchFarms()
  }, [])

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

  const confirmDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/api/farms/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': sessionStorage.getItem('greenkrt_token') }
      })
      setPlots(plots.filter(p => p._id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingPlot(null)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingPlot) {
        const res = await fetch(`${API_BASE}/api/farms/${editingPlot._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': sessionStorage.getItem('greenkrt_token') 
          },
          body: JSON.stringify(formData)
        })
        if (res.ok) {
          const updated = await res.json()
          setPlots(plots.map(p => p._id === editingPlot._id ? updated : p))
        }
      } else {
        const res = await fetch(`${API_BASE}/api/farms`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': sessionStorage.getItem('greenkrt_token') 
          },
          body: JSON.stringify(formData)
        })
        if (res.ok) {
          const newFarm = await res.json()
          setPlots([newFarm, ...plots])
        }
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1c1c] mb-1">{t('my_farm.title')}</h1>
          <p className="text-[#40493d] text-sm">{t('my_farm.subtitle')}</p>
        </div>
        <button onClick={handleOpenAdd} className="h-[40px] px-4 bg-[#0d631b] text-white rounded-lg text-sm font-semibold hover:bg-[#0a4a14] transition-colors flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span> {t('my_farm.add_farm')}
        </button>
      </div>

      <div className="space-y-4">
        {/* Main Crop Info - List of Farms */}
        {plots.length === 0 && (
          <div className="bg-white rounded-xl border border-[#bfcaba] p-8 text-center shadow-sm">
            <span className="material-symbols-outlined text-4xl text-[#bfcaba] mb-2">landscape</span>
            <p className="text-[#40493d]">{t('my_farm.no_farms')}</p>
          </div>
        )}
        {plots.map(plot => (
          <div key={plot._id} className="bg-white rounded-xl border border-[#bfcaba] shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#1a1c1c]">{plot.name}</h2>
                  <p className="text-[#40493d] flex items-center gap-1 mt-1 text-sm">
                    <span className="material-symbols-outlined text-[16px]">location_on</span> 
                    {plot.location || t('my_farm.location_not_set')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenEdit(plot)} className="bg-[#f0f6ec] text-[#0d631b] px-3 py-1.5 rounded text-sm font-bold border border-[#cfe6c9] hover:bg-[#cfe6c9] transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">edit</span> {t('my_farm.edit')}
                  </button>
                  <button onClick={() => setDeletingPlot(plot._id)} className="bg-[#fff0f0] text-[#ba1a1a] px-3 py-1.5 rounded text-sm font-bold border border-[#ffdad6] hover:bg-[#ffdad6] transition-colors flex items-center">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 border-t border-[#bfcaba] pt-6">
                <div>
                  <div className="text-xs text-[#707a6c] uppercase font-semibold mb-1">{t('my_farm.crop_type')}</div>
                  <div className="font-bold text-[#1a1c1c]">{plot.crop || t('my_farm.na')}</div>
                </div>
                <div>
                  <div className="text-xs text-[#707a6c] uppercase font-semibold mb-1">{t('my_farm.acres')}</div>
                  <div className="font-bold text-[#1a1c1c]">{plot.acres || '0'} {t('my_farm.ac')}</div>
                </div>
                <div>
                  <div className="text-xs text-[#707a6c] uppercase font-semibold mb-1">{t('my_farm.soil_type')}</div>
                  <div className="font-bold text-[#1a1c1c]">{plot.soilType || t('my_farm.unknown')}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="bg-[#f0f6ec] px-6 py-4 border-b border-[#bfcaba] flex justify-between items-center rounded-t-2xl shrink-0">
              <h3 className="font-bold text-lg text-[#0d631b]">
                {editingPlot ? t('my_farm.edit_farm_details') : t('my_farm.add_new_farm')}
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
                    {editingPlot ? t('my_farm.save_changes') : t('my_farm.add_farm')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deletingPlot && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="bg-[#fff0f0] px-6 py-4 border-b border-[#ffdad6] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
              <h3 className="font-bold text-[#ba1a1a]">{t('my_farm.delete_farm') || 'Delete Farm'}</h3>
            </div>
            <div className="p-6">
              <p className="text-[#40493d] mb-6">{t('my_farm.delete_confirm_msg') || 'Are you sure you want to delete this farm? This action cannot be undone.'}</p>
              <div className="flex gap-3">
                <button onClick={() => setDeletingPlot(null)} className="flex-1 h-10 border border-[#bfcaba] text-[#40493d] font-bold rounded-lg hover:bg-[#f3f3f3] transition-colors">
                  {t('my_farm.cancel') || 'Cancel'}
                </button>
                <button onClick={() => confirmDelete(deletingPlot)} className="flex-1 h-10 bg-[#ba1a1a] text-white font-bold rounded-lg hover:bg-[#93000a] transition-colors shadow-sm">
                  {t('my_farm.delete') || 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
