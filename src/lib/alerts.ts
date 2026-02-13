import db from './db'

export async function checkAlerts() {
    console.log("Checking alerts...")

    // Fetch all active alerts with their related stock
    const alerts = await db.alert.findMany({
        where: { isActive: true },
        include: { stock: true }
    })

    console.log(`Found ${alerts.length} active alerts.`)

    for (const alert of alerts) {
        if (!alert.stock.currentPrice) continue

        // Simple condition parsing: "price > 150"
        // We can support ">" and "<"

        try {
            const [field, operator, valueStr] = alert.condition.split(' ')
            const targetValue = parseFloat(valueStr)
            const currentValue = alert.stock.currentPrice

            let triggered = false

            if (field === 'price') {
                if (operator === '>' && currentValue > targetValue) triggered = true
                if (operator === '<' && currentValue < targetValue) triggered = true
            }

            if (triggered) {
                await sendNotification(alert, currentValue)

                // Optional: Deactivate alert after triggering? 
                // Or keep it active but debounce? For now, let's just log.
            }
        } catch (e) {
            console.error(`Error processing alert ${alert.id}:`, e)
        }
    }
}

import { sendEmail } from './email'

async function sendNotification(alert: any, currentValue: number) {
    const subject = `ALERT: ${alert.stock.symbol} hit your target!`
    const text = `The stock ${alert.stock.name} (${alert.stock.symbol}) is now trading at ${currentValue}, which matches your condition: ${alert.condition}.`

    await sendEmail({
        to: 'user@example.com', // In a real app, this comes from alert.user.email
        subject,
        text
    })

    console.log(`\n--- NOTIFICATION SENT (MOCK) ---`)
}
