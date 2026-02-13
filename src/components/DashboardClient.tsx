"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { StarButton } from '@/components/StarButton'
import Link from 'next/link'
import { ChevronDown, BarChart3, TrendingUp, TrendingDown, Bell, Star, Calendar } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { calculateInvestmentMetrics } from '@/lib/investment_logic'
import { NotificationTab } from '@/components/NotificationTab'

interface DashboardClientProps {
    stocks: any[]
    groups: any[]
    group?: string
    sortBy: string
    sortOrder: string
    buyable?: boolean
    latestOnly?: boolean
    view?: string
}

export function DashboardClient({ stocks, groups, group, sortBy, sortOrder, buyable, latestOnly, view }: DashboardClientProps) {
    const { t, dir, language } = useLanguage()
    const router = useRouter()
    const [unreadCount, setUnreadCount] = useState(0)
    const basePath = view === 'watchlist' ? '/watchlist' : '/'

    useEffect(() => {
        const fetchUnread = async () => {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setUnreadCount(data.filter((n: any) => !n.isRead).length)
            }
        }
        fetchUnread()
        const interval = setInterval(fetchUnread, 60000)
        return () => clearInterval(interval)
    }, [])

    const getReturn = (stock: any, period: string) => {
        const ret = stock.returns.find((r: any) => r.period === period)
        return ret ? ret.value : null
    }

    const formatNumber = (num: number | null) => {
        if (num === null || num === undefined) return '-'
        return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', { maximumFractionDigits: 2 }).format(num)
    }

    const formatMillions = (num: number | null) => {
        if (num === null || num === undefined) return '-'
        const suffix = language === 'he' ? (num >= 1000000000 ? 'מיליארד' : 'מיליון') : (num >= 1000000000 ? 'B' : 'M')
        const divisor = num >= 1000000000 ? 1000000000 : 1000000
        return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', { maximumFractionDigits: 1 }).format(num / divisor) + (language === 'he' ? ' ' + suffix : suffix)
    }

    const SortHeader = ({ field, label, align = 'left', className = '' }: { field: string, label: string, align?: 'left' | 'right' | 'center', className?: string }) => {
        const isSorted = sortBy === field
        const nextOrder = isSorted && sortOrder === 'desc' ? 'asc' : 'desc'

        const params = new URLSearchParams()
        if (group) params.set('group', group)
        params.set('sortBy', field)
        params.set('sortOrder', nextOrder)
        if (buyable) params.set('buyable', 'true')
        if (latestOnly) params.set('latestOnly', 'true')

        return (
            <th className={`px-4 py-2 font-medium cursor-pointer transition-colors ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
                <Link href={`${basePath}?${params.toString()}`} className={`flex items-center gap-1 group/header ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    <span className={isSorted ? 'text-indigo-600 font-bold' : ''}>{label}</span>
                    <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isSorted ? 'opacity-100 text-indigo-600' : 'opacity-0 group-hover/header:opacity-50 text-slate-400'} ${isSorted && sortOrder === 'asc' ? 'rotate-180' : ''}`}
                    />
                </Link>
            </th>
        )
    }

    const isNotificationsView = view === 'notifications'

    return (
        <div className="space-y-10 pb-20">
            {/* Premium Header Card */}
            <header className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-10 py-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600/25 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-600/15 blur-[100px] rounded-full animate-pulse" />

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 mb-4 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Live Market Feed</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight leading-none mb-2 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                            {view === 'watchlist' ? (language === 'he' ? 'רשימת המעקב שלך' : 'Your Watchlist') : t('dashboard')}
                        </h1>
                        <p className="text-slate-400 font-medium text-lg max-w-xl animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
                            {view === 'watchlist'
                                ? (language === 'he' ? 'המניות שבחרת לעקוב אחריהן' : 'Stocks you are currently tracking for potential opportunities')
                                : t('dashboardSub')
                            }
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="text-[11px] font-black text-slate-500 bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-indigo-400" />
                            {t('lastUpdated')}: {format(new Date(), 'HH:mm:ss')}
                        </div>
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700 opacity-50" />
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                +12
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation & Controls */}
            <div className="flex flex-wrap items-center gap-3">
                {!isNotificationsView ? (
                    <>
                        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                            <Link
                                href={`${basePath}${(() => {
                                    const p = new URLSearchParams()
                                    if (buyable) p.set('buyable', 'true')
                                    if (latestOnly) p.set('latestOnly', 'true')
                                    const s = p.toString()
                                    return s ? `?${s}` : ''
                                })()}`}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${!group ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                {t('allStocks')}
                            </Link>
                            {groups.map((g: any) => (
                                <Link
                                    key={g.id}
                                    href={`${basePath}${(() => {
                                        const p = new URLSearchParams()
                                        p.set('group', g.name)
                                        if (buyable) p.set('buyable', 'true')
                                        if (latestOnly) p.set('latestOnly', 'true')
                                        return `?${p.toString()}`
                                    })()}`}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${group === g.name ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    {g.name} <span className="opacity-60 text-[10px] ml-0.5">({g._count?.stocks || 0})</span>
                                </Link>
                            ))}
                        </div>
                        <div className="flex-1" />
                        <Link
                            href={`${basePath}?${(() => {
                                const p = new URLSearchParams()
                                if (group) p.set('group', group)
                                if (sortBy) p.set('sortBy', sortBy)
                                if (sortOrder) p.set('sortOrder', sortOrder)
                                if (latestOnly) p.set('latestOnly', 'true')
                                if (!buyable) p.set('buyable', 'true')
                                return p.toString()
                            })()}`}
                            className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-3 active-press border-2 ${buyable
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-500/20'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
                                }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            {language === 'he' ? 'מומלצי קנייה' : 'BUYABLE ONLY'}
                        </Link>

                        <Link
                            href={`${basePath}?${(() => {
                                const p = new URLSearchParams()
                                if (group) p.set('group', group)
                                if (sortBy) p.set('sortBy', sortBy)
                                if (sortOrder) p.set('sortOrder', sortOrder)
                                if (buyable) p.set('buyable', 'true')
                                if (!latestOnly) p.set('latestOnly', 'true')
                                return p.toString()
                            })()}`}
                            className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-3 active-press border-2 ${latestOnly
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                            {language === 'he' ? 'דוחות אחרונים' : 'LATEST REPORTS'}
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            href="/"
                            className="px-5 py-2.5 rounded-2xl text-xs font-black bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 flex items-center gap-2 active-press shadow-sm"
                        >
                            <ChevronDown className="w-4 h-4 rotate-90" />
                            {language === 'he' ? 'חזור לדאשבורד' : 'BACK TO DASHBOARD'}
                        </Link>
                        <div className="flex-1" />
                    </>
                )}

                <Link
                    href={isNotificationsView ? '/' : '/?view=notifications'}
                    className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-3 relative border-2 active-press ${isNotificationsView
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-500 hover:text-indigo-600'
                        }`}
                >
                    <Bell className="w-4 h-4" />
                    {language === 'he' ? 'התראות' : 'NOTIFICATIONS'}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-slate-50 animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </Link>
            </div>

            {/* Main Content Area */}
            {isNotificationsView ? (
                <NotificationTab />
            ) : (
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden premium-shadow animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <div className="overflow-x-auto">
                        <table className="w-full financial-table" dir={dir}>
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="w-16 text-center"></th>
                                    <SortHeader field="symbol" label={t('table.symbol')} align="left" className="pl-6" />
                                    <SortHeader field="name" label={t('table.name')} align="left" className="min-w-[240px]" />
                                    <SortHeader field="potential" label={t('table.potential')} align="right" className="!text-indigo-600 bg-indigo-50/10" />
                                    <SortHeader field="currentPrice" label={t('table.price')} align="right" />
                                    <SortHeader field="latestReport" label={t('table.report')} align="right" />
                                    <SortHeader field="marketCap" label={t('table.mktCap')} align="right" />
                                    <SortHeader field="3m" label={t('table.ret3m')} align="right" />
                                    <SortHeader field="12m" label={t('table.ret1y')} align="right" />
                                    <SortHeader field="peValue" label="P/E" align="right" />
                                    <SortHeader field="peType" label="SOURCE" align="center" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stocks.map((stock) => {
                                    const ret3m = getReturn(stock, '3m')
                                    const ret12m = getReturn(stock, '12m')

                                    const formatReturn = (val: number | null) => {
                                        if (val === null) return <span className="text-slate-300">-</span>
                                        const isPos = val > 0
                                        return (
                                            <div className={`inline-flex items-center gap-1 font-black tabular-nums transition-transform group-hover:scale-105 ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                                {Math.abs(val).toFixed(1)}%
                                            </div>
                                        )
                                    }

                                    return (
                                        <tr
                                            key={stock.id}
                                            className="group cursor-pointer"
                                            onClick={() => router.push(`/stock/${encodeURIComponent(stock.symbol)}`)}
                                        >
                                            <td className="text-center group-hover:bg-slate-50/80">
                                                <StarButton stockId={stock.id} isStarred={stock.watchlists.length > 0} />
                                            </td>
                                            <td className="font-black text-slate-900 tracking-tight group-hover:bg-slate-50/80">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors" />
                                                    {stock.symbol}
                                                </div>
                                            </td>
                                            <td className="group-hover:bg-slate-50/80">
                                                <div className="flex items-center gap-3">
                                                    <Link href={`/stock/${encodeURIComponent(stock.symbol)}`} className="font-black text-slate-700 hover:text-indigo-600 transition-all whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px]">
                                                        {stock.name}
                                                    </Link>
                                                    {stock.metrics?.verdict === 'buy' && (
                                                        <div className="flex items-center gap-1 bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active-press">
                                                            <TrendingUp className="w-2.5 h-2.5" />
                                                            {language === 'he' ? 'קנייה' : 'BUY'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-1.5 mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {stock.groups.map((g: any) => (
                                                        <span key={g.id} className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter border border-slate-200/50">
                                                            {g.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="text-right group-hover:bg-indigo-50/30">
                                                <div className={`font-black font-mono text-sm tabular-nums ${(stock.metrics?.potential || 0) > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                    {stock.metrics && stock.metrics.potential !== null ? (
                                                        <span className="flex items-center justify-end gap-1">
                                                            {(stock.metrics.potential * 100).toFixed(1)}%
                                                            {(stock.metrics.potential > 0) && <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />}
                                                        </span>
                                                    ) : '-'}
                                                </div>
                                            </td>
                                            <td className="text-right font-black text-slate-900 tabular-nums font-mono group-hover:bg-slate-50/80">
                                                {formatNumber(stock.currentPrice)}
                                            </td>
                                            <td className="text-right group-hover:bg-slate-50/80">
                                                {stock.latestFin?.publishedAt ? (
                                                    <div className="flex flex-col items-end">
                                                        <div className="font-black text-slate-700 text-[11px]">
                                                            {format(new Date(stock.latestFin.publishedAt), 'dd/MM/yyyy')}
                                                        </div>
                                                        <div className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">
                                                            {stock.latestFin?.period}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="font-black text-slate-400">{stock.latestFin?.period || '-'}</div>
                                                )}
                                            </td>
                                            <td className="text-right text-slate-600 font-bold tabular-nums group-hover:bg-slate-50/80">
                                                {formatMillions(stock.marketCap)}
                                            </td>
                                            <td className="text-right group-hover:bg-slate-50/80">
                                                {formatReturn(ret3m)}
                                            </td>
                                            <td className="text-right group-hover:bg-slate-50/80">
                                                {formatReturn(ret12m)}
                                            </td>
                                            <td className="text-right group-hover:bg-slate-50/80">
                                                <div className={`font-black font-mono text-sm tabular-nums ${(stock.metrics?.peValue || 0) < 15 && stock.metrics?.peValue !== null ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                    {stock.metrics?.peValue ? stock.metrics.peValue.toFixed(1) : '-'}
                                                </div>
                                            </td>
                                            <td className="text-center group-hover:bg-slate-50/80">
                                                <div className="flex justify-center">
                                                    {stock.metrics?.peType === 'reported' && (
                                                        <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest border border-slate-200">
                                                            {language === 'he' ? 'דיווח' : 'REPORTED'}
                                                        </span>
                                                    )}
                                                    {stock.metrics?.peType === 'calculated' && (
                                                        <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest border border-amber-200">
                                                            {language === 'he' ? 'מחושב' : 'CALCULATED'}
                                                        </span>
                                                    )}
                                                    {stock.metrics?.peType === 'estimated' && (
                                                        <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-widest border border-rose-200">
                                                            {language === 'he' ? 'משוער' : 'ESTIMATED'}
                                                        </span>
                                                    )}
                                                    {!stock.metrics?.peType && <span className="text-slate-300">—</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            {stocks.length === 0 && (
                                <tbody>
                                    <tr>
                                        <td colSpan={11} className="px-6 py-40 text-center">
                                            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700">
                                                <div className="p-6 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                                    <Star className={`w-12 h-12 ${view === 'watchlist' ? 'text-amber-300 animate-bounce' : 'text-slate-200'}`} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-slate-900 font-black text-xl tracking-tight">
                                                        {view === 'watchlist'
                                                            ? (language === 'he' ? 'רשימת המעקב שלך ריקה' : 'Your watchlist is empty')
                                                            : t('table.noResults')
                                                        }
                                                    </p>
                                                    <p className="text-slate-400 text-sm font-medium">
                                                        {view === 'watchlist'
                                                            ? (language === 'he' ? 'הוסף מניות על ידי לחיצה על הכוכב' : 'Start tracking stocks by clicking the star icon')
                                                            : 'Try adjusting your filters or search query'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
