import { getBizportalQuote } from '../src/lib/bizportal'

async function test() {
    console.log('Testing Bizportal Scraper...')

    // Test 1: Known failing ID from user list (2530185.TA -> 2530185)
    const id1 = '2530185'
    console.log(`\nFetching ${id1}...`)
    const res1 = await getBizportalQuote(id1)
    console.log('Result 1:', res1)

    // Test 2: Another one (1119478)
    const id2 = '1119478'
    console.log(`\nFetching ${id2}...`)
    const res2 = await getBizportalQuote(id2)
    console.log('Result 2:', res2)
}

test()
