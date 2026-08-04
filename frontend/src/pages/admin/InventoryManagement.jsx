import { useState, useEffect } from 'react'
import API_BASE from '../../config/api'
import { createPortal } from 'react-dom'
import { useData } from '../../context/DataContext'

export default function InventoryManagement() {
  const { products } = useData()
  const [warehouses, setWarehouses] = useState([])
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingTransfers, setLoadingTransfers] = useState(true)
  
  // Add / Edit Warehouse Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingWH, setEditingWH] = useState(null)
  
  // Warehouse Form values
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState(50)
  const [status, setStatus] = useState('Operational')

  // Transfer Modal States
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [sourceWarehouseId, setSourceWarehouseId] = useState('')
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('')
  const [transferProductId, setTransferProductId] = useState('')
  const [transferQty, setTransferQty] = useState(1)

  // Notification and Confirmation States
  const [modalConfig, setModalConfig] = useState({ show: false, message: '', isError: false })
  const [confirmConfig, setConfirmConfig] = useState({ show: false, message: '', onConfirm: null })

  const showNotification = (message, isError = false) => {
    setModalConfig({ show: true, message, isError })
    setTimeout(() => setModalConfig({ show: false, message: '', isError: false }), 3000)
  }

  const fetchWarehouses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/warehouses`, {
        headers: {
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
      })
      if (res.ok) {
        const data = await res.json()
        setWarehouses(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransfers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/transfers`, {
        headers: {
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
      })
      if (res.ok) {
        const data = await res.json()
        setTransfers(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingTransfers(false)
    }
  }

  useEffect(() => {
    fetchWarehouses()
    fetchTransfers()
  }, [])

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!name || capacity === '') return

    try {
      const res = await fetch(`${API_BASE}/api/warehouses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('greenkrt_token')
        },
        body: JSON.stringify({
          name,
          capacity: Number(capacity),
          status
        })
      })

      if (res.ok) {
        showNotification('Warehouse added successfully!')
        setShowAddModal(false)
        setName('')
        setCapacity(50)
        setStatus('Operational')
        fetchWarehouses()
      } else {
        const errData = await res.json()
        showNotification(errData.message || 'Failed to add warehouse.', true)
      }
    } catch {
      showNotification('Error connecting to server.', true)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingWH) return

    try {
      const res = await fetch(`${API_BASE}/api/warehouses/${editingWH.warehouseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('greenkrt_token')
        },
        body: JSON.stringify({
          name,
          capacity: Number(capacity),
          status
        })
      })

      if (res.ok) {
        showNotification('Warehouse updated successfully!')
        setEditingWH(null)
        setName('')
        setCapacity(50)
        setStatus('Operational')
        fetchWarehouses()
      } else {
        const errData = await res.json()
        showNotification(errData.message || 'Failed to update warehouse.', true)
      }
    } catch {
      showNotification('Error connecting to server.', true)
    }
  }

  const handleTransferSubmit = async (e) => {
    e.preventDefault()
    if (!sourceWarehouseId || !destinationWarehouseId || !transferProductId || !transferQty) {
      showNotification('All fields are required.', true)
      return
    }

    if (sourceWarehouseId === destinationWarehouseId) {
      showNotification('Source and destination warehouses cannot be the same.', true)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/transfers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('greenkrt_token')
        },
        body: JSON.stringify({
          sourceWarehouseId,
          destinationWarehouseId,
          productId: transferProductId,
          quantity: Number(transferQty)
        })
      })

      if (res.ok) {
        showNotification('Transfer request created successfully!')
        setShowTransferModal(false)
        setSourceWarehouseId('')
        setDestinationWarehouseId('')
        setTransferProductId('')
        setTransferQty(1)
        fetchTransfers()
      } else {
        const errData = await res.json()
        showNotification(errData.message || 'Failed to create transfer request.', true)
      }
    } catch {
      showNotification('Error connecting to server.', true)
    }
  }

  const handleApproveTransfer = async (transferId) => {
    setConfirmConfig({
      show: true,
      message: `Are you sure you want to approve stock transfer request ${transferId}?`,
      onConfirm: async () => {
        setConfirmConfig({ show: false, message: '', onConfirm: null })
        try {
          const res = await fetch(`${API_BASE}/api/transfers/${transferId}/approve`, {
            method: 'PUT',
            headers: {
              'x-auth-token': sessionStorage.getItem('greenkrt_token')
            }
          })
          if (res.ok) {
            showNotification('Transfer request approved successfully.')
            fetchTransfers()
          } else {
            const err = await res.json()
            showNotification(err.message || 'Failed to approve request.', true)
          }
        } catch {
          showNotification('Error connecting to server.', true)
        }
      }
    })
  }

  const handleRejectTransfer = async (transferId) => {
    setConfirmConfig({
      show: true,
      message: `Are you sure you want to reject stock transfer request ${transferId}?`,
      onConfirm: async () => {
        setConfirmConfig({ show: false, message: '', onConfirm: null })
        try {
          const res = await fetch(`${API_BASE}/api/transfers/${transferId}/reject`, {
            method: 'PUT',
            headers: {
              'x-auth-token': sessionStorage.getItem('greenkrt_token')
            }
          })
          if (res.ok) {
            showNotification('Transfer request rejected successfully.')
            fetchTransfers()
          } else {
            const err = await res.json()
            showNotification(err.message || 'Failed to reject request.', true)
          }
        } catch {
          showNotification('Error connecting to server.', true)
        }
      }
    })
  }

  const openEditModal = (wh) => {
    setEditingWH(wh)
    setName(wh.name)
    setCapacity(wh.capacity)
    setStatus(wh.status)
  }

  const handleDelete = (wh) => {
    setConfirmConfig({
      show: true,
      message: `Are you sure you want to delete warehouse ${wh.name} (${wh.warehouseId})?`,
      onConfirm: async () => {
        setConfirmConfig({ show: false, message: '', onConfirm: null })
        try {
          const res = await fetch(`${API_BASE}/api/warehouses/${wh.warehouseId}`, {
            method: 'DELETE',
            headers: {
              'x-auth-token': sessionStorage.getItem('greenkrt_token')
            }
          })

          if (res.ok) {
            showNotification('Warehouse deleted successfully.')
            fetchWarehouses()
          } else {
            showNotification('Failed to delete warehouse.', true)
          }
        } catch {
          showNotification('Error connecting to server.', true)
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#161d16]">Inventory & Warehouses</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setSourceWarehouseId('')
              setDestinationWarehouseId('')
              setTransferProductId('')
              setTransferQty(1)
              setShowTransferModal(true)
            }} 
            className="h-[40px] px-4 bg-[#f3fcef] border border-[#0d631b] text-[#0d631b] hover:bg-[#eaf4e7] rounded font-semibold text-sm flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span> Request Stock Transfer
          </button>
          <button 
            onClick={() => {
              setName('')
              setCapacity(50)
              setStatus('Operational')
              setShowAddModal(true)
            }} 
            className="h-[40px] px-4 bg-[#006e2f] text-white rounded font-semibold text-sm flex items-center gap-2 hover:bg-[#005a26] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> Add Warehouse
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[#3d4a3d]">Loading warehouses...</p>
      ) : warehouses.length === 0 ? (
        <div className="p-8 text-center text-[#3d4a3d] bg-white border border-[#bccbb9] rounded-lg">
          <span className="material-symbols-outlined text-4xl mb-2 text-[#bccbb9]">warehouse</span>
          <p>No warehouses registered. Add a warehouse to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {warehouses.map(w => (
            <div key={w._id} className="bg-white border border-[#bccbb9] rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-[#161d16]">{w.name}</h3>
                    <span className="text-xs text-[#3d4a3d]">{w.warehouseId}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${w.status === 'Warning' ? 'bg-[#ffdad6] text-[#93000a]' : w.status === 'Maintenance' ? 'bg-[#ffeedb] text-[#8c4a00]' : 'bg-[#cfe6c9] text-[#19722b]'}`}>{w.status}</span>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#3d4a3d]">Capacity Utilization</span>
                    <span className="font-bold text-[#161d16]">{w.capacity}%</span>
                  </div>
                  <div className="w-full bg-[#dce5d9] rounded-full h-2">
                    <div className={`h-2 rounded-full ${w.status === 'Warning' ? 'bg-[#ba1a1a]' : 'bg-[#006e2f]'}`} style={{ width: `${w.capacity}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openEditModal(w)}
                  className="flex-1 h-[36px] bg-[#f3fcef] border border-[#bccbb9] text-[#161d16] rounded font-semibold text-sm hover:bg-[#e8f0e4] transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(w)}
                  className="w-10 h-[36px] border border-red-200 text-red-600 rounded flex items-center justify-center hover:bg-red-50 transition-colors shrink-0"
                  title="Remove Warehouse"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Stock Transfer Requests Section */}
      <div className="bg-white border border-[#bccbb9] rounded-lg p-5">
        <h2 className="font-bold text-[#161d16] mb-4">Stock Transfer Requests</h2>
        {loadingTransfers ? (
          <p className="text-sm text-[#3d4a3d]">Loading transfer requests...</p>
        ) : transfers.length === 0 ? (
          <div className="p-8 text-center text-[#3d4a3d] bg-[#f3fcef] rounded-lg border border-dashed border-[#bccbb9]">
            <span className="material-symbols-outlined text-4xl mb-2 text-[#bccbb9]">swap_horiz</span>
            <p>No active transfer requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#bccbb9] bg-[#edf6ea] text-[#3d4a3d] font-bold">
                  <th className="p-4">Request ID</th>
                  <th className="p-4">Source Warehouse</th>
                  <th className="p-4">Destination Warehouse</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Requested By</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map(t => (
                  <tr key={t._id} className="border-b border-[#bccbb9]/30 hover:bg-[#f3fcef]">
                    <td className="p-4 font-bold text-[#161d16]">{t.transferId}</td>
                    <td className="p-4">{t.sourceWarehouse?.name || 'N/A'}</td>
                    <td className="p-4">{t.destinationWarehouse?.name || 'N/A'}</td>
                    <td className="p-4 font-semibold text-[#006e2f]">{t.product?.name || 'N/A'}</td>
                    <td className="p-4 font-bold">{t.quantity}</td>
                    <td className="p-4 text-[#3d4a3d]">{t.requestedBy ? `${t.requestedBy.firstName} ${t.requestedBy.lastName}` : 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.status === 'Approved' ? 'bg-green-100 text-green-800' : t.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {t.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleApproveTransfer(t.transferId)}
                            className="bg-[#006e2f] hover:bg-[#005a26] text-white font-bold text-xs px-2.5 py-1 rounded transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectTransfer(t.transferId)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-2.5 py-1 rounded transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#707a6c]">
                          Reviewed by {t.approvedBy ? `${t.approvedBy.firstName} ${t.approvedBy.lastName[0]}.` : 'System'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Warehouse Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1a1c1c]">Add New Warehouse</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#40493d] hover:text-[#1a1c1c]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Warehouse Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Nellore Hub" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Capacity Utilization (%)</label>
                <input required type="number" min="0" max="100" value={capacity} onChange={e => setCapacity(e.target.value)} className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b] bg-white text-[#1a1c1c]">
                  <option value="Operational">Operational</option>
                  <option value="Warning">Warning</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <button type="submit" className="w-full h-12 bg-[#006e2f] hover:bg-[#005a26] text-white font-bold text-sm uppercase tracking-wider rounded transition-colors mt-2">
                Add Warehouse
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Warehouse Modal */}
      {editingWH && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1a1c1c]">Edit Warehouse ({editingWH.warehouseId})</h2>
              <button onClick={() => setEditingWH(null)} className="text-[#40493d] hover:text-[#1a1c1c]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Warehouse Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Capacity Utilization (%)</label>
                <input required type="number" min="0" max="100" value={capacity} onChange={e => setCapacity(e.target.value)} className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b] bg-white text-[#1a1c1c]">
                  <option value="Operational">Operational</option>
                  <option value="Warning">Warning</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <button type="submit" className="w-full h-12 bg-[#006e2f] hover:bg-[#005a26] text-white font-bold text-sm uppercase tracking-wider rounded transition-colors mt-2">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Request Stock Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1a1c1c]">Request Stock Transfer</h2>
              <button onClick={() => setShowTransferModal(false)} className="text-[#40493d] hover:text-[#1a1c1c]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Source Warehouse</label>
                <select required value={sourceWarehouseId} onChange={e => setSourceWarehouseId(e.target.value)} className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b] bg-white text-[#1a1c1c]">
                  <option value="">Select source warehouse...</option>
                  {warehouses.map(w => (
                    <option key={w._id} value={w._id}>{w.name} ({w.warehouseId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Destination Warehouse</label>
                <select required value={destinationWarehouseId} onChange={e => setDestinationWarehouseId(e.target.value)} className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b] bg-white text-[#1a1c1c]">
                  <option value="">Select destination warehouse...</option>
                  {warehouses.map(w => (
                    <option key={w._id} value={w._id}>{w.name} ({w.warehouseId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Product</label>
                <select required value={transferProductId} onChange={e => setTransferProductId(e.target.value)} className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b] bg-white text-[#1a1c1c]">
                  <option value="">Select product to transfer...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.brand})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Quantity</label>
                <input required type="number" min="1" value={transferQty} onChange={e => setTransferQty(e.target.value)} className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <button type="submit" className="w-full h-12 bg-[#006e2f] hover:bg-[#005a26] text-white font-bold text-sm uppercase tracking-wider rounded transition-colors mt-2">
                Submit Transfer Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom Alert Modal Notification (Portal) */}
      {modalConfig.show && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform scale-100 transition-transform">
            <div className={`px-6 py-4 border-b flex items-center gap-3 ${modalConfig.isError ? 'bg-[#fff0f0] border-[#ffdad6]' : 'bg-[#f0f6ec] border-[#bfcaba]'}`}>
              <span className={`material-symbols-outlined text-[24px] ${modalConfig.isError ? 'text-[#ba1a1a]' : 'text-[#0d631b]'}`}>
                {modalConfig.isError ? 'error' : 'check_circle'}
              </span>
              <h3 className={`font-bold text-lg ${modalConfig.isError ? 'text-[#93000a]' : 'text-[#0d631b]'}`}>
                {modalConfig.isError ? 'Error' : 'Success'}
              </h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-[#1a1c1c] text-base font-medium">{modalConfig.message}</p>
            </div>
            <div className="px-6 pb-6 pt-2 flex justify-center">
              <button 
                onClick={() => setModalConfig({ show: false, message: '', isError: false })} 
                className={`px-8 py-2 font-bold rounded-lg transition-colors ${
                  modalConfig.isError 
                    ? 'bg-[#ba1a1a] text-white hover:bg-[#93000a]' 
                    : 'bg-[#0d631b] text-white hover:bg-[#0a4a14]'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Confirm Dialog (Portal) */}
      {confirmConfig.show && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform scale-100 transition-transform">
            <div className="px-6 py-4 border-b bg-[#fff0f0] border-[#ffdad6] flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-[#ba1a1a]">help</span>
              <h3 className="font-bold text-lg text-[#93000a]">Confirm Action</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-[#1a1c1c] text-base font-medium">{confirmConfig.message}</p>
            </div>
            <div className="px-6 pb-6 pt-2 flex justify-end gap-3">
              <button 
                onClick={() => setConfirmConfig({ show: false, message: '', onConfirm: null })} 
                className="px-4 py-2 font-bold rounded-lg bg-[#f3f3f3] text-[#40493d] hover:bg-[#e2e2e2] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmConfig.onConfirm} 
                className="px-4 py-2 font-bold rounded-lg bg-[#ba1a1a] text-white hover:bg-[#93000a] transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
