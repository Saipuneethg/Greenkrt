import { useState } from 'react'
import API_BASE from '../../config/api'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'

export default function ServicesManagement() {
  const { t } = useLanguage()
  const { services, addService, updateService, deleteService } = useData()

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [newService, setNewService] = useState({ name: '', numericPrice: '', priceUnit: '/acre', status: 'Active' })
  const [viewingService, setViewingService] = useState(null)
  const [serviceBookings, setServiceBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [deletingService, setDeletingService] = useState(null)
  const [partners, setPartners] = useState([])

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/partners`, {
          headers: { 'x-auth-token': sessionStorage.getItem('greenkrt_token') }
        })
        if (res.ok) {
          const data = await res.json()
          setPartners(data)
        }
      } catch (err) {
        console.error('Failed to fetch partners', err)
      }
    }
    fetchPartners()
  }, [])

  const confirmDelete = async () => {
    if (deletingService) {
      await deleteService(deletingService.id)
      setDeletingService(null)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const finalPrice = `₹${newService.numericPrice}${newService.priceUnit}`
    await addService({ 
      ...newService,
      basePrice: finalPrice,
      activeBookings: 0,
      title: newService.name,
      desc: 'New service added by admin',
      price: finalPrice,
      icon: 'star',
      color: '#0d631b',
      link: '/dashboard/services'
    })
    setShowAddModal(false)
    setNewService({ name: '', numericPrice: '', priceUnit: '/acre', status: 'Active' })
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    const finalPrice = `₹${editingService.numericPrice}${editingService.priceUnit}`
    await updateService(editingService.id, {
      ...editingService,
      basePrice: finalPrice,
      price: finalPrice
    })
    setEditingService(null)
  }

  const openEditModal = (s) => {
    const match = String(s.basePrice || s.price || '').match(/₹?(\d+)(.*)/);
    const num = match ? match[1] : (s.basePrice || s.price);
    const unit = match ? match[2] : '';
    setEditingService({ ...s, numericPrice: num, priceUnit: unit });
  }

  const handleViewBookings = async (service) => {
    setViewingService(service);
    setLoadingBookings(true);
    try {
      const res = await fetch(`${API_BASE}/api/services/bookings`, {
        headers: {
          'x-auth-token': sessionStorage.getItem('greenkrt_token')
        }
      });
      if (res.ok) {
        const allBookings = await res.json();
        // Determine service type string from name
        const sNameLower = service.name.toLowerCase();
        let sType = 'unknown';
        if (sNameLower.includes('drone')) sType = 'drone';
        if (sNameLower.includes('land')) sType = 'land';
        if (sNameLower.includes('soil')) sType = 'soil';
        
        // Filter bookings by type
        const filtered = allBookings.filter(b => b.serviceType === sType);
        setServiceBookings(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookings(false);
    }
  }

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/services/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('greenkrt_token')
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setServiceBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: newStatus } : b))
      }
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  const handleAssignPartner = async (bookingId, partnerId) => {
    try {
      const res = await fetch(`${API_BASE}/api/services/bookings/${bookingId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('greenkrt_token')
        },
        body: JSON.stringify({ partnerId })
      })
      if (res.ok) {
        const updatedBooking = await res.json()
        setServiceBookings(prev => prev.map(b => b.bookingId === bookingId ? updatedBooking : b))
      }
    } catch (err) {
      console.error('Failed to assign partner', err)
    }
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
              <button onClick={() => openEditModal(s)} className="flex-1 h-[36px] border border-[#006e2f] text-[#006e2f] rounded font-semibold text-sm hover:bg-[#006e2f]/5">Edit</button>
              <button onClick={() => setDeletingService(s)} className="flex-1 h-[36px] border border-red-600 text-red-600 rounded font-semibold text-sm hover:bg-red-50">Delete</button>
            </div>
            <button onClick={() => handleViewBookings(s)} className="w-full h-[36px] bg-[#f3fcef] text-[#161d16] rounded font-semibold text-sm hover:bg-[#e8f0e4]">View Bookings</button>
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
                <div className="flex">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707a6c] font-semibold">₹</span>
                    <input required value={newService.numericPrice} onChange={e => setNewService({...newService, numericPrice: e.target.value})} type="number" placeholder="500" className="w-full h-10 pl-8 pr-3 border border-[#bfcaba] rounded-l focus:outline-none focus:border-[#0d631b]" />
                  </div>
                  <select value={newService.priceUnit} onChange={e => setNewService({...newService, priceUnit: e.target.value})} className="w-32 h-10 px-3 border border-l-0 border-[#bfcaba] rounded-r focus:outline-none focus:border-[#0d631b] bg-white text-[#40493d]">
                    <option value="/acre">/acre</option>
                    <option value="/sample">/sample</option>
                    <option value="/month">/month</option>
                    <option value="">(None)</option>
                  </select>
                </div>
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
                <div className="flex">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707a6c] font-semibold">₹</span>
                    <input required value={editingService.numericPrice} onChange={e => setEditingService({...editingService, numericPrice: e.target.value})} type="number" className="w-full h-10 pl-8 pr-3 border border-[#bfcaba] rounded-l focus:outline-none focus:border-[#0d631b]" />
                  </div>
                  <div className="w-32 h-10 px-3 border border-l-0 border-[#bfcaba] rounded-r bg-[#f3f3f3] text-[#707a6c] flex items-center">
                    {editingService.priceUnit}
                  </div>
                </div>
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

      {deletingService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h2 className="text-lg font-bold text-[#1a1c1c]">Delete Service?</h2>
            </div>
            <p className="text-[#40493d] mb-6">
              Are you sure you want to delete <strong>{deletingService.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingService(null)} className="flex-1 h-10 border border-[#bfcaba] text-[#40493d] font-bold rounded hover:bg-[#f9f9f9] transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {viewingService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#1a1c1c]">{viewingService.name} Bookings</h2>
                <p className="text-sm text-[#40493d]">Total Bookings: {serviceBookings.length}</p>
              </div>
              <button onClick={() => setViewingService(null)} className="text-[#40493d] hover:text-[#1a1c1c] bg-[#f3f3f3] w-8 h-8 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loadingBookings ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-8 h-8 border-4 border-[#006e2f] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : serviceBookings.length === 0 ? (
                <div className="text-center py-12 bg-[#f9f9f9] rounded-lg border border-dashed border-[#bccbb9]">
                  <span className="material-symbols-outlined text-4xl text-[#bfcaba] mb-2">event_busy</span>
                  <h3 className="text-lg font-bold text-[#40493d]">No Bookings Found</h3>
                  <p className="text-sm text-[#707a6c]">There are currently no bookings for this service.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceBookings.map(b => (
                    <div key={b.bookingId} className="bg-white border border-[#bccbb9] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-[#1a1c1c]">{b.user?.firstName} {b.user?.lastName}</h4>
                          <select 
                            value={b.status} 
                            onChange={(e) => updateBookingStatus(b.bookingId, e.target.value)}
                            className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border-none outline-none cursor-pointer ${b.status === 'Completed' ? 'bg-[#cfe6c9] text-[#19722b]' : (b.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-[#fffdf0] text-[#643f00]')}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <select 
                            onChange={(e) => handleAssignPartner(b.bookingId, e.target.value)}
                            value={b.deliveryPartner?._id || ""}
                            className="text-[11px] border border-[#bccbb9] text-[#40493d] rounded px-1 py-1 bg-white cursor-pointer"
                          >
                            <option value="" disabled>Assign Expert...</option>
                            {partners.map(p => (
                              <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>
                            ))}
                          </select>
                        </div>
                        <p className="text-sm text-[#40493d]">
                          <span className="font-semibold text-[#1a1c1c]">Booking ID:</span> {b.bookingId} • 
                          <span className="font-semibold text-[#1a1c1c] ml-2">Phone:</span> {b.user?.phone} •
                          <span className="font-semibold text-[#1a1c1c] ml-2">Village:</span> {b.villageName || b.user?.district || 'N/A'}
                        </p>
                        <div className="text-xs text-[#707a6c] mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {b.details?.date || 'N/A'} at {b.details?.time || 'N/A'}</span>
                          {b.details?.farmLocation && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {b.details.farmLocation}</span>}
                          {b.details?.farmSize && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">landscape</span> {b.details.farmSize} Acres</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm text-[#40493d] mb-1">Cost</div>
                        <div className="text-lg font-bold text-[#006e2f]">₹{b.cost}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
