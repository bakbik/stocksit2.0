
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
    TrendingUp,
    TrendingDown,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Trash2,
    Edit2,
    Plus,
    BarChart3,

} from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

interface PortfolioClientProps {
    initialHoldings: any[]
}

export function PortfolioClient({ initialHoldings }: PortfolioClientProps) {
    const { t, dir, language } = useLanguage()
    const router = useRouter()
    const [holdings, setHoldings] = useState(initialHoldings)
    const [isLoading, setIsLoading] = useState(false)

    // Calculate Totals
    const totalInvested = holdings.reduce((sum, h) => sum + (h.quantity * h.buyPrice), 0)
    const currentValue = holdings.reduce((sum, h) => sum + (h.quantity * (h.stock.currentPrice || h.buyPrice)), 0)
    const totalReturn = currentValue - totalInvested
    const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

    // Calculate Daily Change
    const totalDailyChange = holdings.reduce((sum, h) => sum + (h.quantity * (h.stock.dailyChange || 0)), 0)
    const previousValue = currentValue - totalDailyChange
    const totalDailyChangePercent = previousValue > 0 ? (totalDailyChange / previousValue) * 100 : 0

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
            style: 'currency',
            currency: 'ILS',
            maximumFractionDigits: 0
        }).format(val)
    }

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', { maximumFractionDigits: 2 }).format(num)
    }

    const removeHolding = async (stockId: number) => {
        if (!confirm(language === 'he' ? 'האם אתה בטוח שברצונך להסיר מניה זו מהתיק?' : 'Are you sure you want to remove this stock?')) return

        setIsLoading(true)
        try {
            const res = await fetch('/api/portfolio/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stockId })
            })

            if (res.ok) {
                setHoldings(prev => prev.filter(h => h.stockId !== stockId))
                router.refresh()
            }
        } catch (error) {
            console.error('Failed to remove holding', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Summary Card */}
                <div className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] text-white">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600/25 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-600/15 blur-[100px] rounded-full animate-pulse" />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10">
                                    <PieChart className="w-6 h-6 text-indigo-400" />
                                </div>
                                <h1 className="text-2xl font-black tracking-tight">{language === 'he' ? 'תיק ההשקעות שלי' : 'My Portfolio'}</h1>
                            </div>
                            <div className="text-sm font-bold text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                {holdings.length} {language === 'he' ? 'נכסים' : 'Assets'}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">{language === 'he' ? 'שווי תיק כולל' : 'Total Portfolio Value'}</p>
                                <div className="text-5xl font-black tracking-tighter tabular-nums text-white">
                                    {formatCurrency(currentValue)}
                                </div>
                            </div>
                            <div className="flex flex-col items-end justify-end">
                                <div className={`flex items-center gap-2 text-2xl font-black tabular-nums ${totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {totalReturn >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                                    {formatCurrency(totalReturn)}
                                </div>
                                <div className={`text-sm font-bold opacity-80 ${totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {totalReturnPercent > 0 ? '+' : ''}{totalReturnPercent.toFixed(2)}% {language === 'he' ? 'תשואה כוללת' : 'Total Return'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Daily Change Summary */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-rose-50 p-2 rounded-xl">
                                <BarChart3 className="w-6 h-6 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{language === 'he' ? 'שינוי יומי' : 'Daily Change'}</h3>
                        </div>
                        <div className={`text-4xl font-black tracking-tight tabular-nums ${totalDailyChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatCurrency(totalDailyChange)}
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${totalDailyChange >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {totalDailyChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {formatNumber(Math.abs(totalDailyChangePercent))}%
                        </div>
                        <p className="text-slate-400 text-xs mt-2 font-medium">
                            {language === 'he' ? 'ביחס ליום המסחר הקודם' : 'Vs. previous close'}
                        </p>
                    </div>
                </div>

                {/* Quick Actions / Stats */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 flex flex-col justify-center items-center text-center space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-full mb-2">
                        <Plus className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">{language === 'he' ? 'הוסף נכס' : 'Add Asset'}</h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-[200px] mx-auto">
                            {language === 'he' ? 'חפש מניה והוסף אותה לתיק שלך דרך דף המניה' : 'Search for a stock and add it to your portfolio via the stock page'}
                        </p>
                    </div>
                    <Link href="/" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform active:scale-95">
                        {language === 'he' ? 'חפש מניות' : 'Browse Market'}
                    </Link>
                </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" dir={dir}>
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-6 py-4 text-start">{t('table.name')}</th>
                                <th className="px-6 py-4 text-end">{language === 'he' ? 'כמות' : 'Qty'}</th>
                                <th className="px-6 py-4 text-end">{language === 'he' ? 'מחיר קנייה' : 'Avg Price'}</th>
                                <th className="px-6 py-4 text-end">{t('table.price')}</th>
                                <th className="px-6 py-4 text-end">{language === 'he' ? 'שינוי יומי' : 'Daily'}</th>
                                <th className="px-6 py-4 text-end">{language === 'he' ? 'שווי שוק' : 'Value'}</th>
                                <th className="px-6 py-4 text-end">{language === 'he' ? 'רווח/הפסד' : 'Gain/Loss'}</th>
                                <th className="px-6 py-4 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {holdings.map((h) => {
                                const marketValue = h.quantity * (h.stock.currentPrice || 0)
                                const totalCost = h.quantity * h.buyPrice
                                const gainLoss = marketValue - totalCost
                                const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0
                                const isPos = gainLoss >= 0

                                return (
                                    <tr key={h.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/stock/${h.stock.symbol}`} className="flex flex-col">
                                                <span className="font-black text-slate-900 text-base">{h.stock.symbol}</span>
                                                <span className="text-xs text-slate-500 font-medium">{h.stock.name}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-end font-bold text-slate-600 tabular-nums">
                                            {formatNumber(h.quantity)}
                                        </td>
                                        <td className="px-6 py-4 text-end text-slate-500 tabular-nums">
                                            {formatNumber(h.buyPrice)}
                                        </td>
                                        <td className="px-6 py-4 text-end font-black text-slate-900 tabular-nums">
                                            {formatNumber(h.stock.currentPrice || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-end">
                                            <div className={`font-bold tabular-nums ${h.stock.dailyChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {h.stock.dailyChangePercent > 0 ? '+' : ''}{h.stock.dailyChangePercent ? h.stock.dailyChangePercent.toFixed(2) : '0.00'}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-end font-black text-slate-900 tabular-nums">
                                            {formatNumber(marketValue)}
                                        </td>
                                        <td className="px-6 py-4 text-end">
                                            <div className="flex flex-col items-end">
                                                <span className={`font-black tabular-nums flex items-center gap-1 ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                                    {formatNumber(Math.abs(gainLoss))}
                                                </span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isPos ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {isPos ? '+' : ''}{gainLossPercent.toFixed(2)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => removeHolding(h.stockId)}
                                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {holdings.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-20 text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="bg-slate-100 p-4 rounded-full mb-2">
                                                <BarChart3 className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-bold">{language === 'he' ? 'אין נכסים בתיק עדיין' : 'No assets in portfolio yet'}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    )
}
