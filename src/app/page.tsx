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

  // Fetch all stocks to calculate dynamic counts and overlapping groups
  const allStocksRaw = await (db as any).stock.findMany({
    include: {
      returns: true,
      financials: true,
      watchlists: { where: { userId: 1 } },
      groups: true
    }
  }) as any[]

  // Process all stocks with metrics
  const allStocks = allStocksRaw.map(s => {
    const latestFin = [...s.financials].sort((a, b) => parsePeriod(b.period) - parsePeriod(a.period))[0] || null
    const metrics = calculateInvestmentMetrics(s, s.financials)
    return { ...s, latestFin, metrics }
  })

  // Apply Filters (Buyable / LatestOnly)
  // Latest Reports Filter Logic
  const now = new Date()
  const month = now.getMonth()
  const curY = now.getFullYear()
  let targetPeriods: string[] = []
  if (month >= 0 && month <= 2) targetPeriods = [`Q3/${curY - 1}`]
  else if (month >= 3 && month <= 5) targetPeriods = [`Y/${curY - 1}`, `Q4/${curY - 1}`]
  else if (month >= 6 && month <= 8) targetPeriods = [`Q1/${curY}`]
  else targetPeriods = [`Q2/${curY}`]

  let filteredStocks = allStocks
  if (buyable === 'true') {
    filteredStocks = filteredStocks.filter(s => s.metrics?.verdict === 'buy')
  }
  if (latestOnly === 'true') {
    filteredStocks = filteredStocks.filter(s => s.latestFin?.period && targetPeriods.includes(s.latestFin.period))
  }

  // Calculate dynamic counts for groups based on filtered list
  const groupsRaw = await (db as any).stockGroup.findMany()
  const groups = groupsRaw.map((g: any) => {
    const count = filteredStocks.filter(s => s.groups.some((sg: any) => sg.name === g.name)).length
    return { ...g, _count: { stocks: count } }
  })

  // Finally filter by selected group for display
  let displayStocks = filteredStocks
  if (group) {
    displayStocks = displayStocks.filter(s => s.groups.some((sg: any) => sg.name === group))
  }

  // Sort
  if (!isNative) {
    displayStocks.sort((a, b) => {
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
  } else {
    displayStocks.sort((a, b) => {
      const valA = a[sortBy]
      const valB = b[sortBy]
      if (valA === null && valB === null) return 0
      if (valA === null) return 1
      if (valB === null) return -1
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  return (
    <DashboardClient
      stocks={displayStocks}
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
