"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, Language } from './translations'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => any
    dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en')
    const [mounted, setMounted] = useState(false)

    // Initialize from localStorage if available
    useEffect(() => {
        const saved = localStorage.getItem('language') as Language
        if (saved && (saved === 'en' || saved === 'he')) {
            setLanguage(saved)
        }
        setMounted(true)
    }, [])

    // Update localStorage and document direction when language changes
    useEffect(() => {
        if (!mounted) return
        localStorage.setItem('language', language)
        document.documentElement.lang = language
        document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr'
    }, [language, mounted])

    const t = (key: string) => {
        const keys = key.split('.')
        let current: any = translations[language]
        for (const k of keys) {
            if (current[k] === undefined) return key
            current = current[k]
        }
        return current
    }

    const dir = language === 'he' ? 'rtl' : 'ltr'

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
