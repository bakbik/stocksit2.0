"use client"

import { useState } from 'react'
import { FinancialChart } from '@/components/FinancialChart'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Newspaper, BarChart3, Info, ExternalLink } from 'lucide-react'
import { StarButton } from '@/components/StarButton'
import { AddToPortfolio } from '@/components/AddToPortfolio'
import { format, formatDistanceToNow } from 'date-fns'
import { useLanguage } from '@/lib/LanguageContext'
import { calculateInvestmentMetrics } from '@/lib/investment_logic'

interface StockDetailClientProps {
    stock: any
    news: any[]
    tab: string
    rawSymbol: string
    sortedFinancials: any[]
}

export function StockDetailClient({ stock, news, tab, rawSymbol, sortedFinancials }: StockDetailClientProps) {
    const { t, dir, language } = useLanguage()
    const [chartPeriod, setChartPeriod] = useState<'quarterly' | 'yearly'>('quarterly')

    const tabs = [
        { id: 'overview', label: t('stockDetail.tabs.overview'), icon: Info },
        { id: 'financials', label: t('stockDetail.tabs.financials'), icon: BarChart3 },
        { id: 'news', label: t('stockDetail.tabs.news'), icon: Newspaper },
    ]

    if (stock.symbol.endsWith('.TA')) {
        tabs.splice(1, 0, { id: 'invest', label: language === 'he' ? 'ניתוח השקעה' : 'Investment Analysis', icon: TrendingUp })
    }

    const quarterlyData = sortedFinancials.filter(f => f.period.startsWith('Q'))
    const yearlyData = sortedFinancials.filter(f => f.period.startsWith('Y'))

    const metrics = calculateInvestmentMetrics(stock, sortedFinancials)

    const formatMillions = (num: number | null) => {
        if (num === null || num === undefined) return '-'
        const suffix = language === 'he' ? (num >= 1000000000 ? 'מיליארד' : 'מיליון') : (num >= 1000000000 ? 'B' : 'M')
        const divisor = num >= 1000000000 ? 1000000000 : 1000000
        return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', { maximumFractionDigits: 1 }).format(num / divisor) + (language === 'he' ? ' ' + suffix : suffix)
    }

    return (
        <div className="space-y-8 pb-20" dir={dir}>
            {/* Premium Stock Header */}
            <header className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-10 py-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full" />

                <div className="relative">
                    <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-indigo-400 transition-all uppercase tracking-[0.2em] mb-4 group">
                        <ArrowLeft className={`w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 ${dir === 'ltr' ? '' : 'rotate-180'}`} />
                        {t('stockDetail.back')}
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl relative group/logo">
                                <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-xl group-hover/logo:bg-indigo-500/20 transition-all" />
                                <span className="text-2xl font-black text-indigo-400 relative">{(stock.symbol || '').slice(0, 2)}</span>
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-2 animate-in fade-in slide-in-from-left-4 duration-500">
                                    {stock.name}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[11px] bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/20 font-black tracking-widest uppercase">
                                        {stock.symbol}
                                    </span>
                                    <div className="flex gap-1.5">
                                        {stock.groups.map((g: any) => (
                                            <span key={g.id} className="text-[9px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest border border-white/5">
                                                {g.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-sm font-black text-slate-500 uppercase tracking-widest">{t('stockDetail.currPrice')}</div>
                            <div className="text-5xl font-black text-white tabular-nums tracking-tighter shadow-indigo-500/20">
                                {stock.currentPrice ? stock.currentPrice.toLocaleString() : '-'}
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                                <StarButton stockId={stock.id} isStarred={stock.watchlists.length > 0} />
                                <AddToPortfolio stockId={stock.id} currentPrice={stock.currentPrice} symbol={stock.symbol} />
                                <button className="bg-white text-slate-950 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all active-press shadow-xl">
                                    {t('stockDetail.addAlert')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1.5 bg-white p-1.5 rounded-[1.5rem] shadow-sm border border-slate-200 w-fit">
                {tabs.map((tItem) => {
                    const isActive = tab === tItem.id
                    return (
                        <Link
                            key={tItem.id}
                            href={`/stock/${rawSymbol}?tab=${tItem.id}`}
                            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <tItem.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            {tItem.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {tab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-black text-black flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                                        {t('stockDetail.stats.trends')}
                                    </h2>
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setChartPeriod('quarterly')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartPeriod === 'quarterly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {language === 'he' ? 'רבעוני' : 'Quarterly'}
                                        </button>
                                        <button
                                            onClick={() => setChartPeriod('yearly')}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartPeriod === 'yearly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {language === 'he' ? 'שנתי' : 'Yearly'}
                                        </button>
                                    </div>
                                </div>
                                <div className="h-[400px]">
                                    <FinancialChart data={chartPeriod === 'quarterly' ? quarterlyData : yearlyData} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">{t('stockDetail.stats.title')}</h2>
                                <div className="space-y-4">
                                    <StatRow label={t('table.mktCap')} value={stock.marketCap ? formatMillions(stock.marketCap) : '-'} />
                                    <StatRow label={t('table.pe')} value={stock.peRatio?.toFixed(2) || '-'} />
                                    <StatRow label={t('table.roe')} value={stock.roe ? `${stock.roe.toFixed(2)}%` : '-'} />
                                    <StatRow label={t('stockDetail.stats.lastUpdated')} value={stock.lastUpdated ? formatDistanceToNow(new Date(stock.lastUpdated), { addSuffix: true }) : '-'} />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('stockDetail.stats.performance')}</h2>
                                <div className="space-y-4">
                                    {stock.returns.map((r: any) => (
                                        <div key={r.period} className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500 uppercase font-mono">{r.period}</span>
                                            <div className={`flex items-center gap-1 font-bold ${r.value > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {r.value > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                {Math.abs(r.value).toFixed(1)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'invest' && metrics && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                label={language === 'he' ? 'רווח גלום (מחיר)' : 'Implied Profit (Price)'}
                                value={formatMillions(metrics.impliedProfit)}
                                tooltip={language === 'he' ? 'שווי שוק חלקי מכפיל הרווח' : 'Market Cap / PE Ratio'}
                            />
                            <MetricCard
                                label={language === 'he' ? 'רווח 4 רבעונים' : '4-Quarter Actual Profit'}
                                value={formatMillions(metrics.last4QProfit)}
                                tooltip={language === 'he' ? 'סכום הרווח הנקי של 4 הרבעונים האחרונים המדווחים' : 'Sum of Net Profit: Last 4 reported quarters'}
                            />
                            <MetricCard
                                label={language === 'he' ? `רווח שנתי צפוי (${metrics.latestPeriod.split('/')[1]})` : `Expected Annual Profit (${metrics.latestPeriod.split('/')[1]})`}
                                value={formatMillions(metrics.expectedAnnualProfit)}
                                tooltip={language === 'he' ? 'ממוצע רבעוני שנתי כפול 4' : 'Calendar year quarterly average * 4'}
                            />
                            <MetricCard
                                label={language === 'he' ? 'פוטנציאל השקעה' : 'Investment Potential'}
                                value={`${(metrics.potential! * 100).toFixed(1)}%`}
                                status={metrics.potential! > 0 ? 'good' : 'bad'}
                                tooltip={language === 'he' ? 'רווח צפוי חלקי רווח גלום, פחות 1' : 'Expected Profit / Implied Profit - 1'}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-black text-black mb-6">{language === 'he' ? 'בדיקת תנאי השקעה' : 'Investment Criteria Checklist'}</h3>
                                <div className="space-y-4">
                                    <CheckRow
                                        label={language === 'he' ? 'מכפיל רווח בין 2 ל-40' : 'P/E Ratio between 2-40'}
                                        value={stock.peRatio?.toFixed(2)}
                                        isValid={metrics.isPEValid}
                                    />
                                    <CheckRow
                                        label={language === 'he' ? 'יחס הון למאזן > 20%' : 'Equity to Balance > 20%'}
                                        value={`${(metrics.equityRatio * 100).toFixed(1)}%`}
                                        isValid={metrics.isEquityValid}
                                    />
                                    <CheckRow
                                        label={language === 'he' ? `צמיחה חיובית בהכנסות (צפוי vs ${parseInt(metrics.latestPeriod.split('/')[1]) - 1})` : `Positive Revenue Growth (Expected vs ${parseInt(metrics.latestPeriod.split('/')[1]) - 1})`}
                                        value={`${(metrics.revGrowth * 100).toFixed(1)}%`}
                                        isValid={metrics.revGrowth > 0}
                                    />
                                    <CheckRow
                                        label={language === 'he' ? `צמיחה חיובית ברווח (צפוי vs ${parseInt(metrics.latestPeriod.split('/')[1]) - 1})` : `Positive Profit Growth (Expected vs ${parseInt(metrics.latestPeriod.split('/')[1]) - 1})`}
                                        value={`${(metrics.profitGrowth * 100).toFixed(1)}%`}
                                        isValid={metrics.profitGrowth > 0}
                                    />
                                    <CheckRow
                                        label={language === 'he' ? 'פוטנציאל השקעה חיובי' : 'Positive Investment Potential'}
                                        value={`${(metrics.potential! * 100).toFixed(1)}%`}
                                        isValid={metrics.potential! > 0}
                                    />
                                </div>

                                <div className="mt-8 p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all bg-slate-50 border-slate-200">
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{language === 'he' ? 'שורה תחתונה' : 'Bottom Line'}</div>
                                    {metrics.verdict === 'buy' ? (
                                        <div className="flex flex-col items-center">
                                            <div className="text-4xl font-black text-emerald-600 mb-2">{language === 'he' ? 'מומלץ לבחינה' : 'BUY CANDIDATE'}</div>
                                            <div className="text-sm text-emerald-700 font-bold">{language === 'he' ? 'המניה עומדת בכל תנאי הסף' : 'This stock meets all investment criteria'}</div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center opacity-60">
                                            <div className="text-4xl font-black text-slate-400 mb-2">{language === 'he' ? 'המתנה' : 'WAIT'}</div>
                                            <div className="text-sm text-slate-500 font-bold">{language === 'he' ? 'המניה אינה עומדת ביעד הצמיחה או הפוטנציאל' : 'Investment criteria not fully met'}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 pt-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">{language === 'he' ? `ביצועי ${metrics.latestPeriod.split('/')[1]} - תחזית` : `${metrics.latestPeriod.split('/')[1]} Forecast`}</h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-3xl font-black text-black mb-1">{formatMillions(metrics.expectedAnnualRevenue)}</div>
                                        <div className="text-xs font-bold text-slate-500 uppercase">{language === 'he' ? 'הכנסות צפויות (שנתי)' : 'Expected Revenue (Annualized)'}</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-black text-indigo-600 mb-1">{formatMillions(metrics.expectedAnnualProfit)}</div>
                                        <div className="text-xs font-bold text-slate-500 uppercase">{language === 'he' ? 'רווח צפוי (שנתי)' : 'Expected Profit (Annualized)'}</div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm font-black text-black">{language === 'he' ? 'צמיחה חזויה' : 'Forecasted Growth'}</span>
                                        </div>
                                        <div className="text-2xl font-mono font-bold text-emerald-600">
                                            {metrics.profitGrowth > 0 ? '+' : ''}{(metrics.profitGrowth * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4">
                            <Info className="w-5 h-5 text-amber-500 shrink-0" />
                            <div className="text-xs text-amber-800 leading-relaxed font-bold">
                                {language === 'he'
                                    ? `הערה: החישובים מבוססים על נתוני דוחות כספיים רבעוניים (עד ${metrics.latestPeriod}) ומניחים צמיחה לינארית. המידע הינו לצורך ניתוח בלבד ואינו מהווה המלצת השקעה.`
                                    : `Note: Calculations are based on quarterly financial data (up to ${metrics.latestPeriod}) and assume linear growth. This data is for analysis only and is not investment advice.`}
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'financials' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-black text-black">{t('stockDetail.history.title')}</h2>
                            <span className="text-xs text-slate-600 font-bold italic">{t('stockDetail.history.currencyNote')}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse" dir={dir}>
                                <thead className="bg-slate-100 border-b border-slate-200">
                                    <tr>
                                        <th className={`px-6 py-4 font-bold text-slate-950 ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>{t('table.report')}</th>
                                        <th className={`px-6 py-4 font-bold text-slate-950 ${dir === 'ltr' ? 'text-right' : 'text-left'}`}>{t('table.revenue')}</th>
                                        <th className={`px-6 py-4 font-bold text-slate-950 ${dir === 'ltr' ? 'text-right' : 'text-left'}`}>{t('table.netProfit')}</th>
                                        <th className={`px-6 py-4 font-bold text-slate-950 ${dir === 'ltr' ? 'text-right' : 'text-left'}`}>{t('table.equity')}</th>
                                        <th className={`px-6 py-4 font-bold text-slate-950 ${dir === 'ltr' ? 'text-right' : 'text-left'}`}>{t('table.assets')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[...sortedFinancials].reverse().map((fin) => (
                                        <tr key={fin.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-mono font-black text-black">{fin.period}</div>
                                                {fin.publishedAt && (
                                                    <div className="text-[10px] text-slate-700 mt-1 uppercase font-black tracking-tighter">
                                                        {t('table.published')}: {format(new Date(fin.publishedAt), 'MMM d, yyyy')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className={`px-6 py-4 text-slate-950 font-bold ${dir === 'ltr' ? 'text-right' : 'text-left'}`}>{((fin.revenue || 0) * 1000).toLocaleString()}</td>
                                            <td className={`px-6 py-4 font-black text-black ${dir === 'ltr' ? 'text-right' : 'text-left'}`}>{((fin.netProfit || 0) * 1000).toLocaleString()}</td>
                                            <td className={`px-6 py-4 text-slate-950 font-bold ${dir === 'ltr' ? 'text-right' : 'text-left'}`}>{((fin.equity || 0) * 1000).toLocaleString()}</td>
                                            <td className={`px-6 py-4 text-slate-950 font-bold ${dir === 'ltr' ? 'text-right' : 'text-left'}`}>{((fin.totalBalance || 0) * 1000).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'news' && (
                    <div className="max-w-4xl space-y-4">
                        {(() => {
                            // Filter to last 6 months and sort by latest first
                            const sixMonthsAgo = new Date()
                            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

                            const recentNews = news
                                .filter(item => item.time >= sixMonthsAgo)
                                .sort((a, b) => b.time.getTime() - a.time.getTime())

                            const hasOlderArticles = news.length > recentNews.length

                            return (
                                <>
                                    {recentNews.length > 0 ? recentNews.map((item) => (
                                        <a
                                            key={item.id}
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex gap-4 group"
                                        >
                                            {item.thumbnail && (
                                                <div className="w-32 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                                                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                                                    <span className="font-bold text-indigo-500 uppercase">{item.publisher}</span>
                                                    <span>•</span>
                                                    <span>{formatDistanceToNow(item.time, { addSuffix: true })}</span>
                                                </div>
                                                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2 leading-snug">
                                                    {item.title}
                                                </h3>
                                                <div className={`flex items-center gap-1 text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                                    {language === 'he' ? 'קרא עוד' : 'Read more'} <ExternalLink className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </a>
                                    )) : (
                                        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                                            <Newspaper className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                            <p className="text-slate-500">{language === 'he' ? 'לא נמצאו חדשות ספציפיות למניה זו לאחרונה.' : 'No specific news found for this stock recently.'}</p>
                                        </div>
                                    )}

                                    {hasOlderArticles && (
                                        <button
                                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(stock.name + ' ' + stock.symbol)} site:bizportal.co.il OR site:calcalist.co.il OR site:globes.co.il&tbs=cdr:1,cd_min:1/1/2020,cd_max:${format(sixMonthsAgo, 'M/d/yyyy')}`, '_blank')}
                                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            {language === 'he' ? 'חיפוש מאמרים ישנים יותר' : 'Search for Older Articles'}
                                        </button>
                                    )}
                                </>
                            )
                        })()}
                    </div>
                )}
            </div>
        </div>
    )
}

function MetricCard({ label, value, tooltip, status }: { label: string, value: string, tooltip?: string, status?: 'good' | 'bad' }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group overflow-hidden">
            {status === 'good' && <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 rounded-bl-full flex items-start justify-end p-2"><TrendingUp className="w-4 h-4 text-emerald-500" /></div>}
            {status === 'bad' && <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/10 rounded-bl-full flex items-start justify-end p-2"><TrendingDown className="w-4 h-4 text-rose-500" /></div>}
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</div>
            <div className={`text-2xl font-black ${status === 'good' ? 'text-emerald-600' : status === 'bad' ? 'text-rose-600' : 'text-black'}`}>{value}</div>
            {tooltip && (
                <div className="mt-2 text-[10px] text-slate-500 italic opacity-0 group-hover:opacity-100 transition-opacity">
                    {tooltip}
                </div>
            )}
        </div>
    )
}

function CheckRow({ label, value, isValid }: { label: string, value: string | null | undefined, isValid: boolean }) {
    return (
        <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isValid ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {isValid ? '✓' : '✗'}
                </div>
                <span className={`text-sm font-bold ${isValid ? 'text-slate-700' : 'text-rose-700'}`}>{label}</span>
            </div>
            <span className="text-sm font-mono font-black text-black bg-slate-100 px-2 py-0.5 rounded">{value ?? '-'}</span>
        </div>
    )
}

function StatRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
            <span className="text-sm text-slate-600 font-bold">{label}</span>
            <span className="text-sm font-black text-black">{value}</span>
        </div>
    )
}
