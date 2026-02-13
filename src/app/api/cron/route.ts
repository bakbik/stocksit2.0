
import { NextResponse } from 'next/server'
import { updateAllStocksData } from '@/lib/sync'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    console.log('--- Cron Job Triggered ---')

    // In production, Vercel will secure this automatically if set up in dashboard,
    // or we can check for 'Authorization' header if we set CRON_SECRET.
    // For now, we leave it open to ensure it works, as it only triggers a data refresh.

    try {
        await updateAllStocksData()
        return NextResponse.json({ success: true, message: 'Stock data updated successfully' })
    } catch (error) {
        console.error('Cron job failed:', error)
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}
