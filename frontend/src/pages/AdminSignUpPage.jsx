import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import LocationInput from '../components/LocationInput'
import API_BASE from '../config/api'

export default function AdminSignUpPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t, language, setLanguage } = useLanguage()

  const [role, setRole] = useState('admin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    district: '',
    password: '',
    terms: false,
  })

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.terms) {
      setError('Please accept the Terms of Service to continue.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone.startsWith('+91') ? form.phone : `+91${form.phone}`,
          email: form.email,
          password: form.password,
          role,
          district: form.district,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Registration failed. Please try again.')
      } else {
        sessionStorage.setItem('greenkrt_token', data.token)
        login(data.user, data.token)
        navigate(data.user.role === 'admin' ? '/admin' : '/dashboard')
      }
    } catch {
      setError('Unable to connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f9f9f9] font-sans">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0A1F0C] p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#00C853 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10 flex items-center gap-2">
          <img src="/logo.jpeg" alt={t('auth.logo_alt')} className="w-8 h-8 rounded-full object-cover" />
          <span className="font-bold text-2xl text-white">{t('auth.brand_name')}</span>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold text-white leading-tight">{t('auth.start_journey')}<br />{t('auth.to_smarter')}</h2>
          <div className="space-y-4">
            {[
              { icon: 'check_circle', text: t('auth.features_0') },
              { icon: 'check_circle', text: t('auth.features_1') },
              { icon: 'check_circle', text: t('auth.features_2') },
              { icon: 'check_circle', text: t('auth.features_3') },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#00C853]">{item.icon}</span>
                <span className="text-white/80 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-white/40 text-sm">{t('auth.copyright')}</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        {/* Language Toggle */}
        <div className="absolute top-6 right-6 flex bg-[#e2e2e2] rounded-full p-1">
          {['en', 'te'].map((l) => (
            <button key={l} onClick={() => setLanguage(l)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors uppercase ${language === l ? 'bg-[#0d631b] text-white' : 'text-[#40493d] hover:text-[#0d631b]'}`}>{l === 'en' ? 'EN' : 'తె'}</button>
          ))}
        </div>

        <div className="lg:hidden flex items-center gap-2 mb-8">
          <img src="/logo.jpeg" alt={t('auth.logo_alt')} className="w-8 h-8 rounded-full object-cover" />
          <span className="font-bold text-2xl text-[#0d631b]">{t('auth.brand_name')}</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 text-center rounded-lg flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-4xl">admin_panel_settings</span>
            <strong className="text-xl">Admin Registration</strong>
            <p className="text-sm">Create an internal staff account</p>
          </div>
          <h1 className="text-3xl font-bold text-[#1a1c1c] mb-2">Create Admin Account</h1>
          <p className="text-[#40493d] mb-6">Join the internal team.</p>

          {/* Role selection removed, defaults to farmer */}

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1a1c1c] mb-1.5">{t('auth.fname')} *</label>
                <input
                  value={form.firstName} onChange={set('firstName')}
                  placeholder="First Name" required
                  className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1a1c1c] mb-1.5">{t('auth.lname')} *</label>
                <input
                  value={form.lastName} onChange={set('lastName')}
                  placeholder="Last Name" required
                  className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1.5">{t('auth.phone')} *</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-white border border-[#bfcaba] rounded-lg">
                  <span className="text-sm font-semibold text-[#40493d]">+91</span>
                </div>
                <input
                  value={form.phone} onChange={set('phone')}
                  placeholder="XXXXX XXXXX" required
                  className="flex-1 h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1.5">{t('auth.email')} (Optional)</label>
              <input
                type="email" value={form.email} onChange={set('email')}
                placeholder="farmer@example.com"
                className="w-full h-[48px] px-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white"
              />
            </div>

            {role === 'farmer' && (
              <div>
                <label className="block text-xs font-semibold text-[#1a1c1c] mb-1.5">District / State</label>
                <LocationInput
                  value={form.district}
                  onChange={(val) => setForm(prev => ({ ...prev, district: val }))}
                  placeholder="e.g. Guntur"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1.5">{t('auth.password')} *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Min. 6 characters" required
                  className="w-full h-[48px] px-4 pr-12 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] bg-white"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#40493d] hover:text-[#0d631b]">
                  <span className="material-symbols-outlined">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" checked={form.terms} onChange={set('terms')} className="mt-1 w-4 h-4 accent-[#0d631b]" />
              <label htmlFor="terms" className="text-xs text-[#40493d]">
                I agree to the <a href="#" className="text-[#0d631b] font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-[#0d631b] font-semibold hover:underline">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full h-[52px] bg-[#0d631b] hover:bg-[#0d631b]/90 text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> Creating account…</>
                : t('auth.signup_btn')}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-[#40493d]">
            {t('auth.already_have')}{' '}
            <Link to="/admin-login" className="text-blue-600 font-semibold hover:underline">{t('auth.signin_here')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
