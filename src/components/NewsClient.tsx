
"use client"

import { useLanguage } from '@/lib/LanguageContext'
import { Newspaper, ExternalLink, Calendar, TrendingUp, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface NewsClientProps {
    news: any[]
}

export function NewsClient({ news }: NewsClientProps) {
    const { t, dir, language } = useLanguage()

    return (
        <div className="space-y-10 pb-20" dir={dir}>
            {/* Premium Header Card */}
            <header className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-10 py-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600/25 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-600/15 blur-[100px] rounded-full animate-pulse" />

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 mb-4 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                                {language === 'he' ? 'עדכונים חיים' : 'Live Market Feed'}
                            </span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight leading-none mb-2 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                            {language === 'he' ? 'חדשות שוק' : 'Market News'}
                        </h1>
                        <p className="text-slate-400 font-medium text-lg max-w-xl animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
                            {language === 'he'
                                ? 'כותרות פיננסיות גלובליות ואירועים משפיעים בשוק'
                                : 'Global financial headlines and market moving events'}
                        </p>
                    </div>
                </div>
            </header>

            {/* Navigation back */}
            <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 active-press shadow-sm transition-all"
            >
                <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                {language === 'he' ? 'חזור לדאשבורד' : 'BACK TO DASHBOARD'}
            </Link>

            {/* News Grid */}
            <div className="grid gap-4 max-w-4xl mx-auto">
                {news.length > 0 ? (
                    news.map((item, i) => (
                        <a
                            key={item.id}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-500"
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            {item.thumbnail && (
                                <div className="w-32 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                                    <span className="font-bold text-indigo-500 uppercase">{item.publisher}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2 leading-snug">
                                    {item.title}
                                </h3>
                                <div className={`flex items-center gap-1 text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                    {language === 'he' ? 'קרא עוד' : 'Read full story'} <ExternalLink className="w-3 h-3" />
                                </div>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center animate-in fade-in zoom-in duration-500">
                        <Newspaper className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500">
                            {language === 'he' ? 'לא נמצאו חדשות אחרונות.' : 'No recent market news found.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
