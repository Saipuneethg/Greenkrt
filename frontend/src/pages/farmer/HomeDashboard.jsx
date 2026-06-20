import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import axios from 'axios'

export default function HomeDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [taskDone, setTaskDone] = useState(false)
  const [weatherData, setWeatherData] = useState(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const city = user?.district ? user.district.split(',')[0].trim() : 'Guntur'

        const res = await axios.get(`http://localhost:5000/api/weather`, {
          params: { city },
          headers: {
            'x-auth-token': sessionStorage.getItem('greenkrt_token')
          }
        })
        const data = res.data
        
        setWeatherData({
          temp: Math.round(data.main.temp),
          iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          description: data.weather[0].main,
          city: data.name
        })
      } catch (err) {
        console.error("Failed to fetch weather", err)
      }
    }
    fetchWeather()
  }, [user])

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#bfcaba] overflow-hidden">
          <div className="bg-[#ffb957] text-[#643f00] px-4 py-3 flex items-center gap-2 text-sm font-semibold">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            {t('dashboard.warning')}
          </div>
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#1a1c1c] mb-2">{t('dashboard.welcome')}, {user?.firstName || 'Farmer'}.</h1>
              <p className="text-[#40493d] mb-6">{t('dashboard.sub_welcome')}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard/soil-test">
                  <button className="bg-[#0d631b] hover:bg-[#0d631b]/90 text-white h-[48px] px-6 rounded-lg font-semibold text-sm uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">upload_file</span> {t('dashboard.upload_soil')}
                  </button>
                </Link>
                <Link to="/dashboard/book-drone">
                  <button className="border-2 border-[#0d631b] text-[#0d631b] hover:bg-[#0d631b]/5 h-[48px] px-6 rounded-lg font-semibold text-sm uppercase tracking-wider transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">flight</span> {t('dashboard.book_drone')}
                  </button>
                </Link>
              </div>
            </div>
            {/* Circular Gauge */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e2e2" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0d631b" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="95.4" strokeLinecap="round" />
                </svg>
                <span className="text-2xl font-bold text-[#0d631b] z-10">62%</span>
              </div>
              <span className="text-xs font-bold text-[#40493d] mt-2 text-center">{t('dashboard.season_readiness')}</span>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: 'local_shipping', value: '3', tKey: 'dashboard.active_orders', badge: 'LIVE', badgeColor: 'bg-[#9cf49c] text-[#19722b]' },
            { icon: 'agriculture', value: '2', tKey: 'dashboard.services_booked', badge: '', badgeColor: '' },
            { icon: 'biotech', value: '1', tKey: 'dashboard.soil_due', badge: '⚠️', badgeColor: '', urgent: true },
            { icon: 'shopping_cart', value: '₹1,840', tKey: 'dashboard.cart_value', badge: '', badgeColor: '' },
          ].map(card => (
            <div key={card.tKey} className={`p-4 rounded-xl shadow-sm border flex flex-col justify-between ${card.urgent ? 'bg-[#ffdad6] border-[#ba1a1a]/20' : 'bg-white border-[#bfcaba]'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`material-symbols-outlined text-3xl ${card.urgent ? 'text-[#ba1a1a]' : 'text-[#0d631b]'}`}>{card.icon}</span>
                {card.badge && <span className={`text-xs px-2 py-1 rounded-full font-bold ${card.badgeColor}`}>{card.badge}</span>}
              </div>
              <div>
                <div className={`text-2xl font-bold ${card.urgent ? 'text-[#93000a]' : 'text-[#1a1c1c]'}`}>{card.value}</div>
                <div className="text-xs font-semibold text-[#40493d] mt-1">{t(card.tKey)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-xl shadow-sm border border-[#bfcaba] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#bfcaba] bg-[#f3f3f3] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0d631b]">task_alt</span>
            <h2 className="font-bold text-[#1a1c1c]">{t('dashboard.action_items')}</h2>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="border-l-4 border-[#0d631b] bg-[#f9f9f9] p-4 rounded-r-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#1a1c1c]">{taskDone ? <s>Apply NPK 20:20:20</s> : 'Apply NPK 20:20:20'}</h3>
                <p className="text-xs text-[#40493d]">Recommended for Rice Crop (Plot A). Optimal time: Before 10 AM.</p>
              </div>
              <button 
                onClick={() => setTaskDone(true)}
                disabled={taskDone}
                className={`h-[48px] px-6 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center gap-2 ${taskDone ? 'bg-[#0d631b] text-white cursor-default' : 'bg-[#0d631b]/10 text-[#0d631b] hover:bg-[#0d631b] hover:text-white border border-[#0d631b]'}`}
              >
                {taskDone ? <><span className="material-symbols-outlined text-sm">check_circle</span> Done</> : 'Mark Done'}
              </button>
            </div>
            <div className="border-l-4 border-[#ffb957] bg-[#fffdf0] p-4 rounded-r-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#1a1c1c]">Payment Pending #ORD-8821</h3>
                <p className="text-xs text-[#40493d]">Complete payment for Urea fertilizer to dispatch.</p>
              </div>
              <Link to="/dashboard/orders">
                <button className="bg-[#ffb957] text-[#643f00] h-[48px] px-6 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors shrink-0 shadow-sm hover:opacity-90">Pay Now</button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* My Farm */}
        <div className="bg-white rounded-xl shadow-sm border border-[#bfcaba] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#bfcaba] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0d631b]">landscape</span>
            <h2 className="font-bold text-[#1a1c1c]">{t('dashboard.my_farm_title')}</h2>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-xl font-bold text-[#1a1c1c]">4.5 Acres</div>
                <div className="text-sm text-[#40493d]">Guntur, AP • Rice</div>
              </div>
              <div className="w-12 h-12 bg-[#9cf49c] rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#19722b]">grass</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-[#40493d]">{t('dashboard.soil_health')}</span>
                <span className="text-lg font-bold text-[#0d631b]">72/100</span>
              </div>
              <div className="w-full bg-[#e2e2e2] rounded-full h-2.5">
                <div className="bg-[#0d631b] h-2.5 rounded-full" style={{ width: '72%' }}></div>
              </div>
              <p className="text-xs text-[#40493d] mt-2 text-right">Good condition. Needs nitrogen.</p>
            </div>
          </div>
        </div>

        {/* Weather Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#bfcaba] overflow-hidden relative">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0d631b 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          <div className="p-4 relative z-10 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#1a1c1c] mb-1">
                {t('dashboard.weather')} - {weatherData ? weatherData.city : (user?.district?.split(',')[0] || 'Guntur')}
              </h2>
              <div className="text-2xl font-bold text-[#0d631b] flex items-center gap-2">
                {weatherData ? `${weatherData.temp}°C` : '32°C'}
                {weatherData ? (
                  <img src={weatherData.iconUrl} alt="Weather icon" className="w-10 h-10 -ml-1 drop-shadow-sm" />
                ) : (
                  <span className="material-symbols-outlined text-3xl">partly_cloudy_day</span>
                )}
              </div>
            </div>
            <div className="text-right">
              {(!weatherData || ['Rain', 'Thunderstorm', 'Drizzle'].includes(weatherData.description)) ? (
                <span className="inline-block bg-[#ffb957] text-[#643f00] text-xs px-2 py-1 rounded font-bold border border-[#986200]">
                  {t('dashboard.rain_expected')}
                </span>
              ) : (
                <span className="inline-block bg-[#cfe6c9] text-[#19722b] text-xs px-2 py-1 rounded font-bold border border-[#0d631b]">
                  {weatherData.description}
                </span>
              )}
            </div>
          </div>
          {/* Note: The 3-day forecast requires a different API endpoint (OneCall or Forecast), so leaving it as mock or you can hide it later. */}
          <div className="px-4 pb-4 grid grid-cols-3 gap-2 relative z-10">
            {[
              { day: 'Thu', icon: 'rainy', temp: '28°C' },
              { day: 'Fri', icon: 'thunderstorm', temp: '25°C' },
              { day: 'Sat', icon: 'sunny', temp: '34°C' },
            ].map(d => (
              <div key={d.day} className="bg-white/80 backdrop-blur-sm rounded-lg p-2 text-center border border-[#e2e2e2]">
                <div className="text-xs text-[#40493d]">{d.day}</div>
                <span className="material-symbols-outlined text-[#0d631b]">{d.icon}</span>
                <div className="text-xs font-bold text-[#1a1c1c]">{d.temp}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-[#bfcaba] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#bfcaba] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0d631b]">bolt</span>
            <h2 className="font-bold text-[#1a1c1c]">{t('dashboard.quick_actions')}</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { icon: 'flight', tKey: 'dashboard.book_drone', link: '/dashboard/book-drone', color: '#0d631b' },
              { icon: 'storefront', tKey: 'dashboard.shop_now', link: '/dashboard/marketplace', color: '#126d27' },
              { icon: 'biotech', tKey: 'dashboard.soil_test', link: '/dashboard/soil-test', color: '#1B6B2F' },
              { icon: 'local_shipping', tKey: 'dashboard.track_order', link: '/dashboard/tracking', color: '#774c00' },
            ].map(action => (
              <Link key={action.tKey} to={action.link}>
                <button className="w-full h-[48px] border border-[#bfcaba] rounded-lg flex items-center justify-center gap-2 text-sm font-semibold text-[#1a1c1c] hover:border-[#0d631b] hover:text-[#0d631b] transition-colors bg-white">
                  <span className="material-symbols-outlined text-[20px]" style={{ color: action.color }}>{action.icon}</span>
                  {t(action.tKey)}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
