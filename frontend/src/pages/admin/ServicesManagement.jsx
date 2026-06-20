import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'

export default function ServicesManagement() {
  const { t } = useLanguage()
  const { services, addService, updateService, deleteService } = useData()

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [newService, setNewService] = useState({ name: '', basePrice: '', status: 'Active' })

  const handleDelete = async (id) => {
    await deleteService(id)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    await addService({ 
      ...newService, 
      activeBookings: 0,
      title: newService.name,
      desc: 'New service added by admin',
      price: newService.basePrice,
      icon: 'star',
      color: '#0d631b',
      link: '/dashboard/services'
    })
    setShowAddModal(false)
    setNewService({ name: '', basePrice: '', status: 'Active' })
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    await updateService(editingService.id, editingService)
    setEditingService(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#161d16]">{t('admin_services.title')}</h1>
        <button onClick={() => setShowAddModal(true)} className="h-[40px] px-4 bg-[#006e2f] text-white rounded font-semibold text-sm flex items-center gap-2 hover:bg-[#005a26] transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span> {t('admin_services.actions')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map(s => (
          <div key={s.id} className="bg-white border border-[#bccbb9] rounded-lg p-5">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-[#161d16]">{s.name}</h3>
              <span className="px-2 py-1 bg-[#cfe6c9] text-[#19722b] text-xs font-bold rounded">{s.status}</span>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#3d4a3d]">Base Price</span>
                <span className="font-semibold text-[#161d16]">{s.basePrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#3d4a3d]">Active Bookings</span>
                <span className="font-semibold text-[#161d16]">{s.activeBookings}</span>
              </div>
            </div>
            <div className="flex gap-2 mb-2">
              <button onClick={() => setEditingService(s)} className="flex-1 h-[36px] border border-[#006e2f] text-[#006e2f] rounded font-semibold text-sm hover:bg-[#006e2f]/5">Edit</button>
              <button onClick={() => handleDelete(s.id)} className="flex-1 h-[36px] border border-red-600 text-red-600 rounded font-semibold text-sm hover:bg-red-50">Delete</button>
            </div>
            <button className="w-full h-[36px] bg-[#f3fcef] text-[#161d16] rounded font-semibold text-sm hover:bg-[#e8f0e4]">View Bookings</button>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1a1c1c]">Add New Service</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#40493d] hover:text-[#1a1c1c]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Service Name</label>
                <input required value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} type="text" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Base Price</label>
                <input required value={newService.basePrice} onChange={e => setNewService({...newService, basePrice: e.target.value})} type="text" placeholder="e.g. ₹500/acre" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Status</label>
                <select value={newService.status} onChange={e => setNewService({...newService, status: e.target.value})} className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b] bg-white">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <button type="submit" className="w-full h-12 bg-[#006e2f] hover:bg-[#005a26] text-white font-bold text-sm uppercase tracking-wider rounded transition-colors mt-2">
                Add Service
              </button>
            </form>
          </div>
        </div>
      )}

      {editingService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1a1c1c]">Edit Service</h2>
              <button onClick={() => setEditingService(null)} className="text-[#40493d] hover:text-[#1a1c1c]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Service Name</label>
                <input required value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} type="text" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Base Price</label>
                <input required value={editingService.basePrice} onChange={e => setEditingService({...editingService, basePrice: e.target.value})} type="text" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Status</label>
                <select value={editingService.status} onChange={e => setEditingService({...editingService, status: e.target.value})} className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b] bg-white">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <button type="submit" className="w-full h-12 bg-[#006e2f] hover:bg-[#005a26] text-white font-bold text-sm uppercase tracking-wider rounded transition-colors mt-2">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
