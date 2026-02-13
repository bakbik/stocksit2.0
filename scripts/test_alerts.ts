import { checkAlerts } from '../src/lib/alerts'
import db from '../src/lib/db'

async function main() {
    // 1. Find a stock with a price
    const stock = await db.stock.findFirst({
        where: { currentPrice: { not: null } }
    })

    if (!stock) {
        console.error("No stocks with price found in database.")
        return
    }

    console.log(`Testing with stock: ${stock.name} (${stock.symbol}) Price: ${stock.currentPrice}`)

    // 2. Create an alert
    console.log("Creating alert: price > 10")
    const alert = await db.alert.create({
        data: {
            stockId: stock.id,
            condition: "price > 10",
            isActive: true
        }
    })

    // 3. Run check
    await checkAlerts()

    // 4. Cleanup
    console.log("Cleaning up test alert...")
    await db.alert.delete({ where: { id: alert.id } })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
