import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useData } from '../context/DataContext'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'te', label: 'తె' },
]

const navItems = [
  { path: '/dashboard', icon: 'home', tKey: 'nav.home', end: true },
  { path: '/dashboard/home', icon: 'bar_chart', tKey: 'nav.my_farm' },
  { path: '/dashboard/services', icon: 'agriculture', tKey: 'nav.services' },
  { path: '/dashboard/marketplace', icon: 'storefront', tKey: 'nav.shop' },
  { path: '/dashboard/orders', icon: 'shopping_cart', tKey: 'nav.orders' },
  { path: '/dashboard/tracking', icon: 'local_shipping', tKey: 'nav.tracking' },
  { path: '/dashboard/profile', icon: 'person', tKey: 'nav.profile' },
]

export default function FarmerLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { fetchProducts, fetchServices } = useData()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchServices()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      {/* Sidebar */}
      <nav className={`hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#0a1a0a] shadow-xl z-50`}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <img src="/logo.jpeg" alt="GreenKrt Logo" className="w-8 h-8 rounded-full object-cover" />
            <span className="text-white font-bold text-xl">GreenKrt</span>
          </div>
          {/* User Snippet */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-12 h-12 rounded-full border-2 border-[#88d982] bg-[#2e7d32] flex items-center justify-center text-white font-bold text-lg">{user?.firstName?.[0] || 'U'}</div>
            <div>
              <div className="text-white font-semibold text-sm">{user?.firstName} {user?.lastName}</div>
              <div className="text-[#88d982] text-xs capitalize">{user?.role}</div>
            </div>
          </div>
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 mx-2 rounded-full transition-colors duration-200 ${
                      isActive
                        ? 'bg-[#2e7d32] text-white'
                        : 'text-[#9ca3af] hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="text-sm font-semibold">{t(item.tKey)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto p-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 mx-2 rounded-full text-[#9ca3af] hover:text-white hover:bg-white/10 transition-colors w-full"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-sm font-semibold">{t('nav.logout')}</span>
          </button>
        </div>
      </nav>

      {/* Top Bar (Mobile) */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white shadow-sm fixed top-0 w-full z-40">
        <div className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="GreenKrt Logo" className="w-6 h-6 rounded-full object-cover" />
          <span className="text-[#0d631b] font-bold text-lg">GreenKrt</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-10 h-10 rounded-full bg-[#2e7d32] flex items-center justify-center text-white font-bold">{user?.firstName?.[0] || 'U'}</div>
        </div>
      </div>

      {/* Main Content */}
      <main className="md:ml-64 w-full pt-20 md:pt-0 min-h-screen">
        {/* Desktop Topbar */}
        <header className="hidden md:flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b border-[#bfcaba] sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#40493d] text-[20px]">search</span>
              <input
                className="pl-10 pr-4 py-2 bg-[#f3f3f3] border border-[#bfcaba] rounded-full text-sm focus:outline-none focus:border-[#0d631b] w-64 h-[48px]"
                placeholder="Search orders, services..."
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#e2e2e2] rounded-full p-1 h-[40px] items-center">
              {LANGUAGES.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    language === code ? 'bg-[#0d631b] text-white' : 'text-[#40493d] hover:text-[#0d631b]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

          </div>
        </header>

        <div className="p-4 md:p-6 pb-24 md:pb-6 page-enter">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-[#bfcaba] flex justify-around items-center h-[72px] z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {[
          { path: '/dashboard', icon: 'home', tKey: 'nav.home' },
          { path: '/dashboard/home', icon: 'bar_chart', tKey: 'nav.my_farm' },
          { path: '/dashboard/services', icon: 'agriculture', tKey: 'nav.services' },
          { path: '/dashboard/marketplace', icon: 'storefront', tKey: 'nav.shop' },
          { path: '/dashboard/profile', icon: 'person', tKey: 'nav.profile' },
        ].map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive ? 'text-[#0d631b]' : 'text-[#40493d]'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`px-4 py-1 rounded-full mb-1 ${isActive ? 'bg-[#9cf49c]' : ''}`}>
                  <span className={`material-symbols-outlined ${isActive ? 'icon-fill' : ''}`}>{item.icon}</span>
                </div>
                <span className="text-[11px] font-semibold">{t(item.tKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
