import cron from 'node-cron'
import { updateAllStocksData } from './lib/sync'
import { checkAlerts } from './lib/alerts'

export function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('--- Background Service Starting ---')

        // Run once on startup
        // updateAllStocksData().catch(console.error)

        // Schedule every 6 hours: 0 */6 * * *
        cron.schedule('0 */6 * * *', async () => {
            console.log('--- Running Scheduled Tasks (6-hour cycle) ---')
            try {
                await updateAllStocksData()
                await checkAlerts()
                console.log('--- Scheduled Tasks Completed ---')
            } catch (error) {
                console.error('Error in scheduled tasks:', error)
            }
        })

        console.log('--- Background Service Registered (Every 6 hours) ---')
    }
}
