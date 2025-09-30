"use client"

import { useState, useEffect } from "react"
import type { Child } from "@/lib/types"
import { dataStore } from "@/lib/data-store"

interface DailyRewardsDisplayProps {
  child: Child
}

export function DailyRewardsDisplay({ child }: DailyRewardsDisplayProps) {
  const [dailyRewards, setDailyRewards] = useState({
    stickers: { unicorn: 0, total: 0 },
    badges: { superStar: 0, total: 0 },
    totalStars: 0
  })

  useEffect(() => {
    // Load daily rewards
    const rewards = dataStore.getDailyRewardSummary(child.id)
    setDailyRewards(rewards)

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      const updatedRewards = dataStore.getDailyRewardSummary(child.id)
      setDailyRewards(updatedRewards)
    }, 10000)

    return () => clearInterval(interval)
  }, [child.id])

  return (
    <div className="container mx-auto px-3 sm:px-4 py-2">
      <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Unicorn Stickers */}
            <div className="flex items-center space-x-2 bg-white/30 rounded-full px-3 py-2">
              <span className="text-2xl">🦄</span>
              <div className="text-center">
                <p className="text-xs text-white/80 font-medium">Sticker Unicorn</p>
                <p className="text-sm font-bold text-white">⭐ {dailyRewards.stickers.unicorn * 5}</p>
              </div>
            </div>

            {/* Super Star Badges */}
            <div className="flex items-center space-x-2 bg-white/30 rounded-full px-3 py-2">
              <span className="text-2xl">⭐</span>
              <div className="text-center">
                <p className="text-xs text-white/80 font-medium">Badge Siêu sao</p>
                <p className="text-sm font-bold text-white">⭐ {dailyRewards.badges.superStar * 10}</p>
              </div>
            </div>
          </div>

          {/* Total Stars Today */}
          <div className="text-center bg-yellow-400/80 rounded-full px-4 py-2">
            <p className="text-xs text-yellow-900 font-medium">Hôm nay kiếm được</p>
            <p className="text-lg font-bold text-yellow-900">{dailyRewards.totalStars} ⭐</p>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-white/70">Stickers hôm nay</p>
            <div className="flex justify-center space-x-1">
              {Array.from({ length: Math.max(5, dailyRewards.stickers.unicorn) }, (_, i) => (
                <span key={i} className={`text-lg ${i < dailyRewards.stickers.unicorn ? '' : 'opacity-30'}`}>
                  🦄
                </span>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-white/70">Badges hôm nay</p>
            <div className="flex justify-center space-x-1">
              {Array.from({ length: Math.max(3, dailyRewards.badges.superStar) }, (_, i) => (
                <span key={i} className={`text-lg ${i < dailyRewards.badges.superStar ? '' : 'opacity-30'}`}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}