import { createContext, useContext, useState, useEffect } from 'react'
import en from '../locales/en.json'
import te from '../locales/te.json'

const LanguageContext = createContext()

const translations = {
  en,
  te
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLanguage') || 'en'
  })

  useEffect(() => {
    localStorage.setItem('appLanguage', language)
  }, [language])

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
