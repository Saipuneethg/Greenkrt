import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useData } from '../context/DataContext'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'te', label: 'తె' },
]

const adminNav = [
  { path: '/admin', icon: 'dashboard', tKey: 'admin_nav.dashboard', end: true },
  { path: '/admin/farmers', icon: 'agriculture', tKey: 'admin_nav.farmers' },
  { path: '/admin/products', icon: 'inventory_2', tKey: 'admin_nav.products' },
  { path: '/admin/soil-crop', icon: 'eco', tKey: 'admin_nav.soil_crop' },
  { path: '/admin/orders', icon: 'shopping_cart', tKey: 'admin_nav.orders' },
  { path: '/admin/services', icon: 'build', tKey: 'admin_nav.services' },
  { path: '/admin/delivery', icon: 'local_shipping', tKey: 'admin_nav.delivery' },
  { path: '/admin/inventory', icon: 'warehouse', tKey: 'admin_nav.inventory' },
  { path: '/admin/reports', icon: 'assessment', tKey: 'admin_nav.reports' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { fetchProducts, fetchServices } = useData()

  useEffect(() => {
    fetchProducts()
    fetchServices()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-[#f3fcef] text-[#161d16]">
      {/* Sidebar */}
      <nav className="bg-[#2f3131] flex flex-col h-screen fixed left-0 top-0 w-[260px] py-6 z-20">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <img src="/logo.jpeg" alt="GreenKrt Logo" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-bold text-2xl text-white">GreenKrt</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#006e2f] flex items-center justify-center text-white font-bold">{user?.firstName?.[0] || 'A'}</div>
            <div>
              <div className="font-semibold text-sm text-white">{user?.firstName} {user?.lastName}</div>
              <div className="text-xs text-[#9ca3af] capitalize">{user?.role || 'Administrator'}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {adminNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-2 px-4 py-2 rounded-full transition-colors duration-200 ${
                  isActive
                    ? 'bg-[#006e2f] text-white'
                    : 'text-[#9ca3af] hover:text-white hover:bg-white/10'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-sm font-semibold">{t(item.tKey)}</span>
            </NavLink>
          ))}
        </div>

        <div className="mt-4 px-2">
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-full transition-colors ${isActive ? 'bg-[#006e2f] text-white' : 'text-[#9ca3af] hover:text-white hover:bg-white/10'}`
            }
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="text-sm font-semibold">{t('admin_nav.settings')}</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 mx-0 rounded-full text-[#9ca3af] hover:text-white hover:bg-white/10 transition-colors w-full mt-1"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-sm font-semibold">{t('admin_nav.logout')}</span>
          </button>
        </div>
      </nav>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col ml-[260px] min-h-screen">
        <header className="bg-[#f3fcef] flex justify-between items-center h-16 w-full px-6 border-b border-[#bccbb9] z-10 sticky top-0">
          <div className="font-semibold text-lg text-[#006e2f]">{t('admin_nav.title')}</div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#e2e2e2] rounded-full p-1 h-[32px] items-center mr-4">
              {LANGUAGES.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold transition-colors uppercase ${
                    language === code ? 'bg-[#006e2f] text-white' : 'text-[#40493d] hover:text-[#0d631b]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="p-2 rounded-full hover:bg-[#e8f0e4] transition-colors relative">
              <span className="material-symbols-outlined text-[#3d4a3d]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
