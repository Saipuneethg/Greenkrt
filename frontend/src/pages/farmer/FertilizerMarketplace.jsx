import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'

export default function FertilizerMarketplace() {
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const { cart, addToCart, updateQuantity, cartCount, isCartOpen, setIsCartOpen } = useCart()
  const { t, language } = useLanguage()
  const { products } = useData()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('q')
    if (q) {
      setSearch(q)
    }
  }, [location.search])

  // Track the selected category by index (0 for All, 1 for Fertilizers, etc.) to prevent translation mismatch
  const [categoryIndex, setCategoryIndex] = useState(0)

  const categories = t('marketplace.categories') || ['All', 'Fertilizers', 'Pesticides', 'Micronutrients', 'Seeds']
  const englishCategories = ['All', 'Fertilizers', 'Pesticides', 'Micronutrients', 'Seeds']
  const selectedEnglishCategory = englishCategories[categoryIndex] || 'All'

  // Translation helpers for dynamic product attributes
  const translateBadge = (badge) => {
    if (!badge) return ''
    if (language === 'te') {
      const badgeMap = {
        'Best Seller': 'బెస్ట్ సెల్లర్',
        'AI Recommended': 'AI సిఫార్సు చేసినవి',
        'Organic': 'సేంద్రీయ',
        'Certified': 'సర్టిఫైడ్'
      }
      return badgeMap[badge] || badge
    }
    return badge
  }

  const translateUnit = (unit) => {
    if (!unit) return ''
    if (language === 'te') {
      return unit
        .replace('50kg bag', '50 కిలోల బస్తా')
        .replace('25kg bag', '25 కిలోల బస్తా')
        .replace('30kg bag', '30 కిలోల బస్తా')
        .replace('10kg bag', '10 కిలోల బస్తా')
        .replace('5kg bag', '5 కిలోల బస్తా')
        .replace('1L bottle', '1 లీటరు సీసా')
        .replace('500ml', '500 మి.లీ')
        .replace('sample', 'నమూనా')
    }
    return unit
  }

  const translateStock = (stock) => {
    if (typeof stock === 'number') {
      return language === 'te' ? `${stock} స్టాక్ ఉంది` : `${stock} items left`
    }
    if (language === 'te') {
      const stockMap = {
        'In Stock': 'స్టాక్ ఉంది',
        'Low Stock': 'తక్కువ స్టాక్ ఉంది',
        'Out of Stock': 'స్టాక్ లేదు'
      }
      return stockMap[stock] || stock
    }
    return stock
  }

  const filtered = products.filter(p => {
    const matchesCategory = selectedEnglishCategory === 'All' || p.category === selectedEnglishCategory
    
    // Resolve product name translation
    const translatedName = t('products.' + p.id) !== 'products.' + p.id ? t('products.' + p.id) : p.name
    
    // Support searching by both English name and Telugu name
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          translatedName.toLowerCase().includes(search.toLowerCase())
                          
    return matchesCategory && matchesSearch
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1c1c] mb-1">{t('marketplace.title')}</h1>
        <p className="text-[#40493d] text-sm">{t('marketplace.subtitle')}</p>
      </div>



      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#40493d]">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('marketplace.search_placeholder')}
            className="w-full h-[48px] pl-12 pr-12 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#40493d] hover:text-[#1a1c1c] flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c, index) => (
            <button
              key={c}
              onClick={() => setCategoryIndex(index)}
              className={`px-4 h-[40px] rounded-full text-sm font-semibold transition-colors ${categoryIndex === index ? 'bg-[#0d631b] text-white' : 'bg-white border border-[#bfcaba] text-[#40493d] hover:border-[#0d631b]'}`}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(p => {
          const cartItem = cart.find(item => item.id === p.id);
          const translatedName = t('products.' + p.id) !== 'products.' + p.id ? t('products.' + p.id) : p.name;
          
          const getProductSymbol = (category) => {
            switch (category) {
              case 'Fertilizers': return '🌾';
              case 'Pesticides': return '🛡️';
              case 'Micronutrients': return '🧪';
              case 'Seeds': return '🌱';
              default: return '📦';
            }
          }
          
          return (
            <div key={p.id} className="bg-white rounded-xl border border-[#bfcaba] shadow-sm overflow-hidden flex flex-col">
              <div className="h-32 bg-[#f3f3f3] flex items-center justify-center text-5xl shrink-0">{getProductSymbol(p.category)}</div>
              <div className="p-4 flex flex-col flex-1">
                <div className="mb-3">
                  {p.badge && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block ${p.badge === 'AI Recommended' ? 'bg-[#9cf49c] text-[#19722b]' : p.badge === 'Organic' ? 'bg-[#ffddb5] text-[#643f00]' : 'bg-[#e8e8e8] text-[#40493d]'}`}>
                      {translateBadge(p.badge)}
                    </span>
                  )}
                  <h3 className="font-bold text-sm text-[#1a1c1c] mb-1">{translatedName}</h3>
                  <p className="text-xs text-[#40493d] mb-1">{p.brand} • {translateUnit(p.unit)}</p>
                  <p className={`text-xs font-semibold ${p.stock === 'Low Stock' ? 'text-[#ba1a1a]' : 'text-[#0d631b]'}`}>{translateStock(p.stock)}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold text-[#0d631b]">{typeof p.price === 'number' ? `₹${p.price}` : p.price}</span>
                  {cartItem ? (
                    <div className="flex items-center gap-3 bg-[#f3fcef] rounded-lg px-2 h-[36px] border border-[#0d631b]">
                      <button onClick={() => updateQuantity(p.id, -1)} className="w-6 h-6 flex items-center justify-center text-[#0d631b] font-bold text-lg hover:bg-white rounded transition-colors">-</button>
                      <span className="text-sm font-bold text-[#0d631b] w-4 text-center">{cartItem.quantity}</span>
                      <button onClick={() => updateQuantity(p.id, 1)} className="w-6 h-6 flex items-center justify-center text-[#0d631b] font-bold text-lg hover:bg-white rounded transition-colors">+</button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(p)} className="h-[36px] px-4 rounded-lg bg-[#0d631b] text-white text-xs font-bold hover:opacity-90 transition-opacity">{t('marketplace.add_to_cart')}</button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
