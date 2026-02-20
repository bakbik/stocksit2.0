
import { updateFundamentals } from '../src/lib/sync'

async function test() {
    const symbol = '1081124.TA'
    console.log(`Testing updateFundamentals for ${symbol}...`)
    const result = await updateFundamentals(symbol)
    console.log(`Result:`, result)
}

test()
