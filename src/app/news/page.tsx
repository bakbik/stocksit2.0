import { getMarketNews } from '@/lib/news'
import { formatDistanceToNow } from 'date-fns'
import { Newspaper, ExternalLink, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
    const news = await getMarketNews()

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Market News</h1>
                <p className="text-sm text-slate-500">Global financial headlines and market moving events</p>
            </header>

            <div className="grid gap-4 max-w-4xl">
                {news.length > 0 ? (
                    news.map((item) => (
                        <a
                            key={item.id}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex gap-4 group"
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
                                        {formatDistanceToNow(item.time, { addSuffix: true })}
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2 leading-snug">
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    Read full story <ExternalLink className="w-3 h-3" />
                                </div>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                        <Newspaper className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500">No recent market news found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
