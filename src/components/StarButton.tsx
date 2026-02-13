'use client'

import { Star } from 'lucide-react'
import { toggleWatchlist } from '@/app/actions/watchlist'
import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'

interface StarButtonProps {
    stockId: number
    isStarred: boolean
}

export function StarButton({ stockId, isStarred: initialIsStarred }: StarButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [optimisticIsStarred, setOptimisticIsStarred] = useState(initialIsStarred)

    const handleToggle = () => {
        startTransition(async () => {
            setOptimisticIsStarred(!optimisticIsStarred)
            await toggleWatchlist(stockId)
        })
    }

    return (
        <button
            onClick={(e) => {
                e.preventDefault()
                handleToggle()
            }}
            disabled={isPending}
            className={cn(
                "p-2 rounded-full transition-colors hover:bg-slate-100",
                optimisticIsStarred ? "text-amber-400 fill-amber-400" : "text-slate-300",
                isPending && "opacity-50 cursor-not-allowed"
            )}
            aria-label={optimisticIsStarred ? "Remove from watchlist" : "Add to watchlist"}
        >
            <Star className="w-5 h-5" />
        </button>
    )
}
