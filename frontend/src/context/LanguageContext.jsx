import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import en from '../locales/en.json'
import te from '../locales/te.json'

const LanguageContext = createContext()

const translations = {
  en,
  te
}

export function LanguageProvider({ children }) {
  const { user } = useAuth()

  // Initialize language preference synchronously from localStorage
  const [language, setLanguageState] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem('greenkrt_user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        const uid = parsed.id || parsed._id
        if (uid) {
          const userLang = localStorage.getItem(`appLanguage_${uid}`)
          if (userLang) return userLang
        }
      }
    } catch (e) {
      console.error('Error reading language from sessionStorage:', e)
    }
    return localStorage.getItem('appLanguage') || 'en'
  })

  // Set language and update matching storage keys synchronously
  const setLanguage = (newLang) => {
    setLanguageState(newLang)
    localStorage.setItem('appLanguage', newLang)
    try {
      const storedUser = sessionStorage.getItem('greenkrt_user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        const uid = parsed.id || parsed._id
        if (uid) {
          localStorage.setItem(`appLanguage_${uid}`, newLang)
        }
      }
    } catch (e) {
      console.error('Error saving user language preference:', e)
    }
  }

  // Load language preference dynamically when user state transitions
  useEffect(() => {
    if (user && (user.id || user._id)) {
      const uid = user.id || user._id
      const userLang = localStorage.getItem(`appLanguage_${uid}`)
      if (userLang) {
        setLanguageState(userLang)
      }
    } else if (!sessionStorage.getItem('greenkrt_token')) {
      // Restore guest/device default language if explicitly logged out
      setLanguageState(localStorage.getItem('appLanguage') || 'en')
    }
  }, [user])

  // Simple nested key resolver: "nav.home" -> translations[lang].nav.home
  const t = (key) => {
    if (!key || typeof key !== 'string') return ''
    const keys = key.split('.')
    let value = translations[language]
    for (const k of keys) {
      if (value === undefined) return key // fallback to key
      value = value[k]
    }
    return value || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
