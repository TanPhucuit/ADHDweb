"use client"

import type { Child } from "@/lib/types"
import { Star, Trophy, Gift } from "lucide-react"

interface RewardDisplayProps {
  child: Child
}

export function RewardDisplay({ child }: RewardDisplayProps) {
  // Calculate rewards based on recent performance
  const today = new Date().toISOString().split("T")[0]
  const todayReport = child.dailyReports?.find((r) => r.date === today)
  const stars = Math.floor((todayReport?.averageFocusScore || 0) / 20)
  const totalStars =
    child.dailyReports?.reduce((sum, report) => sum + Math.floor(report.averageFocusScore / 20), 0) || 0

  const rewards = [
    { name: "Sticker Unicorn", cost: 5, unlocked: totalStars >= 5, emoji: "🦄" },
    { name: "Badge Siêu sao", cost: 10, unlocked: totalStars >= 10, emoji: "⭐" },
    { name: "Avatar Robot", cost: 15, unlocked: totalStars >= 15, emoji: "🤖" },
    { name: "Theme Cầu vồng", cost: 20, unlocked: totalStars >= 20, emoji: "🌈" },
  ]

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Phần thưởng</h2>
        <div className="flex items-center space-x-2 bg-yellow-100 rounded-full px-4 py-2">
          <Star className="w-5 h-5 text-yellow-600 fill-current" />
          <span className="font-bold text-yellow-800">{totalStars} sao</span>
        </div>
      </div>

      {/* Today's Stars */}
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-600 font-medium">Hôm nay kiếm được</p>
            <p className="text-2xl font-bold text-orange-800">{stars} sao ⭐</p>
          </div>
          <div className="text-4xl">🎉</div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {rewards.map((reward, index) => (
          <div
            key={index}
            className={`rounded-2xl p-4 text-center transition-all ${
              reward.unlocked ? "bg-green-100 border-2 border-green-300" : "bg-gray-100 opacity-60"
            }`}
          >
            <div className="text-3xl mb-2">{reward.emoji}</div>
            <p className="font-bold text-sm text-gray-800 mb-1">{reward.name}</p>
            <div className="flex items-center justify-center space-x-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs text-gray-600">{reward.cost}</span>
            </div>
            {reward.unlocked && (
              <div className="mt-2">
                <Trophy className="w-4 h-4 text-green-600 mx-auto" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Next Reward */}
      <div className="mt-6 bg-purple-100 rounded-2xl p-4 text-center">
        <Gift className="w-6 h-6 text-purple-600 mx-auto mb-2" />
        <p className="text-sm text-purple-600 font-medium">Phần thưởng tiếp theo</p>
        <p className="text-lg font-bold text-purple-800">Cần thêm {Math.max(0, 25 - totalStars)} sao</p>
      </div>
    </div>
  )
}
