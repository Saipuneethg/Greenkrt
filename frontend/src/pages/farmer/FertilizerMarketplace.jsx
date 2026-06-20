import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'

export default function FertilizerMarketplace() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isCartOpen, setIsCartOpen } = useCart()
  const { t, language } = useLanguage()
  const { products, fetchProducts } = useData()

  const handleCheckout = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
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
        alert('Order placed successfully!')
        clearCart()
        setIsCartOpen(false)
        await fetchProducts() // Refresh stock levels
        navigate('/dashboard/orders')
      } else {
        const errorData = await res.json()
        alert(errorData.message || 'Checkout failed. Please try again.')
      }
    } catch {
      alert('Error connecting to server. Please try again.')
    }
  }
  const [category, setCategory] = useState(language === 'te' ? 'అన్నీ' : 'All')

  // We need to keep the "en" categories list as fallback for the mapping logic if we want to filter by English names in backend,
  // but since we filter by exact match, we just use the localized category list.
  const categories = t('marketplace.categories') || ['All', 'Fertilizers', 'Pesticides', 'Micronutrients', 'Seeds']

  const filtered = products.filter(p =>
    (category === categories[0] || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1c1c] mb-1">{t('marketplace.title')}</h1>
        <p className="text-[#40493d] text-sm">{t('marketplace.subtitle')}</p>
      </div>

      {/* Fixed Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed top-6 right-6 z-40 h-[40px] px-4 rounded-full bg-[#0d631b] text-white flex items-center gap-2 font-semibold text-sm shadow-lg hover:bg-[#0a4f15] transition-all"
        style={{ boxShadow: '0 4px 24px rgba(13,99,27,0.35)' }}
      >
        <span className="material-symbols-outlined text-current">shopping_cart</span>
        {t('marketplace.cart')}
        {cartCount > 0 && (
          <span className="w-6 h-6 rounded-full bg-white text-[#0d631b] text-xs flex items-center justify-center font-bold ml-1">
            {cartCount}
          </span>
        )}
      </button>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#40493d]">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('marketplace.search_placeholder')}
            className="w-full h-[48px] pl-12 pr-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 h-[40px] rounded-full text-sm font-semibold transition-colors ${category === c ? 'bg-[#0d631b] text-white' : 'bg-white border border-[#bfcaba] text-[#40493d] hover:border-[#0d631b]'}`}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-[#bfcaba] shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="h-32 bg-[#f3f3f3] flex items-center justify-center text-5xl shrink-0">{p.image}</div>
            <div className="p-4 flex flex-col flex-1">
              <div className="mb-3">
                {p.badge && <span className={`text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block ${p.badge === 'AI Recommended' ? 'bg-[#9cf49c] text-[#19722b]' : p.badge === 'Organic' ? 'bg-[#ffddb5] text-[#643f00]' : 'bg-[#e8e8e8] text-[#40493d]'}`}>{p.badge}</span>}
                <h3 className="font-bold text-sm text-[#1a1c1c] mb-1">{p.name}</h3>
                <p className="text-xs text-[#40493d] mb-1">{p.brand} • {p.unit}</p>
                <p className={`text-xs font-semibold ${p.stock === 'Low Stock' ? 'text-[#ba1a1a]' : 'text-[#0d631b]'}`}>{p.stock}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-bold text-[#0d631b]">{typeof p.price === 'number' ? `₹${p.price}` : p.price}</span>
                <button onClick={() => addToCart(p)} className="h-[36px] px-4 rounded-lg bg-[#0d631b] text-white text-xs font-bold hover:opacity-90 transition-opacity">{t('marketplace.add_to_cart')}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Side Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end items-start">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-[calc(100%-2rem)] md:w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden transition-transform transform translate-x-0 h-fit max-h-[calc(100vh-2rem)] m-4 rounded-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-[#f3fcef] shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2 text-[#006e2f]"><span className="material-symbols-outlined">shopping_cart</span> {t('marketplace.your_cart')}</h2>
              <button onClick={() => setIsCartOpen(false)} className="material-symbols-outlined text-gray-500 hover:text-black">close</button>
            </div>
            
            <div className="overflow-y-auto min-h-0 p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-6xl mb-4">remove_shopping_cart</span>
                  <p>{t('marketplace.empty_cart')}</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 border-b pb-4">
                    <div className="w-16 h-16 bg-[#f3f3f3] rounded flex items-center justify-center text-3xl">{item.image}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-[#1a1c1c]">{item.name}</h4>
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
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('marketplace.total_bill')}</span>
                  <span className="text-[#0d631b]">₹{cartTotal}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={clearCart} className="flex-1 h-12 border-2 border-[#ba1a1a] text-[#ba1a1a] rounded-lg font-bold uppercase tracking-wider hover:bg-[#ba1a1a] hover:text-white transition-colors">
                    Clear Cart
                  </button>
                  <button onClick={handleCheckout} className="flex-1 h-12 bg-[#0d631b] text-white rounded-lg font-bold uppercase tracking-wider hover:opacity-90">
                    {t('marketplace.checkout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
