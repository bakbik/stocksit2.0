import { updateFundamentals } from '../src/lib/sync'

async function verifyMayaSync() {
    const symbol = 'AVGL.TA' // Avgol
    console.log(`Starting verification for ${symbol}...`)

    try {
        await updateFundamentals(symbol)
        console.log('Sync completed.')
    } catch (e) {
        console.error('Sync failed:', e)
    }
}

verifyMayaSync()
