
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(__dirname, '..', '.env') })
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Cleaning Up Duplicate Groups ---')

    const duplicates = ['TA35', 'TA90', 'TA125']

    for (const name of duplicates) {
        try {
            const group = await prisma.stockGroup.findUnique({ where: { name } })
            if (group) {
                console.log(`Deleting group: ${name} (ID: ${group.id})`)
                await prisma.stockGroup.delete({ where: { id: group.id } })
                console.log(`Deleted ${name}`)
            } else {
                console.log(`Group ${name} not found (already clean)`)
            }
        } catch (e) {
            console.error(`Error deleting ${name}:`, e)
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
