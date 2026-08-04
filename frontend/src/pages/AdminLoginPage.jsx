import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import API_BASE from '../config/api'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [showPass, setShowPass] = useState(false)
  const role = 'admin' // Hardcoded for this page
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shouldSignUp, setShouldSignUp] = useState(false)

  const googleLogin = useGoogleLogin({
    onSuccess: async () => {},
    onError: () => setError('Google Login Disabled for Admin'),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Login failed. Please check your credentials.')
        setShouldSignUp(data.shouldSignUp || false)
      } else {
        // Store token separately
        sessionStorage.setItem('greenkrt_token', data.token)
        // Save full user object (includes firstName, lastName, email, role, etc.)
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
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <img src="/logo.jpeg" alt={t('auth.logo_alt')} className="w-8 h-8 rounded-full object-cover" />
            <span className="font-bold text-2xl text-white">{t('auth.brand_name')}</span>
          </div>
        </div>
        <div className="relative z-10">
          <blockquote className="text-3xl font-bold text-white leading-tight mb-6" style={{fontFamily:'Lora,serif'}}>
            <span className="italic text-[#00C853]">{t('auth.quote_part1')}</span><br/>
            {t('auth.quote_part2')}<br/>{t('auth.quote_part3')}
          </blockquote>
          <p className="text-white/60 text-lg">{t('auth.join_msg')}</p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: '12k+', label: 'Active Farmers' },
            { value: '3.4k+', label: 'Drone Services' },
            { value: '98%', label: 'Satisfaction Rate' },
          ].map(stat => (
            <div key={stat.label} className="glass-panel p-4 rounded-xl">
              <div className="text-[#00C853] font-bold text-xl">{stat.value}</div>
              <div className="text-white/60 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-16">
        {/* Language Toggle */}
        <div className="absolute top-6 right-6 flex bg-[#e2e2e2] rounded-full p-1">
          {[{ code: 'en', label: 'EN' }, { code: 'te', label: 'తె' }].map((l) => (
            <button key={l.code} onClick={() => setLanguage(l.code)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${language === l.code ? 'bg-[#0d631b] text-white' : 'text-[#40493d] hover:text-[#0d631b]'}`}>{l.label}</button>
          ))}
        </div>

        {/* Mobile Brand */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <img src="/logo.jpeg" alt={t('auth.logo_alt')} className="w-8 h-8 rounded-full object-cover" />
          <span className="font-bold text-2xl text-[#0d631b]">{t('auth.brand_name')}</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 text-center rounded-lg flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-4xl">admin_panel_settings</span>
            <strong className="text-xl">Admin Portal</strong>
            <p className="text-sm">Authorized Personnel Only</p>
          </div>
          
          <h1 className="text-3xl font-bold text-[#1a1c1c] mb-2">Admin Login</h1>
          <p className="text-[#40493d] mb-6">Enter your credentials to access the admin dashboard.</p>



          {error && !shouldSignUp && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          {shouldSignUp && (
            <div className="mb-6 p-4 bg-[#f3fcef] border border-[#9cf49c] rounded-xl text-center">
              <span className="material-symbols-outlined text-[#0d631b] text-3xl mb-2">person_add</span>
              <h3 className="font-bold text-[#1a1c1c] mb-1">Account not found</h3>
              <p className="text-sm text-[#40493d] mb-4">{error}</p>
              <Link to="/signup">
                <button className="px-6 py-2 bg-[#0d631b] text-white text-sm font-bold rounded-lg hover:bg-[#0a4f15] transition-colors shadow-sm">
                  Create an Account
                </button>
              </Link>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">Phone Number</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#40493d]">phone_iphone</span>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="+91 XXXXX XXXXX (or email)"
                  required
                  className="w-full h-[52px] pl-12 pr-4 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] focus:ring-2 focus:ring-[#0d631b]/20 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1a1c1c] mb-2">{t('auth.password')}</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#40493d]">lock</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-[52px] pl-12 pr-12 border border-[#bfcaba] rounded-lg text-sm focus:outline-none focus:border-[#0d631b] focus:ring-2 focus:ring-[#0d631b]/20 bg-white"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#40493d] hover:text-[#0d631b]">
                  <span className="material-symbols-outlined">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <a href="#" className="text-sm text-[#0d631b] font-semibold hover:underline">Forgot Password?</a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-[#0d631b] hover:bg-[#0d631b]/90 text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> Signing in…</> : t('auth.login_btn')}
            </button>

          </form>

          <p className="text-center mt-8 text-sm text-[#40493d]">
            Don't have an admin account?{' '}
            <Link to="/admin-signup" className="text-blue-600 font-semibold hover:underline">Create one</Link>
          </p>

          <div className="mt-12 text-center">
            <Link to="/login" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Return to Farmer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
