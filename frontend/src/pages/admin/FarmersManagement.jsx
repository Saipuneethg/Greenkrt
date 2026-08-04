import { useEffect, useState } from 'react'
import API_BASE from '../../config/api'
import { useLanguage } from '../../context/LanguageContext'

export default function FarmersManagement() {
  const { t } = useLanguage()
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchFarmers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/farmers`, {
        headers: {
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
      })
      if (res.ok) {
        const data = await res.json()
        setFarmers(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFarmers()
  }, [])

  const filteredFarmers = farmers.filter(f => {
    const fullName = `${f.firstName} ${f.lastName}`.toLowerCase()
    return fullName.includes(search.toLowerCase()) || f.phone.includes(search)
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#161d16]">{t('admin_farmers.title')}</h1>
      </div>

      <div className="bg-white border border-[#bccbb9] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#bccbb9] flex gap-4 bg-[#f3fcef]">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4a3d] text-[20px]">search</span>
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('admin_farmers.search')} 
              className="w-full pl-10 pr-4 py-2 border border-[#bccbb9] rounded bg-white text-sm focus:outline-none focus:border-[#006e2f]" 
            />
          </div>
        </div>
        
        {loading ? (
          <p className="p-4 text-sm text-[#3d4a3d]">Loading farmers...</p>
        ) : filteredFarmers.length === 0 ? (
          <p className="p-4 text-sm text-[#3d4a3d]">No farmers found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#bccbb9] bg-[#edf6ea] text-[#3d4a3d] font-bold">
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Email</th>
                <th className="p-4">{t('admin_farmers.location')}</th>
                <th className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredFarmers.map(f => (
                <tr key={f._id} className="border-b border-[#bccbb9]/30 hover:bg-[#f3fcef]">
                  <td className="p-4 font-semibold text-[#161d16]">{f.firstName} {f.lastName}</td>
                  <td className="p-4">{f.phone}</td>
                  <td className="p-4">{f.email}</td>
                  <td className="p-4">{f.district || 'N/A'}</td>
                  <td className="p-4">{new Date(f.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
