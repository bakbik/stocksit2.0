
import db from '../src/lib/db'

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
    // Some unsure ones are omitted or can be deleted manually if they are ETFs
}

async function apply() {
    console.log(`Applying ${Object.keys(overrides).length} manual ticker overrides...`)

    for (const [numericId, correctTicker] of Object.entries(overrides)) {
        try {
            const stock = await db.stock.findUnique({ where: { symbol: numericId } })
            if (stock) {
                // Check if target already exists
                const existing = await db.stock.findUnique({ where: { symbol: correctTicker } })
                if (existing) {
                    console.log(`${numericId} -> ${correctTicker} (Target already exists, merging groups and deleting numeric...)`)
                    const groups = await db.stockGroup.findMany({
                        where: { stocks: { some: { id: stock.id } } }
                    })
                    await db.stock.update({
                        where: { id: existing.id },
                        data: { groups: { connect: groups.map(g => ({ id: g.id })) } }
                    })
                    await db.stock.delete({ where: { id: stock.id } })
                } else {
                    console.log(`${numericId} -> ${correctTicker} (Updating symbol...)`)
                    await db.stock.update({
                        where: { id: stock.id },
                        data: { symbol: correctTicker }
                    })
                }
            } else {
                console.log(`Numeric ${numericId} not found in DB (already fixed?).`)
            }
        } catch (e) {
            console.error(`Error for ${numericId}:`, e)
        }
    }

    console.log("Overrides applied. Running data sync for these stocks...")
}

apply()
    .catch(console.error)
    .finally(() => db.$disconnect())
