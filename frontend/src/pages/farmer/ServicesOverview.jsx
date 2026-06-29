import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'

export default function ServicesOverview() {
  const { t } = useLanguage()
  const { services } = useData()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1c1c] mb-2">{t('services.title')}</h1>
        <p className="text-[#40493d]">{t('services.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, idx) => {
          // Find matching translation index by comparing English titles
          // Since data comes from backend, we match by default title to get translation
          const tIdx = s.title === 'Drone Spraying Service' ? 0 
                     : s.title === 'Land Measurement' ? 1 
                     : s.title === 'Soil Test & AI Analysis' ? 2 
                     : s.title === 'Irrigation Setup' ? 3 : -1;
          
          const title = tIdx !== -1 ? t(`services.items.${tIdx}.title`) : s.name || s.title;
          const desc = tIdx !== -1 ? t(`services.items.${tIdx}.desc`) : s.desc;
          const badge = tIdx !== -1 && s.badge ? t(`services.items.${tIdx}.badge`) : s.badge;
          const price = tIdx !== -1 ? t(`services.items.${tIdx}.price`) : s.basePrice || s.price;

          return (
            <div key={idx} className="bg-white rounded-xl border border-[#bfcaba] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                    <span className="material-symbols-outlined text-3xl" style={{ color: s.color }}>{s.icon}</span>
                  </div>
                  {badge && <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: s.color, color: 'white' }}>{badge}</span>}
                </div>
                <h3 className="font-bold text-lg text-[#1a1c1c] mb-2">{title}</h3>
                <p className="text-sm text-[#40493d] leading-relaxed mb-4">{desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-[#0d631b]">{price}</span>
                  <Link to={s.link || '#'}>
                    <button className="h-[40px] px-5 rounded-lg font-semibold text-sm text-white transition-colors" style={{ background: s.color }}>
                      {t('services.book_now')}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
