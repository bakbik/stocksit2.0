import { NextResponse } from 'next/server'
import db from '@/lib/db'

export const dynamic = 'force-dynamic'

const overrides: Record<string, string> = {
    '126011.TA': 'GCT.TA', // G City
    '224014.TA': 'CLIS.TA', // Clal Insurance
    '226019.TA': 'MVNE.TA', // Mivne
    '230011.TA': 'BEZQ.TA', // Bezeq
    '232017.TA': 'MGDL.TA', // Migdal Insurance
    '256016.TA': 'CEL.TA', // Cellcom
    '257014.TA': 'PTNR.TA', // Partner
    '281014.TA': 'MLSR.TA', // Melisron
    '390013.TA': 'HARL.TA', // Harel Insurance
    '475020.TA': 'PZOL.TA', // Paz Oil
    '604611.TA': 'DNYA.TA', // Danya Cebus
    '629014.TA': 'ALHE.TA', // Alony Hetz
    '654012.TA': 'AMAN.TA', // Amanet
    '662577.TA': 'POLI.TA', // Bank Hapoalim
    '694034.TA': 'ELCO.TA', // Elco
    '695437.TA': 'MZTF.TA', // Mizrahi Tefahot
    '759019.TA': 'GBYM.TA', // Gav Yam
    '777037.TA': 'SAE.TA', // Shufersal
    '1081074.TA': 'ISTA.TA', // Issta
    '1081124.TA': 'ESLT.TA', // Elbit Systems
    '1082379.TA': 'TSEM.TA', // Tower Semiconductor
    '1082510.TA': 'GILT.TA', // Gilat
    '1082965.TA': 'AUDC.TA', // AudioCodes
    '1084128.TA': 'DLEKG.TA', // Delek Group
    '1084557.TA': 'NVMI.TA', // Nova
    '1094044.TA': 'ELCRE.TA', // Electra Real Estate
    '1100957.TA': 'AVGL.TA', // Avgol
    '1101666.TA': 'ABRA.TA', // Abra
    '1119478.TA': 'AZRG.TA', // Azrieli Group
    '1139617.TA': 'OVRS.TA', // Overseas
    '1168558.TA': 'MAXO.TA', // Max Stock
    '1172287.TA': 'SOLR.TA', // Solaer
    '1820083.TA': 'ADGR.TA', // Adgar
}

export async function GET() {
    console.log(`Applying ${Object.keys(overrides).length} manual ticker overrides to database...`)
    const results = []

    for (const [numericId, correctTicker] of Object.entries(overrides)) {
        try {
            const stock = await db.stock.findUnique({ where: { symbol: numericId } })
            if (stock) {
                const existing = await db.stock.findUnique({ where: { symbol: correctTicker } })
                if (existing) {
                    const groups = await db.stockGroup.findMany({
                        where: { stocks: { some: { id: stock.id } } }
                    })
                    await db.stock.update({
                        where: { id: existing.id },
                        data: { groups: { connect: groups.map(g => ({ id: g.id })) } }
                    })
                    await db.stock.delete({ where: { id: stock.id } })
                    results.push(`Merged ${numericId} -> ${correctTicker}`)
                } else {
                    await db.stock.update({
                        where: { id: stock.id },
                        data: { symbol: correctTicker }
                    })
                    results.push(`Updated ${numericId} -> ${correctTicker}`)
                }
            } else {
                results.push(`Skipped ${numericId} (not found)`)
            }
        } catch (e) {
            results.push(`Error for ${numericId}: ${String(e)}`)
        }
    }

    return NextResponse.json({
        success: true,
        message: 'Overrides applied',
        details: results
    })
}
