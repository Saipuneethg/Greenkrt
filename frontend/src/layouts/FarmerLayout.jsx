import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useData } from '../context/DataContext'
import { useCart } from '../context/CartContext'
import { createPortal } from 'react-dom'
import API_BASE from '../config/api'

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
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, isCartOpen, setIsCartOpen, cartCount } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartError, setCartError] = useState('')
  const [cartSuccess, setCartSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleCheckout = async () => {
    setCartError('')
    setCartSuccess('')
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('greenkrt_token'),
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
          })),
          totalAmount: cartTotal,
        }),
      })

      if (res.ok) {
        setCartSuccess(t('marketplace.order_success'))
        clearCart()
        setTimeout(() => {
          setIsCartOpen(false)
          setCartSuccess('')
          navigate('/dashboard/orders')
        }, 1500)
        await fetchProducts() // Refresh stock levels
      } else {
        const errorData = await res.json()
        setCartError(errorData.message || t('marketplace.checkout_failed'))
      }
    } catch {
      setCartError(t('marketplace.server_error'))
    }
  }

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
            {/* Search removed */}
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
            
            <button
              onClick={() => setIsCartOpen(true)}
              className="h-[40px] px-5 rounded-full bg-[#0d631b] text-white flex flex-row items-center justify-center gap-2 font-bold text-sm hover:-translate-y-1 transition-all shadow-[0_4px_12px_rgba(13,99,27,0.3)] whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[20px] leading-none">shopping_cart</span>
              <span className="leading-none">{t('marketplace.cart')}</span>
              {cartCount > 0 && (
                <span className="min-w-[20px] h-[20px] px-1 rounded-full bg-white text-[#0d631b] text-[10px] flex items-center justify-center font-black ml-1 leading-none">
                  {cartCount}
                </span>
              )}
            </button>

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

      {/* Global Cart Side Panel */}
      {isCartOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end items-start">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-[calc(100%-2rem)] md:w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden transition-transform transform translate-x-0 h-fit max-h-[calc(100vh-2rem)] m-4 rounded-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-[#f3fcef] shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2 text-[#006e2f]"><span className="material-symbols-outlined">shopping_cart</span> {t('marketplace.your_cart') || 'Your Cart'}</h2>
              <button onClick={() => setIsCartOpen(false)} className="material-symbols-outlined text-gray-500 hover:text-black">close</button>
            </div>
            
            <div className="overflow-y-auto min-h-0 p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-6xl mb-4">remove_shopping_cart</span>
                  <p>{t('marketplace.empty_cart') || 'Your cart is empty'}</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 border-b pb-4">
                    <div className="w-16 h-16 bg-[#f3f3f3] rounded flex items-center justify-center text-3xl">{item.image}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-[#1a1c1c]">{t('products.' + item.id) !== 'products.' + item.id ? t('products.' + item.id) : item.name}</h4>
                      <div className="text-xs text-[#40493d] mb-2">{item.unit}</div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#0d631b]">₹{item.price * item.quantity}</span>
                        <div className="flex items-center gap-2 bg-[#f3fcef] rounded-full px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white text-[#006e2f] font-bold">-</button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white text-[#006e2f] font-bold">+</button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="material-symbols-outlined text-gray-400 hover:text-red-500 text-lg self-start">delete</button>
                  </div>
                ))
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-4 border-t bg-white shrink-0 space-y-3">
                {cartError && (
                  <div className="p-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                    {cartError}
                  </div>
                )}
                {cartSuccess && (
                  <div className="p-2 bg-[#f3fcef] text-[#0d631b] text-xs rounded border border-[#9cf49c]">
                    {cartSuccess}
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('marketplace.total_bill') || 'Total'}</span>
                  <span className="text-[#0d631b]">₹{cartTotal}</span>
                </div>
                <div className="text-xs text-center text-[#40493d] mt-2 mb-1 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                  Payment: Cash on Delivery (COD) Only
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={clearCart} className="flex-1 h-11 border border-[#ba1a1a] text-[#ba1a1a] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#fff0f0] transition-colors flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    {t('marketplace.clear_cart') || 'Clear Cart'}
                  </button>
                  <button onClick={handleCheckout} className="flex-[2] h-11 bg-[#0d631b] text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm hover:opacity-90 transition-colors flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Place Order (COD)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
