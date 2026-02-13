"use client"

import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, Calendar, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

interface Notification {
    id: number
    stockId: number
    type: string
    period: string | null
    message: string
    isRead: boolean
    createdAt: string
    stock: {
        symbol: string
        name: string
    }
}

export function NotificationTab() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const markAsRead = async (id: number | 'all') => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isRead: true })
            })
            if (res.ok) {
                if (id === 'all') {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
                } else {
                    setNotifications(prev => prev.map(n => n.id === id ? ({ ...n, isRead: true }) : n))
                }
            }
        } catch (error) {
            console.error('Failed to update notification:', error)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <Bell className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
                        <p className="text-sm text-slate-500">Track new financial reports and alerts</p>
                    </div>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={() => markAsRead('all')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                    >
                        <Check className="w-3.5 h-3.5" />
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="divide-y divide-slate-100">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Bell className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm font-medium">No notifications yet</p>
                        <p className="text-xs">New reports will appear here automatically</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <div
                            key={n.id}
                            className={`p-5 flex items-start gap-4 transition-colors hover:bg-slate-50/50 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                        >
                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!n.isRead ? 'bg-indigo-600' : 'bg-slate-300'}`} />

                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                        {n.stock.symbol} - {n.stock.name}
                                        {n.type === 'new_report' && (
                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black">
                                                New Report
                                            </span>
                                        )}
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {n.message}
                                </p>
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                        <Calendar className="w-3 h-3" />
                                        Period: {n.period}
                                    </div>
                                    {!n.isRead && (
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            className="text-[10px] text-indigo-600 font-bold hover:underline"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
