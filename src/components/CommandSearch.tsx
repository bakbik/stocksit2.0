'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Command } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

export function CommandSearch() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const router = useRouter()
    const searchRef = useRef<HTMLDivElement>(null)
    const { t, dir, language } = useLanguage()

    // Real search API call
    useEffect(() => {
        const fetchResults = async () => {
            if (query.length > 1) {
                try {
                    const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
                    const data = await res.json()
                    setResults(Array.isArray(data) ? data : [])
                } catch (error) {
                    console.error('Search error:', error)
                    setResults([])
                }
            } else {
                setResults([])
            }
        }

        const timer = setTimeout(fetchResults, 200)
        return () => clearTimeout(timer)
    }, [query])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setIsOpen(true)
            }
            if (e.key === 'Escape') {
                setIsOpen(false)
            }
        }

        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('mousedown', handleClickOutside)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div className="relative w-full max-w-sm" ref={searchRef}>
            <div className="relative group">
                <Search className={`absolute ${dir === 'ltr' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-600 transition-colors`} />
                <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    className={`w-full bg-slate-200 border border-slate-300 rounded-xl py-2 ${dir === 'ltr' ? 'pl-10 pr-10' : 'pr-10 pl-10'} text-sm font-black text-black focus:ring-2 focus:ring-indigo-600/30 focus:bg-white transition-all outline-none placeholder:text-slate-600`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                />
                <div className={`absolute ${dir === 'ltr' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 border border-slate-300 rounded text-[10px] text-slate-600 bg-white font-bold`}>
                    <Command className="w-2.5 h-2.5" /> K
                </div>
            </div>

            {isOpen && query.length > 1 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="py-2">
                        {results.length > 0 ? results.map((res) => (
                            <button
                                key={res.symbol}
                                onClick={() => {
                                    router.push(`/stock/${encodeURIComponent(res.symbol)}`)
                                    setIsOpen(false)
                                    setQuery('')
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between group transition-colors border-b border-slate-50 last:border-0"
                                dir={dir}
                            >
                                <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                                    <div className="font-black text-black group-hover:text-indigo-800 transition-colors">{res.symbol}</div>
                                    <div className="text-xs text-slate-800 font-black">{res.name}</div>
                                </div>
                                <div className="text-[10px] bg-slate-100 px-2 py-1 rounded text-indigo-600 font-bold uppercase tracking-tight opacity-0 group-hover:opacity-100 transition-opacity">
                                    {language === 'he' ? 'צפה' : 'View'}
                                </div>
                            </button>
                        )) : (
                            <div className="px-4 py-8 text-center text-slate-500 font-medium">
                                {language === 'he' ? 'לא נמצאו תוצאות' : 'No results found'}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
