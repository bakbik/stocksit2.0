import { updateAllStocksData } from '../src/lib/sync'

console.log('Starting full market sync...')
updateAllStocksData().then(() => {
    console.log('Sync complete!')
    process.exit(0)
}).catch(err => {
    console.error('Sync failed:', err)
    process.exit(1)
})
