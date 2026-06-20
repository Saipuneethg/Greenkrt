import { useState, useEffect } from 'react'

export default function DeliveryPartnerManagement() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Add/Edit modal inputs
  const [showAddModal, setShowAddModal] = useState(false)
  const [editId, setEditId] = useState(null)
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchPartners = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/delivery-partners', {
        headers: {
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
      })
      if (res.ok) {
        const data = await res.json()
        setPartners(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  const openAddModal = () => {
    setEditId(null)
    setFirstName('')
    setLastName('')
    setPhone('')
    setEmail('')
    setPassword('')
    setShowAddModal(true)
  }

  const openEditModal = (p) => {
    setEditId(p._id)
    setFirstName(p.firstName)
    setLastName(p.lastName)
    setPhone(p.phone)
    setEmail(p.email)
    setPassword('') // Do not edit password here
    setShowAddModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const url = editId 
        ? `http://localhost:5000/api/admin/delivery-partners/${editId}`
        : 'http://localhost:5000/api/admin/delivery-partners'
      const method = editId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email,
          ...(editId ? {} : { password }),
        }),
      })

      if (res.ok) {
        alert(editId ? 'Delivery partner updated successfully!' : 'Delivery partner registered successfully!')
        setShowAddModal(false)
        fetchPartners()
      } else {
        const err = await res.json()
        alert(err.message || 'Failed to save delivery partner.')
      }
    } catch {
      alert('Error connecting to server.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (partnerId) => {
    if (!confirm('Are you sure you want to delete this delivery partner?')) return
    try {
      const res = await fetch(`http://localhost:5000/api/admin/delivery-partners/${partnerId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
      })
      if (res.ok) {
        alert('Delivery partner deleted.')
        fetchPartners()
      } else {
        alert('Failed to delete partner.')
      }
    } catch {
      alert('Error connecting to server.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#161d16]">Delivery Partners</h1>
        <button 
          onClick={openAddModal} 
          className="h-[40px] px-4 bg-[#006e2f] text-white rounded font-semibold text-sm flex items-center gap-2 hover:bg-[#005a26] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span> Register Partner
        </button>
      </div>

      <div className="bg-white border border-[#bccbb9] rounded-lg overflow-hidden">
        {loading ? (
          <p className="p-4 text-sm text-[#3d4a3d]">Loading partners...</p>
        ) : partners.length === 0 ? (
          <p className="p-4 text-sm text-[#3d4a3d]">No delivery partners registered yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#bccbb9] bg-[#edf6ea] text-[#3d4a3d] font-bold">
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Email</th>
                <th className="p-4">Service State/District</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map(p => (
                <tr key={p._id} className="border-b border-[#bccbb9]/30 hover:bg-[#f3fcef]">
                  <td className="p-4 font-semibold text-[#161d16]">{p.firstName} {p.lastName}</td>
                  <td className="p-4">{p.phone}</td>
                  <td className="p-4">{p.email}</td>
                  <td className="p-4">{p.district || 'All Districts'}</td>
                  <td className="p-4 flex gap-4">
                    <button 
                      onClick={() => openEditModal(p)} 
                      className="text-[#006e2f] font-semibold text-xs hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(p._id)} 
                      className="text-red-600 font-semibold text-xs hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1a1c1c]">{editId ? 'Edit Delivery Partner' : 'Register Delivery Partner'}</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#40493d] hover:text-[#1a1c1c]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">First Name</label>
                  <input required value={firstName} onChange={e => setFirstName(e.target.value)} type="text" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Last Name</label>
                  <input required value={lastName} onChange={e => setLastName(e.target.value)} type="text" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Phone Number</label>
                <input required value={phone} onChange={e => setPhone(e.target.value)} type="text" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Email</label>
                <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              
              {!editId && (
                <div>
                  <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Password</label>
                  <input required value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
                </div>
              )}

              <button disabled={submitting} type="submit" className="w-full h-12 bg-[#006e2f] hover:bg-[#005a26] text-white font-bold text-sm uppercase tracking-wider rounded transition-colors mt-2">
                {submitting ? 'Saving...' : (editId ? 'Save Changes' : 'Register')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
