import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function LandingPage() {
  const { language, setLanguage, t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleProtectedLink = (e, path) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to access this feature.");
      navigate('/login');
    } else {
      navigate(path);
    }
  }
  
  const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'te', label: 'తె' },
  ]

  return (
    <div className="antialiased overflow-x-hidden font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-[#0A1F0C] text-white text-sm py-2 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block font-medium tracking-wide">
          <span className="mx-8"><span className="material-symbols-outlined text-[16px] align-text-bottom text-[#00C853] mr-2">mail</span>Services@greenkrt.com</span>
          <span className="mx-8"><span className="material-symbols-outlined text-[16px] align-text-bottom text-[#00C853] mr-2">call</span>8179371179</span>
          <span className="mx-8 opacity-40">|</span>
          <span className="mx-8"><span className="material-symbols-outlined text-[16px] align-text-bottom text-[#00C853] mr-2">mail</span>Services@greenkrt.com</span>
          <span className="mx-8"><span className="material-symbols-outlined text-[16px] align-text-bottom text-[#00C853] mr-2">call</span>8179371179</span>
          <span className="mx-8 opacity-40">|</span>
          <span className="mx-8"><span className="material-symbols-outlined text-[16px] align-text-bottom text-[#00C853] mr-2">mail</span>Services@greenkrt.com</span>
          <span className="mx-8"><span className="material-symbols-outlined text-[16px] align-text-bottom text-[#00C853] mr-2">call</span>8179371179</span>
          <span className="mx-8 opacity-40">|</span>
          {/* Duplicated half to make seamless infinite scroll at 50% translateX */}
          <span className="mx-8"><span className="material-symbols-outlined text-[16px] align-text-bottom text-[#00C853] mr-2">mail</span>Services@greenkrt.com</span>
          <span className="mx-8"><span className="material-symbols-outlined text-[16px] align-text-bottom text-[#00C853] mr-2">call</span>8179371179</span>
          <span className="mx-8 opacity-40">|</span>
          <span className="mx-8"><span className="material-symbols-outlined text-[16px] align-text-bottom text-[#00C853] mr-2">mail</span>Services@greenkrt.com</span>
          <span className="mx-8"><span className="material-symbols-outlined text-[16px] align-text-bottom text-[#00C853] mr-2">call</span>8179371179</span>
          <span className="mx-8 opacity-40">|</span>
          <span className="mx-8"><span className="material-symbols-outlined text-[16px] align-text-bottom text-[#00C853] mr-2">mail</span>Services@greenkrt.com</span>
          <span className="mx-8"><span className="material-symbols-outlined text-[16px] align-text-bottom text-[#00C853] mr-2">call</span>8179371179</span>
          <span className="mx-8 opacity-40">|</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-16 h-20 bg-[#f9f9f9] border-b border-[#bfcaba] shadow-sm">
        <div className="flex items-center gap-2 text-[#0d631b] font-bold text-xl">
          <img src="/logo.jpeg" alt={t('auth.logo_alt')} className="w-8 h-8 rounded-full object-cover" />
          <span>{t('auth.brand_name')}</span>
        </div>
        <div className="hidden lg:flex items-center gap-8">
          {[
            { key: 'landing.services', text: 'Services' },
            { key: 'landing.soil', text: 'Soil Analysis' },
            { key: 'landing.shop', text: 'Shop' },
            { key: 'landing.crops', text: 'Crops' },
            { key: 'landing.about', text: 'About' }
          ].map(item => (
            <a key={item.key} className="text-[#40493d] font-medium hover:text-[#0d631b] transition-colors text-sm relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-0.5 after:bg-[#0d631b] after:transition-all hover:after:w-full" href="#">{t(item.key)}</a>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center bg-[#f3f3f3] rounded-full p-1 border border-[#bfcaba]">
            <span className="material-symbols-outlined text-[#40493d] px-2 text-xl">language</span>
            {LANGUAGES.map((lang) => (
              <span 
                key={lang.code} 
                onClick={() => setLanguage(lang.code)}
                className={`text-sm px-2 py-1 rounded-full cursor-pointer font-semibold uppercase ${language === lang.code ? 'bg-white shadow-sm text-[#0d631b]' : 'text-[#40493d] hover:text-[#0d631b]'}`}
              >
                {lang.label}
              </span>
            ))}
          </div>
          <Link to="/login">
            <button className="px-6 min-h-[48px] rounded-lg border-2 border-[#0d631b] text-[#0d631b] font-bold text-sm uppercase tracking-wider hover:bg-[#e8e8e8] transition-colors">{t('landing.login')}</button>
          </Link>
          <Link to="/signup">
            <button className="px-6 min-h-[48px] rounded-lg bg-[#00C853] text-white font-bold text-sm uppercase tracking-wider hover:opacity-90 shadow-[0_4px_12px_rgba(0,200,83,0.3)] transition-all">{t('landing.signup')}</button>
          </Link>
        </div>
        <Link to="/login" className="lg:hidden">
          <button className="px-4 min-h-[48px] rounded-lg bg-[#00C853] text-white font-bold text-sm">{t('landing.login')}</button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[600px] md:min-h-[700px] bg-[#0A1F0C] flex flex-col justify-center overflow-hidden w-full">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F0C] via-[#0A1F0C]/90 to-transparent z-10"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0A1F0C] to-transparent z-10"></div>
          <img
            alt="Farm panorama"
            className="w-full h-full object-cover object-center opacity-80"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB949DLBiT_tLpc7-DHzejG5OCoo1Yb29dVIIOpagox6HxNlB52d0Jn7T3h8VSGBnGQdbZkXB9KHc2Kx0jR-dX5Wt1j7HtwAdih8Le2ooPJ9FfqNxsh_mEbl_hBfJJumcP_ViYeTysJLL84o7e0oG5McGA09SsCYQI_nUxE8FAQiSA-dW0WeVJ-ZmGKC7JDbbi7ZAC6KImILkMJNdUB0EwEr0CIhYec1NiaLx2vc6oWLRX5xGD1lUZQLOsCZ5DpKNKpp5q9kCQJmnC5"
          />
        </div>
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 md:px-16 py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00C853]/20 border border-[#00C853]/30 text-[#00C853] font-semibold text-sm mb-8 backdrop-blur-sm">
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              {t('landing.empowering')}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              {t('landing.hero_title1')} <br />
              <span className="font-light italic text-[#00C853] text-5xl md:text-7xl" style={{fontFamily:'Lora,serif'}}>{t('landing.hero_title2').replace('.', '')}</span>.
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-12 max-w-2xl leading-relaxed">
              {t('landing.hero_desc')}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-16">
              <a href="/dashboard/book-drone" onClick={(e) => handleProtectedLink(e, '/dashboard/book-drone')}>
                <button className="px-8 min-h-[56px] rounded-lg bg-[#00C853] text-white font-bold text-sm uppercase tracking-wider hover:opacity-90 shadow-[0_8px_16px_rgba(0,200,83,0.25)] transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined">flight</span> {t('landing.btn_drone')}
                </button>
              </a>
              <a href="/dashboard/soil-test" onClick={(e) => handleProtectedLink(e, '/dashboard/soil-test')}>
                <button className="px-8 min-h-[56px] rounded-lg bg-white/10 border border-white/20 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/20 backdrop-blur-md transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined">science</span> {t('landing.btn_soil')}
                </button>
              </a>
              <a href="/dashboard/marketplace" onClick={(e) => handleProtectedLink(e, '/dashboard/marketplace')}>
                <button className="px-8 min-h-[56px] rounded-lg bg-white/10 border border-white/20 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/20 backdrop-blur-md transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined">storefront</span> {t('landing.btn_shop')}
                </button>
              </a>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-8">
              {[
                { icon: 'groups', value: '12k+', label: t('landing.stats_farmers') },
                { icon: 'flight_takeoff', value: '3.4k+', label: t('landing.stats_drones') },
                { icon: 'architecture', value: '800+', label: t('landing.stats_surveys') },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-4 glass-panel p-4 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-[#00C853]/20 flex items-center justify-center text-[#00C853]">
                    <span className="material-symbols-outlined">{stat.icon}</span>
                  </div>
                  <div>
                    <div className="text-white font-bold text-xl">{stat.value}</div>
                    <div className="text-white/60 text-sm">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Partner Section */}
      <section className="py-8 bg-white border-b border-[#bfcaba]">
        <div className="max-w-7xl mx-auto px-4 md:px-16 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-[#707a6c] uppercase tracking-wider mb-4">Technology Partner</p>
          <div className="flex flex-col md:flex-row items-center gap-4 opacity-90 hover:opacity-100 transition-opacity p-4 rounded-xl border border-[#bfcaba]/30 bg-[#f9f9f9]">
            <img src="/cdt-logo.png" alt="CDT SRM University-AP" className="h-16 object-contain hidden md:block" onError={(e) => e.target.style.display='none'} />
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-[#0d631b] md:hidden">flight_takeoff</span>
              <div className="text-center md:text-left">
                <h3 className="font-extrabold text-[#1a1c1c] text-xl md:text-2xl">Centre for Drone Technology (CDT)</h3>
                <p className="text-[#40493d] font-medium text-lg">SRM University-AP</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-24 px-4 md:px-16 w-full max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1c1c] mb-6">{t('landing.problem_title1')} <br />{t('landing.problem_title2')}</h2>
          <p className="text-[#40493d] text-lg">{t('landing.problem_desc')}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {[
              { problem: t('landing.prob1'), problemDesc: t('landing.prob1_desc'), solution: t('landing.sol1'), solutionDesc: t('landing.sol1_desc') },
              { problem: t('landing.prob2'), problemDesc: t('landing.prob2_desc'), solution: t('landing.sol2'), solutionDesc: t('landing.sol2_desc') },
              { problem: t('landing.prob3'), problemDesc: t('landing.prob3_desc'), solution: t('landing.sol3'), solutionDesc: t('landing.sol3_desc') },
            ].map(row => (
              <div key={row.problem} className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center border-b border-[#bfcaba] pb-6 last:border-0">
                <div className="flex gap-3 items-start opacity-70">
                  <span className="material-symbols-outlined text-[#ba1a1a] mt-1">cancel</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1c1c] mb-1">{row.problem}</h4>
                    <p className="text-xs text-[#40493d]">{row.problemDesc}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#707a6c]">arrow_forward</span>
                <div className="flex gap-3 items-start bg-[#0d631b]/10 p-4 rounded-xl border border-[#0d631b]/20">
                  <span className="material-symbols-outlined text-[#0d631b] mt-1">check_circle</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1c1c] mb-1">{row.solution}</h4>
                    <p className="text-xs text-[#40493d]">{row.solutionDesc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Dashboard Mockup */}
          <div className="relative bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-2xl border border-[#bfcaba] p-2 overflow-hidden h-[450px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f3f3f3] to-[#eeeeee] p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center mb-4">
                <div className="h-8 w-32 bg-[#bfcaba]/30 rounded-full"></div>
                <div className="h-8 w-8 bg-[#bfcaba]/30 rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { color: '#0d631b', icon: 'flight' },
                  { color: '#00C853', icon: 'science' },
                ].map((card, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm h-32 border border-[#bfcaba]/50 relative overflow-hidden">
                    <div className="h-4 w-20 rounded mb-2" style={{ background: `${card.color}20` }}></div>
                    <div className="h-8 w-16 rounded" style={{ background: `${card.color}40` }}></div>
                    <span className="material-symbols-outlined absolute bottom-2 right-2 text-4xl" style={{ color: `${card.color}20` }}>{card.icon}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm flex-1 border border-[#bfcaba]/50 flex flex-col justify-end">
                <div className="flex items-end justify-between h-3/4 gap-2 px-2">
                  {[33, 66, 100, 50, 80].map((h, i) => (
                    <div key={i} className="w-full rounded-t-sm" style={{ height: `${h}%`, background: i === 2 ? '#00C853' : i % 2 === 0 ? '#0d631b40' : '#0d631b60' }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Cards */}
      <section className="py-24 px-4 md:px-16 bg-[#eeeeee]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1c1c] mb-4">{t('landing.services_title')}</h2>
            <p className="text-[#40493d]">{t('landing.services_desc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'flight', title: 'Drone Spraying', desc: 'GPS-guided certified drone pilots for precision pesticide & fertilizer application.', color: '#0d631b', link: '/dashboard/book-drone' },
              { icon: 'straighten', title: 'Land Measurement', desc: 'Accurate drone-based land surveys for farm boundary mapping and area calculation.', color: '#126d27', link: '/dashboard/book-land' },
              { icon: 'biotech', title: 'AI Soil Analysis', desc: 'Submit soil samples and get AI-driven nutrient reports with custom crop recommendations.', color: '#1B6B2F', link: '/dashboard/soil-test' },
              { icon: 'storefront', title: 'Agri Marketplace', desc: 'Shop 100% genuine fertilizers, seeds, and tools directly from verified manufacturers.', color: '#774c00', link: '/dashboard/marketplace' },
            ].map(service => (
              <div key={service.title} className="bg-white rounded-xl p-6 shadow-sm border border-[#bfcaba] hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: `${service.color}15` }}>
                  <span className="material-symbols-outlined text-3xl" style={{ color: service.color }}>{service.icon}</span>
                </div>
                <h3 className="font-bold text-lg text-[#1a1c1c] mb-2">{service.title}</h3>
                <p className="text-[#40493d] text-sm leading-relaxed mb-4">{service.desc}</p>
                <a href={service.link} onClick={(e) => handleProtectedLink(e, service.link)} className="text-[#0d631b] font-semibold text-sm hover:underline flex items-center gap-1">
                  {t('landing.book_now')} <span className="material-symbols-outlined text-base">arrow_forward</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 md:px-16 bg-[#0A1F0C]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">{t('landing.cta_title')}</h2>
          <p className="text-white/70 text-lg mb-10">{t('landing.cta_desc')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <button className="px-10 min-h-[56px] rounded-lg bg-[#00C853] text-white font-bold text-sm uppercase tracking-wider shadow-[0_8px_16px_rgba(0,200,83,0.3)] hover:opacity-90 transition-all">{t('landing.cta_create')}</button>
            </Link>
            <Link to="/login">
              <button className="px-10 min-h-[56px] rounded-lg border-2 border-white/30 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-all">{t('landing.cta_signin')}</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a1a0a] text-white/60 py-12 px-4 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.jpeg" alt={t('auth.logo_alt')} className="w-6 h-6 rounded-full object-cover" />
            <span className="font-bold text-white text-lg">{t('auth.brand_name')}</span>
          </div>
          <div className="flex gap-8 text-sm">
            {['Privacy Policy','Terms of Service','Contact Us'].map(link => (
              <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
      <footer className="bg-[#051106] py-8 text-center border-t border-white/10">
        <p className="text-white/40 text-sm">{t('landing.footer_rights')}</p>
      </footer>
    </div>
  )
}
