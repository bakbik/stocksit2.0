"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface FinancialChartProps {
    data: any[]
}

export function FinancialChart({ data }: FinancialChartProps) {
    // Transform data for chart if needed, or assume it's passed in correctly
    // Expecting data to have 'period', 'revenue', 'netProfit'

    // Sort by period (simple string sort might work for Y/xxxx if consistent)
    // But Q1/2025 vs Q4/2024 needs care.
    // Ideally backend sorts it.

    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="period" />
                    <YAxis
                        tickFormatter={(value: any) =>
                            typeof value === 'number'
                                ? new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value)
                                : String(value)
                        }
                    />
                    <Tooltip
                        formatter={(value: any) =>
                            typeof value === 'number'
                                ? new Intl.NumberFormat('en-US').format(value)
                                : String(value)
                        }
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="netProfit" fill="#10b981" name="Net Profit" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
