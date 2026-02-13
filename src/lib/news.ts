import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()

export interface NewsItem {
    id: string
    title: string
    publisher: string
    link: string
    time: Date
    thumbnail?: string
}

export async function getStockNews(symbol: string, stockId?: number): Promise<NewsItem[]> {
    try {
        // For Israeli stocks, aggregate from multiple local sources + Yahoo
        if (symbol.endsWith('.TA') && stockId) {
            const [yahooNews, bizportalNews, calcalistNews, globesNews] = await Promise.all([
                getYahooNews(symbol),
                getBizportalNews(stockId),
                getCalcalistNews(symbol),
                getGlobesNews(symbol)
            ])
            // Combine all sources and limit total
            return [...bizportalNews, ...calcalistNews, ...globesNews, ...yahooNews].slice(0, 20)
        }

        return getYahooNews(symbol)
    } catch (e) {
        console.error(`Error fetching news for ${symbol}:`, e)
        return []
    }
}

async function getYahooNews(symbol: string): Promise<NewsItem[]> {
    try {
        const result = await yahooFinance.search(symbol)
        if (!result || !result.news) return []

        return result.news
            .filter((item: any) => {
                const tickers = item.relatedTickers || []
                const isRelated = tickers.includes(symbol) || tickers.includes(symbol.split('.')[0])
                const inTitle = item.title.toLowerCase().includes(symbol.toLowerCase()) ||
                    item.title.toLowerCase().includes(symbol.split('.')[0].toLowerCase())
                return isRelated || inTitle
            })
            .map((item: any) => ({
                id: item.uuid,
                title: item.title,
                publisher: item.publisher,
                link: item.link,
                time: new Date(item.providerPublishTime),
                thumbnail: item.thumbnail?.resolutions[0]?.url
            }))
    } catch (e) {
        return []
    }
}

async function getBizportalNews(stockId: number): Promise<NewsItem[]> {
    try {
        // Use the stock ID (which is the TASE security number) for Bizportal
        const url = `https://www.bizportal.co.il/capitalmarket/quote/news/${stockId}`

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })

        if (!response.ok) return []

        const html = await response.text()

        // Parse article links from listing page
        const newsItems: NewsItem[] = []
        const articlePattern = /<a[^>]*href="([^"]*\/article\/\d+)"[^>]*class="article_header"[^>]*>([^<]+)</g
        let match
        const articles: Array<{ link: string, title: string }> = []

        // Collect article links
        while ((match = articlePattern.exec(html)) !== null && articles.length < 10) {
            const href = match[1]
            const link = href.startsWith('http') ? href : `https://www.bizportal.co.il${href}`
            articles.push({ link, title: match[2].trim() })
        }

        // Fetch each article to get publication date from meta tag
        const articlePromises = articles.map((article, i) =>
            fetch(article.link, { headers: { 'User-Agent': 'Mozilla/5.0' } })
                .then(res => res.text())
                .then(articleHtml => {
                    // Extract: <meta property="article:published_time" content="2025-05-18T05:25:00Z" />
                    const metaMatch = articleHtml.match(/<meta[^>]*property="article:published_time"[^>]*content="([^"]+)"/)
                    const pubDate = metaMatch ? new Date(metaMatch[1]) : new Date()

                    return {
                        id: `biz-${i}`,
                        title: article.title,
                        publisher: 'Bizportal',
                        link: article.link,
                        time: pubDate
                    }
                })
                .catch(() => null)
        )

        const results = await Promise.all(articlePromises)
        newsItems.push(...results.filter(Boolean) as NewsItem[])

        return newsItems
    } catch (e) {
        console.error('Error fetching Israeli news:', e)
        return []
    }
}

async function getCalcalistNews(symbol: string): Promise<NewsItem[]> {
    try {
        const stockName = symbol.split('.')[0]
        const searchUrl = `https://www.calcalist.co.il/search?q=${encodeURIComponent(stockName)}`

        const response = await fetch(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        })

        if (!response.ok) return []
        const html = await response.text()

        const newsItems: NewsItem[] = []
        // Parse Calcalist article links
        const articlePattern = /<a[^>]*href="(\/\w+\/article\/[^"]+)"[^>]*>([^<]+)</g
        let match
        let id = 0

        while ((match = articlePattern.exec(html)) !== null && newsItems.length < 5) {
            newsItems.push({
                id: `calc-${id++}`,
                title: match[2].trim(),
                publisher: 'Calcalist',
                link: `https://www.calcalist.co.il${match[1]}`,
                time: new Date() // Simplified - individual article fetching would be needed for dates
            })
        }

        return newsItems
    } catch (e) {
        console.error('Error fetching Calcalist news:', e)
        return []
    }
}

async function getGlobesNews(symbol: string): Promise<NewsItem[]> {
    try {
        const stockName = symbol.split('.')[0]
        const searchUrl = `https://www.globes.co.il/search/?q=${encodeURIComponent(stockName)}`

        const response = await fetch(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        })

        if (!response.ok) return []
        const html = await response.text()

        const newsItems: NewsItem[] = []
        // Parse Globes article links
        const articlePattern = /<a[^>]*href="(\/news\/article[^"]+)"[^>]*>([^<]+)</g
        let match
        let id = 0

        while ((match = articlePattern.exec(html)) !== null && newsItems.length < 5) {
            newsItems.push({
                id: `globes-${id++}`,
                title: match[2].trim(),
                publisher: 'Globes',
                link: `https://www.globes.co.il${match[1]}`,
                time: new Date() // Simplified - individual article fetching would be needed for dates
            })
        }

        return newsItems
    } catch (e) {
        console.error('Error fetching Globes news:', e)
        return []
    }
}

export async function getMarketNews(): Promise<NewsItem[]> {
    return getYahooNews('^GSPC') // S&P 500 news as proxy for general market
}
