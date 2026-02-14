
"use client"

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

interface AddToPortfolioProps {
    stockId: number
    currentPrice: number
    symbol: string
}

export function AddToPortfolio({ stockId, currentPrice, symbol }: AddToPortfolioProps) {
    const { t, language, dir } = useLanguage()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [quantity, setQuantity] = useState('')
    const [price, setPrice] = useState(currentPrice?.toString() || '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch('/api/portfolio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stockId,
                    quantity: parseFloat(quantity),
                    price: parseFloat(price)
                })
            })

            if (res.ok) {
                setIsOpen(false)
                router.refresh()
                // Optional: Show success toast
            }
        } catch (error) {
            console.error('Failed to add to portfolio', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 hover:scale-105 transition-all active-press shadow-xl shadow-indigo-600/20 flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                {language === 'he' ? 'הוסף לתיק' : 'Add to Portfolio'}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 relative"
                        dir={dir}
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <h2 className="text-2xl font-black text-slate-900 mb-2">
                            {language === 'he' ? 'הוסף לתיק' : 'Add to Portfolio'}
                        </h2>
                        <p className="text-slate-500 text-sm font-bold mb-8">
                            {symbol}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                    {language === 'he' ? 'כמות' : 'Quantity'}
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0.0001"
                                    step="any"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                    {language === 'he' ? 'מחיר קנייה (ממוצע)' : 'Buy Price (Avg)'}
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="any"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (language === 'he' ? 'שמור בתיק' : 'Save to Portfolio')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
