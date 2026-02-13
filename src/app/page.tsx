import db from '@/lib/db'
import { DashboardClient } from '@/components/DashboardClient'
import { calculateInvestmentMetrics } from '@/lib/investment_logic'

export const dynamic = 'force-dynamic'

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ group?: string; sortBy?: string; sortOrder?: string; buyable?: string; latestOnly?: string; view?: string }>
}) {
  const { group, sortBy = 'marketCap', sortOrder = 'desc', buyable, latestOnly, view } = await searchParams

  const groups = await (db as any).stockGroup.findMany()

  // Helper to convert period string to comparable number
  const parsePeriod = (p: string) => {
    if (!p) return 0
    const [q, y] = p.split('/')
    if (!y) return 0
    const year = parseInt(y)
    let quarter = 0
    if (q.startsWith('Q')) quarter = parseInt(q.slice(1))
    else if (q === 'Y') quarter = 5 // Yearly summary
    return year * 10 + quarter
  }

  // Native fields that Prisma can handle directly (mostly strings where nulls aren't an issue)
  const nativeFields = ['symbol', 'name']
  const isNative = nativeFields.includes(sortBy)

  const rawStocks = await (db as any).stock.findMany({
    where: group ? {
      groups: {
        some: { name: group }
      }
    } : {},
    orderBy: isNative ? {
      [sortBy]: sortOrder as 'asc' | 'desc'
    } : {
      marketCap: 'desc' // Default fallback
    },
    include: {
      returns: true,
      financials: true, // Fetch all to find latest in-memory reliably
      watchlists: {
        where: { userId: 1 } // Default user
      },
      groups: true
    }
  }) as any[]

  // Improve sorting and latest record selection
  let stocks: any[] = (rawStocks as any[]).map(s => {
    // Find the latest one for display
    const latestFin = [...s.financials].sort((a, b) => parsePeriod(b.period) - parsePeriod(a.period))[0] || null
    const metrics = calculateInvestmentMetrics(s, s.financials)
    return { ...s, latestFin, metrics }
  })

  if (buyable === 'true') {
    stocks = stocks.filter(s => s.metrics?.verdict === 'buy')
  }

  // Latest Reports Filter Logic (standard reporting cycle offset)
  const now = new Date()
  const month = now.getMonth() // 0-11
  const curY = now.getFullYear()
  let targetPeriods: string[] = []

  if (month >= 0 && month <= 2) {
    targetPeriods = [`Q3/${curY - 1}`]
  } else if (month >= 3 && month <= 5) {
    targetPeriods = [`Y/${curY - 1}`, `Q4/${curY - 1}`]
  } else if (month >= 6 && month <= 8) {
    targetPeriods = [`Q1/${curY}`]
  } else {
    targetPeriods = [`Q2/${curY}`]
  }

  if (latestOnly === 'true') {
    stocks = stocks.filter(s => s.latestFin?.period && targetPeriods.includes(s.latestFin.period))
  }

  if (!isNative) {
    stocks.sort((a, b) => {
      let valA: any = null
      let valB: any = null

      if (['3m', '12m', '3y'].includes(sortBy)) {
        valA = a.returns.find((r: any) => r.period === sortBy)?.value ?? null
        valB = b.returns.find((r: any) => r.period === sortBy)?.value ?? null
      } else if (['revenue', 'netProfit', 'equity', 'totalBalance'].includes(sortBy)) {
        valA = a.latestFin?.[sortBy] ?? null
        valB = b.latestFin?.[sortBy] ?? null
      } else if (sortBy === 'latestReport') {
        valA = parsePeriod(a.latestFin?.period)
        valB = parsePeriod(b.latestFin?.period)
      } else if (sortBy === 'peRatio' || sortBy === 'peValue' || sortBy === 'forwardPE') {
        valA = a.metrics?.peValue ?? null
        valB = b.metrics?.peValue ?? null
      } else if (sortBy === 'potential') {
        valA = a.metrics?.potential ?? null
        valB = b.metrics?.potential ?? null
      } else if (sortBy === 'peType') {
        valA = a.metrics?.peType ?? ''
        valB = b.metrics?.peType ?? ''
      } else if (['currentPrice', 'marketCap', 'roe'].includes(sortBy)) {
        valA = a[sortBy] ?? null
        valB = b[sortBy] ?? null
      }

      if (valA === null && valB === null) return 0
      if (valA === null) return 1
      if (valB === null) return -1

      return sortOrder === 'asc' ? valA - valB : valB - valA
    })
  }

  return (
    <DashboardClient
      stocks={stocks}
      groups={groups}
      group={group}
      sortBy={sortBy}
      sortOrder={sortOrder}
      buyable={buyable === 'true'}
      latestOnly={latestOnly === 'true'}
      view={view}
    />
  )
}
