
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(__dirname, '..', '.env') })
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const groups = await prisma.stockGroup.findMany({
        include: {
            _count: {
                select: { stocks: true }
            }
        }
    })

    console.log('--- Stock Group Counts ---')
    for (const g of groups) {
        console.log(`${g.name}: ${g._count.stocks} stocks`)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
