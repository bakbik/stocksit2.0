"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Star,
    Newspaper,
    BarChart3,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    Languages
} from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

export function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { language, setLanguage, t, dir } = useLanguage()

    const navItems = [
        { name: t('sidebar.marketOverview'), href: '/', icon: LayoutDashboard },
        { name: t('sidebar.watchlist'), href: '/watchlist', icon: Star },
        { name: t('sidebar.news'), href: '/news', icon: Newspaper },
        { name: t('sidebar.portfolio'), href: '/portfolio', icon: BarChart3 },
        { name: t('sidebar.sectors'), href: '/sectors', icon: TrendingUp },
    ]

    return (
        <aside className={`fixed ${dir === 'ltr' ? 'left-0' : 'right-0'} top-0 h-screen glass-dark text-slate-100 transition-all duration-500 z-50 flex flex-col shadow-2xl ${isCollapsed ? 'w-20' : 'w-72'}`}>
            {/* Brand */}
            <div className="p-8 flex items-center gap-4 overflow-hidden border-b border-white/5 bg-white/5 mb-4">
                <div className="bg-indigo-500 p-2.5 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] active-press">
                    <CircleDollarSign className="w-6 h-6 text-white" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="font-black text-xl text-white tracking-tighter uppercase">{language === 'he' ? 'BM פורטפוליו' : 'BM Portfolio'}</span>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest -mt-1">{t('sidebar.marketOverview')}</span>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-1.5 scrollbar-hide overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${isActive
                                ? 'bg-white/10 text-white font-black shadow-lg shadow-black/20'
                                : 'hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 transition-all duration-300 ${isActive ? 'text-indigo-400 scale-110' : 'text-slate-500 group-hover:text-slate-100'}`} />
                            {!isCollapsed && <span className="whitespace-nowrap font-medium tracking-tight text-sm">{item.name}</span>}

                            {isActive && (
                                <div className={`absolute ${dir === 'ltr' ? '-left-1' : '-right-1'} top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]`} />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer Actions */}
            <div className="px-4 py-6 space-y-2 border-t border-white/5">
                <button
                    onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 hover:text-white transition-all group active-press"
                >
                    <Languages className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    {!isCollapsed && (
                        <span className="whitespace-nowrap font-bold text-sm tracking-tight">
                            {language === 'en' ? 'עברית' : 'English'}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group active-press text-slate-500 hover:text-white"
                >
                    <div className="shrink-0">
                        {isCollapsed ? (dir === 'ltr' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />) : (dir === 'ltr' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)}
                    </div>
                    {!isCollapsed && <span className="text-sm font-bold tracking-tight uppercase">{t('sidebar.collapse')}</span>}
                </button>
            </div>
        </aside>
    )
}
