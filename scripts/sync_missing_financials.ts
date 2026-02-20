
import db from '../src/lib/db'
import { updateStockPrice, updateFundamentals } from '../src/lib/sync'

const newTickers = [
    'GCT.TA', 'CLIS.TA', 'MVNE.TA', 'BEZQ.TA', 'MGDL.TA', 'CEL.TA',
    'PTNR.TA', 'MLSR.TA', 'HARL.TA', 'DNYA.TA', 'ALHE.TA', 'AMAN.TA',
    'POLI.TA', 'ELCO.TA', 'MZTF.TA', 'GBYM.TA', 'SAE.TA', 'ISTA.TA',
    'ESLT.TA', 'TSEM.TA', 'GILT.TA', 'AUDC.TA', 'DLEKG.TA', 'NVMI.TA',
    'ELCRE.TA', 'AVGL.TA', 'ABRA.TA', 'AZRG.TA', 'OVRS.TA', 'MAXO.TA',
    'SOLR.TA', 'ADGR.TA'
]

async function sync() {
    console.log(`Syncing fundamentals for ${newTickers.length} newly mapped stocks...`)

    let success = 0
    let fail = 0

    for (const ticker of newTickers) {
        try {
            console.log(`\nSyncing ${ticker}...`)
            await new Promise(r => setTimeout(r, 1000))

            const priceReq = await updateStockPrice(ticker)
            const funReq = await updateFundamentals(ticker)

            if (priceReq && funReq) {
                success++
                console.log(`✓ ${ticker} synced successfully.`)
            } else {
                fail++
                console.log(`X ${ticker} sync had issues.`)
            }
        } catch (e) {
            fail++
            console.error(`Error syncing ${ticker}:`, e)
        }
    }

    console.log(`\nSync Complete: ${success} successful, ${fail} failed.`)
}

sync()
    .catch(console.error)
    .finally(() => db.$disconnect())
