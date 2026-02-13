import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
    try {
        const notifications = await (db as any).notification.findMany({
            include: {
                stock: {
                    select: {
                        symbol: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        })

        return NextResponse.json(notifications)
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, isRead } = await request.json()

        if (id === 'all') {
            await (db as any).notification.updateMany({
                data: { isRead: true }
            })
        } else {
            await (db as any).notification.update({
                where: { id },
                data: { isRead }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating notification:', error)
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
    }
}
