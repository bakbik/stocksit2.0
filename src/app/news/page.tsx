import { getMarketNews } from '@/lib/news'
import { NewsClient } from '@/components/NewsClient'

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
    const news = await getMarketNews()

    return <NewsClient news={news} />
}
