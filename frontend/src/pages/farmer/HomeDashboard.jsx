import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import axios from 'axios'
import API_BASE from '../../config/api'

const farmingQuotes = {
  en: [
    "To farm is to be a part of the miracle of growth.",
    "In the heart of every farmer lies the hope for a bountiful harvest.",
    "Agriculture is our wisest pursuit, contributing most to real wealth and happiness.",
    "No race can prosper till it learns that there is as much dignity in tilling a field as in writing a poem.",
    "The farmer is the only man in our economy who buys everything at retail, sells everything at wholesale, and pays the freight both ways.",
    "A farmer is a magician who produces money and food from the mud."
  ],
  te: [
    "వ్యవసాయం చేయడం అంటే సృష్టిలోని ఎదుగుదల అద్భుతంలో భాగం కావడం.",
    "ప్రти రైతు హృదయంలో సమృద్ధిగా పంట పండాలనే ఆశ ఉంటుంది.",
    "వ్యవసాయమే అన్నిటికన్నా జ్ఞానవంతమైన వృత్తి, ఇది నిజమైన సంపదకు, ఆనందానికి దోహదం చేస్తుంది.",
    "దేశానికి వెన్నెముక రైతు. రైతు బాగుంటేనే దేశం బాగుంటుంది.",
    "నేలను నమ్ముకున్నవాడు ఎన్నటికీ చెడిపోడు.",
    "రైతు లేనిదే మనకు ముద్ద దొరకదు. వ్యవసాయమే మన జీవనాధారం."
  ]
}

export default function HomeDashboard() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [bookings, setBookings] = useState([])
  const [doneTasks, setDoneTasks] = useState([])
  const [weatherData, setWeatherData] = useState(null)
  const [plots, setPlots] = useState([])
  const [activeOrder, setActiveOrder] = useState(null)
  const [latestSoilTest, setLatestSoilTest] = useState(null)

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/farms`, {
          headers: { 'x-auth-token': sessionStorage.getItem('greenkrt_token') }
        })
        setPlots(res.data)
      } catch (e) {
        console.error("Failed to fetch farms", e)
      }
    }
    fetchPlots()
  }, [])

  // Season-aware fallback weather — works for any time of year regardless of rain/sun/winter
  const getSeasonalDefault = () => {
    const month = new Date().getMonth() // 0=Jan, 11=Dec
    const city = user?.district?.split(',')[0]?.trim() || 'Guntur'
    if (month >= 2 && month <= 4) {
      // March–May: Summer
      return { temp: 38, description: 'Clear', icon: '01d', city, iconUrl: null, seasonal: true }
    } else if (month >= 5 && month <= 8) {
      // June–September: Monsoon
      return { temp: 29, description: 'Rain', icon: '10d', city, iconUrl: null, seasonal: true }
    } else if (month >= 9 && month <= 10) {
      // October–November: Post-Monsoon
      return { temp: 32, description: 'Clouds', icon: '02d', city, iconUrl: null, seasonal: true }
    } else {
      // December–February: Winter
      return { temp: 22, description: 'Mist', icon: '50d', city, iconUrl: null, seasonal: true }
    }
  }

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        let city = 'Guntur'
        const savedLoc = localStorage.getItem('userLocation')
        if (savedLoc) {
          try {
            const parsed = JSON.parse(savedLoc)
            if (parsed.city) city = parsed.city
          } catch (e) { /* ignore parse error */ }
        } else if (user?.district) {
          city = user.district.split(',')[0].trim()
        }

        const res = await axios.get(`${API_BASE}/api/weather`, {
          params: { city },
          headers: {
            'x-auth-token': sessionStorage.getItem('greenkrt_token')
          }
        })
        const data = res.data
        
        setWeatherData({
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          wind: Math.round(data.wind.speed * 3.6), // m/s to km/h
          iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          description: data.weather[0].main,
          detailedDesc: data.weather[0].description,
          city: data.name,
          seasonal: false  // real API data
        })
      } catch (err) {
        console.error("Failed to fetch weather, using seasonal default", err)
        // Use season-aware default so UI always shows meaningful data
        setWeatherData(getSeasonalDefault())
      }
    }
    fetchWeather()

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/orders`, {
          headers: { 'x-auth-token': sessionStorage.getItem('greenkrt_token') }
        })
        const active = res.data.find(o => o.status !== 'Delivered')
        if (active) setActiveOrder(active)
      } catch (e) {
        console.error("Failed to fetch orders", e)
      }
    }
    fetchOrders()

    const fetchSoilTests = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/soil-tests`, {
          headers: { 'x-auth-token': sessionStorage.getItem('greenkrt_token') }
        })
        if (res.data && res.data.length > 0) {
          setLatestSoilTest(res.data[0])
        }
      } catch (e) {
        console.error("Failed to fetch soil tests", e)
      }
    }
    fetchSoilTests()

    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/services/bookings`, {
          headers: { 'x-auth-token': sessionStorage.getItem('greenkrt_token') }
        })
        setBookings(res.data)
      } catch (e) {
        console.error("Failed to fetch bookings", e)
      }
    }
    fetchBookings()
  }, [user])

  const getDynamicWeatherMessage = (weather) => {
    // Brief loading state — before seasonal default or real data is set
    if (!weather) {
      const quotes = farmingQuotes[language] || farmingQuotes.en;
      const quote = quotes[new Date().getDate() % quotes.length];
      return {
        msg: quote,
        color: 'bg-[#f3fcef] text-[#0d631b]',
        border: 'border-[#bccbb9]/40',
        icon: 'eco'
      };
    }
    
    const condition = weather.description.toLowerCase();
    const temp = weather.temp;
    const isTelugu = language === 'te';
    // Add "(Estimated)" suffix when showing seasonal fallback data
    const estSuffix = weather.seasonal ? (isTelugu ? ' (అంచనా)' : ' (Estimated)') : '';

    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) {
      return {
        msg: (isTelugu 
          ? `${weather.city} లో వర్షం కురిసే అవకాశం ఉంది. పురుగుమందుల పిచికారీని వాయిదా వేయండి మరియు పొలంలో నీటి నిల్వ లేకుండా చూసుకోండి.`
          : `Rain expected in ${weather.city}. Delay pesticide spraying and ensure proper field drainage.`) + estSuffix,
        color: 'bg-[#d3e3fd] text-[#004a77]',
        border: 'border-[#a8c7fa]',
        icon: 'rainy'
      };
    } else if (temp >= 35) {
      return {
        msg: (isTelugu
          ? `${weather.city} లో అధిక ఉష్ణోగ్రత హెచ్చరిక (${temp}°C). ఉదయం లేదా సాయంత్రం వేళల్లో పంటలకు నీరు పెట్టండి.`
          : `High temperature alert (${temp}°C) in ${weather.city}. Irrigate crops in the early morning or evening.`) + estSuffix,
        color: 'bg-[#ffdad6] text-[#93000a]',
        border: 'border-[#ffb4ab]',
        icon: 'local_fire_department'
      };
    } else if (temp <= 15) {
      return {
        msg: (isTelugu
          ? `${weather.city} లో తక్కువ ఉష్ణోగ్రత (${temp}°C). చలి ప్రభావం నుండి పంటలను రక్షించండి.`
          : `Cold temperature (${temp}°C) in ${weather.city}. Protect sensitive crops from potential frost.`) + estSuffix,
        color: 'bg-[#e8def8] text-[#4a4458]',
        border: 'border-[#d0bcff]',
        icon: 'ac_unit'
      };
    } else {
      let desc = weather.description;
      if (isTelugu) {
        if (desc.toLowerCase() === 'clear') desc = 'ఆకాశం ప్రశాంతంగా ఉంది';
        else if (desc.toLowerCase() === 'clouds') desc = 'మేఘావృతమై ఉంది';
        else if (desc.toLowerCase() === 'haze') desc = 'మంచుగా ఉంది';
        else if (desc.toLowerCase() === 'mist') desc = 'పొగమంచు';
      }
      return {
        msg: (isTelugu
          ? `${weather.city} లో సాధారణ వాతావరణ పరిస్థితులు (${temp}°C, ${desc}) ఉన్నాయి. పొలం పనులకు ఇది అనుకూలమైన సమయం!`
          : `Optimal weather conditions (${temp}°C, ${desc}) in ${weather.city}. Perfect time for field operations!`) + estSuffix,
        color: 'bg-[#c4eed0] text-[#0d631b]',
        border: 'border-[#9cf49c]',
        icon: 'agriculture'
      };
    }
  }

  const weatherAlert = getDynamicWeatherMessage(weatherData);

  const translateCrop = (cropName) => {
    if (!cropName) return '';
    if (language !== 'te') return cropName;
    const lower = cropName.toLowerCase();
    const cropMap = {
      cotton: 'పత్తి',
      paddy: 'వరి',
      rice: 'వరి',
      chilli: 'మిరప',
      chili: 'మిరప',
      maize: 'మొక్కజొన్న',
      wheat: 'గోధుమ'
    };
    return cropMap[lower] || cropName;
  }

  const translateChemical = (chem) => {
    if (!chem) return '';
    if (language !== 'te') return chem;
    const lower = chem.toLowerCase();
    if (lower.includes('nano urea')) return 'ఎరువు - నానో యూరియా';
    if (lower.includes('chlorpyrifos')) return 'పురుగుమందు - క్లోరిపైరిఫాస్';
    if (lower.includes('fungicide')) return 'శిలీంద్ర సంహారిణి';
    return chem;
  }

  const handleMarkDone = (taskId) => {
    setDoneTasks(prev => [...prev, taskId])
  }

  const getGoals = () => {
    const goalsList = []

    // 1. Soil report action
    if (latestSoilTest?.results?.todaysAction) {
      goalsList.push({
        id: 'soil_action',
        type: 'soil',
        title: latestSoilTest.results.todaysAction,
        sub: language === 'te' ? 'మీ ఇటీవలి AI మట్టి పరీక్ష ఆధారంగా' : 'Based on your latest AI Soil Test Analysis',
        icon: 'science'
      })
    }

    // 2. Active drone spraying or land measurement bookings (Pending/Scheduled)
    bookings.forEach(b => {
      if (b.status === 'Pending' || b.status === 'Scheduled') {
        const cropStr = translateCrop(b.details?.cropType) || (language === 'te' ? 'పంటలు' : 'crops')
        const chemStr = b.details?.chemicalType ? ` with ${b.details.chemicalType}` : ''
        const dateStr = b.details?.date || ''
        const timeStr = b.details?.time || ''
        
        let title = ''
        let sub = ''
        const isTelugu = language === 'te'
        if (b.serviceType === 'drone') {
          title = isTelugu
            ? `${cropStr} కోసం డ్రోన్ పిచికారీకి పొలాన్ని సిద్ధం చేయండి ${b.details?.chemicalType ? `(${translateChemical(b.details.chemicalType)})` : ''}`
            : `Prepare field for Drone Spraying of ${cropStr}${chemStr}`
          sub = isTelugu
            ? `డ్రోన్ సేవ ${b.bookingId} ని ${dateStr} న ${timeStr} గంటలకు షెడ్యూల్ చేయబడింది`
            : `Drone service ${b.bookingId} is scheduled for ${dateStr} at ${timeStr}`
        } else {
          title = isTelugu
            ? `భూమి సర్వే / కొలత కోసం అడ్డంకులను తొలగించండి`
            : `Clear obstacles for Land Survey / Measurement`
          sub = isTelugu
            ? `భూమి సేవ ${b.bookingId} ని ${dateStr} న ${timeStr} గంటలకు షెడ్యూల్ చేయబడింది`
            : `Land service ${b.bookingId} is scheduled for ${dateStr} at ${timeStr}`
        }
        
        goalsList.push({
          id: b.bookingId,
          type: 'service',
          title,
          sub,
          icon: b.serviceType === 'drone' ? 'flight' : 'straighten'
        })
      }
    })

    // 3. Real suggestions from AI report phases
    if (latestSoilTest?.results?.phases) {
      const phases = latestSoilTest.results.phases
      const phaseKeys = ['sowing', 'vegetative', 'flowering', 'fruiting']
      
      phaseKeys.forEach(phase => {
        if (phases[phase]) {
          phases[phase].forEach((item, idx) => {
            if (item.productName && item.productName !== '...') {
              goalsList.push({
                id: `soil_phase_${phase}_${idx}`,
                type: 'soil',
                title: language === 'te' 
                  ? `${item.productName} ని వాడండి (${item.amount || 'తగినంత'})` 
                  : `Apply ${item.productName} (${item.amount || 'Required amount'})`,
                sub: language === 'te' 
                  ? `${phase.toUpperCase()} దశ: ${item.reason}` 
                  : `${phase.toUpperCase()} Phase: ${item.reason}`,
                icon: 'compost'
              })
            }
          })
        }
      })
    }

    return goalsList
  }

  const goals = getGoals()

  const calculateReadiness = () => {
    return latestSoilTest?.results?.score || 0;
  }
  const readinessPercent = calculateReadiness();
  const strokeDashoffset = 251.2 - (251.2 * readinessPercent) / 100;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#bfcaba] overflow-hidden">
          <div className={`${weatherAlert.color} border-b ${weatherAlert.border} px-4 py-3 flex items-center gap-2 text-sm font-semibold transition-colors duration-500`}>
            <span className="material-symbols-outlined text-[20px]">{weatherAlert.icon}</span>
            {weatherAlert.msg}
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
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0d631b" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                {readinessPercent > 0 ? (
                  <span className="text-2xl font-bold text-[#0d631b] z-10">{readinessPercent}%</span>
                ) : (
                  <Link to={plots.length === 0 ? "/dashboard/home" : "/dashboard/soil-test"} className="z-10 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform bg-white/80 rounded-full p-2">
                    <span className="material-symbols-outlined text-[#0d631b]">add</span>
                    <span className="text-sm font-bold text-[#0d631b]">0%</span>
                  </Link>
                )}
              </div>
              <span className="text-xs font-bold text-[#40493d] mt-2 text-center">Soil Readiness</span>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-xl shadow-sm border border-[#bfcaba] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#bfcaba] bg-[#f3f3f3] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0d631b]">task_alt</span>
            <h2 className="font-bold text-[#1a1c1c]">{t('dashboard.action_items')}</h2>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {goals.length === 0 ? (
              <div className="border-l-4 border-[#bfcaba] bg-[#f9f9f9] p-4 rounded-r-lg shadow-sm text-sm text-[#40493d]">
                {t('dashboard.no_crop_tasks')}
              </div>
            ) : (
              goals.map(goal => {
                const completed = doneTasks.includes(goal.id)
                return (
                  <div key={goal.id} className="border-l-4 border-[#0d631b] bg-[#f9f9f9] p-4 rounded-r-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow transition-shadow">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#0d631b] mt-0.5">{goal.icon}</span>
                      <div>
                        <h3 className="text-sm font-bold text-[#1a1c1c]">
                          {completed ? <s>{goal.title}</s> : goal.title}
                        </h3>
                        <p className="text-xs text-[#40493d] mt-0.5">{goal.sub}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleMarkDone(goal.id)}
                      disabled={completed}
                      className={`h-[36px] px-4 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center gap-2 ${completed ? 'bg-[#0d631b] text-white cursor-default' : 'bg-[#0d631b]/10 text-[#0d631b] hover:bg-[#0d631b] hover:text-white border border-[#0d631b]'}`}
                    >
                      {completed ? <><span className="material-symbols-outlined text-sm">check_circle</span> {t('dashboard.done')}</> : t('dashboard.mark_done')}
                    </button>
                  </div>
                )
              })
            )}
            
            {activeOrder ? (
              <div className="border-l-4 border-[#ffb957] bg-[#fffdf0] p-4 rounded-r-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
                <div>
                  <h3 className="text-sm font-bold text-[#1a1c1c]">{t('dashboard.order_status').replace('{status}', activeOrder.status).replace('{id}', activeOrder.orderId)}</h3>
                  <p className="text-xs text-[#40493d]">{t('dashboard.track_recent').replace('{product}', activeOrder.items?.[0]?.name || 'product')}</p>
                </div>
                <Link to={`/dashboard/tracking?id=${activeOrder.orderId}`}>
                  <button className="bg-[#ffb957] text-[#643f00] h-[48px] px-6 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors shrink-0 shadow-sm hover:opacity-90">{t('dashboard.track_order')}</button>
                </Link>
              </div>
            ) : (
              <div className="border-l-4 border-[#bfcaba] bg-[#f9f9f9] p-4 rounded-r-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
                <div>
                  <h3 className="text-sm font-bold text-[#1a1c1c]">{t('dashboard.no_active_orders')}</h3>
                  <p className="text-xs text-[#40493d]">{t('dashboard.shop_for')}</p>
                </div>
                <Link to="/dashboard/marketplace">
                  <button className="bg-[#e2e2e2] text-[#40493d] h-[48px] px-6 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors shrink-0 hover:bg-[#bfcaba]">{t('dashboard.shop_now')}</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* My Farm */}
        <div className="bg-white rounded-xl shadow-sm border border-[#bfcaba] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#bfcaba] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0d631b]">landscape</span>
              <h2 className="font-bold text-[#1a1c1c]">{t('dashboard.my_farm_title')}</h2>
            </div>
            <Link to="/dashboard/home" className="text-xs font-bold text-[#0d631b] hover:underline">{t('dashboard.manage')}</Link>
          </div>
          <div className="p-4">
            {plots.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="text-xl font-bold text-[#1a1c1c]">
                      {plots.reduce((sum, p) => sum + Number(p.acres || 0), 0)} {t('dashboard.acres')}
                    </div>
                    <div className="text-sm text-[#40493d]">
                      {plots.length} {plots.length === 1 ? t('dashboard.plot') : t('dashboard.plots')} • {translateCrop(plots[0]?.crop) || t('dashboard.mixed')}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-[#9cf49c] rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#19722b]">grass</span>
                  </div>
                </div>
                {latestSoilTest && latestSoilTest.results ? (
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <span className="text-sm text-[#40493d]">{t('dashboard.soil_health')} ({t('soil_types.' + latestSoilTest.soilType.toLowerCase().replace(/ /g, '_')) !== 'soil_types.' + latestSoilTest.soilType.toLowerCase().replace(/ /g, '_') ? t('soil_types.' + latestSoilTest.soilType.toLowerCase().replace(/ /g, '_')) : latestSoilTest.soilType})</span>
                      <span className="text-lg font-bold text-[#0d631b]">{latestSoilTest.results.score}/100</span>
                    </div>
                    <div className="w-full bg-[#e2e2e2] rounded-full h-2.5">
                      <div className="bg-[#0d631b] h-2.5 rounded-full" style={{ width: `${latestSoilTest.results.score}%` }}></div>
                    </div>
                    <p className="text-xs text-[#40493d] mt-2 text-right truncate" title={latestSoilTest.results.todaysAction}>
                      {latestSoilTest.results.todaysAction || 'Good condition.'}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-[#bfcaba] text-center">
                    <p className="text-sm text-[#40493d] mb-3">{t('dashboard.no_soil_report')}</p>
                    <Link to="/dashboard/soil-test">
                      <button className="border border-[#0d631b] text-[#0d631b] hover:bg-[#f0f6ec] px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                        {t('dashboard.upload_report')}
                      </button>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-4xl text-[#bfcaba] mb-2">landscape</span>
                <p className="text-sm text-[#40493d] mb-4">{t('dashboard.no_farms_added')}</p>
                <Link to="/dashboard/home">
                  <button className="bg-[#0d631b] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
                    {t('dashboard.add_farm')}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Weather Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#bfcaba] overflow-hidden relative">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0d631b 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          <div className="p-4 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-[#1a1c1c]">
                {t('dashboard.weather')} — {weatherData ? weatherData.city : (user?.district?.split(',')[0] || 'Guntur')}
              </h2>
              {weatherData?.seasonal && (
                <span className="inline-block bg-[#fff8e1] text-[#7a5c00] text-[10px] px-2 py-0.5 rounded font-semibold border border-[#ffe082]">⚡ Estimated</span>
              )}
              {weatherData && !weatherData.seasonal && (
                <span className="inline-block bg-[#cfe6c9] text-[#19722b] text-[10px] px-2 py-0.5 rounded font-semibold border border-[#0d631b]">🟢 Live</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              {/* Temp + icon */}
              <div className="flex items-center gap-2">
                {weatherData?.iconUrl ? (
                  <img src={weatherData.iconUrl} alt="Weather icon" className="w-14 h-14 drop-shadow-sm" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-[#0d631b]">
                    {weatherData?.description === 'Rain' ? 'rainy'
                      : weatherData?.description === 'Clear' ? 'sunny'
                      : weatherData?.description === 'Clouds' ? 'partly_cloudy_day'
                      : weatherData?.description === 'Mist' ? 'foggy'
                      : 'partly_cloudy_day'}
                  </span>
                )}
                <div>
                  <div className="text-3xl font-bold text-[#0d631b]">{weatherData ? `${weatherData.temp}°C` : '--°C'}</div>
                  <div className="text-xs text-[#40493d] capitalize">{weatherData?.detailedDesc || weatherData?.description || 'Loading...'}</div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-right">
                {weatherData?.feelsLike != null && (
                  <div className="col-span-2 text-xs text-[#707a6c]">Feels like <span className="font-bold text-[#1a1c1c]">{weatherData.feelsLike}°C</span></div>
                )}
                {weatherData?.humidity != null && (
                  <div className="text-xs text-[#707a6c]">💧 Humidity <span className="font-bold text-[#1a1c1c]">{weatherData.humidity}%</span></div>
                )}
                {weatherData?.wind != null && (
                  <div className="text-xs text-[#707a6c]">🌬️ Wind <span className="font-bold text-[#1a1c1c]">{weatherData.wind} km/h</span></div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-[#bfcaba]/40">
              {weatherData && !weatherData.seasonal && (
                <p className="text-[10px] text-[#707a6c] text-center">Live data from OpenWeatherMap</p>
              )}
              {weatherData?.seasonal && (
                <p className="text-[10px] text-[#707a6c] text-center">Showing estimated seasonal data. Live weather unavailable.</p>
              )}
              {!weatherData && (
                <p className="text-[10px] text-[#bfcaba] text-center">Fetching weather data...</p>
              )}
            </div>
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
