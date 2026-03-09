"use client"

import { useState, useEffect, useCallback } from "react"
import { Star, BookOpen, Pill, Gift, Clock, CheckCircle, ChevronRight } from "lucide-react"
import type { Child } from "@/lib/types"
import { DEFAULT_REWARDS, type RewardItem } from "@/lib/reward-catalog"

interface ChildRewardDashboardProps {
  child: Child
}

interface PendingRequest {
  actionId: string | number
  rewardId: string
  rewardTitle: string
  rewardStars: number
  requestedAt: string
}

type Tab = "earn" | "shop" | "pending"

export function ChildRewardDashboard({ child }: ChildRewardDashboardProps) {
  const [earned, setEarned] = useState(0)
  const [spent, setSpent] = useState(0)
  const [breakdown, setBreakdown] = useState({ activities: 0, medications: 0 })
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const [postError, setPostError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("shop")

  const childId = String(child.id)
  const parentId = String(child.parentId)
  const available = earned - spent

  const loadData = useCallback(async () => {
    try {
      const [starsRes, spentRes, pendingRes] = await Promise.all([
        fetch(`/api/rewards/calculate?childId=${childId}&parentId=${parentId}`),
        fetch(`/api/rewards/spent?childId=${childId}`),
        fetch(`/api/rewards/redeem?childId=${childId}`),
      ])

      if (starsRes.ok) {
        const d = await starsRes.json()
        setEarned(d.totalStars ?? 0)
        setBreakdown({
          activities: d.breakdown?.completedScheduleCount ?? d.breakdown?.scheduleActivities ?? 0,
          medications: d.breakdown?.takenMedicationCount ?? d.breakdown?.medicationLogs ?? 0,
        })
      }
      if (spentRes.ok) {
        const d = await spentRes.json()
        setSpent(d.spent ?? 0)
      }
      if (pendingRes.ok) {
        const d = await pendingRes.json()
        setPendingRequests(d.requests ?? [])
      }
    } catch (e) {
      console.error("Error loading reward data:", e)
    } finally {
      setLoading(false)
    }
  }, [childId, parentId])

  useEffect(() => { loadData() }, [loadData])

  const isPending = (rewardId: string) => pendingRequests.some(r => r.rewardId === rewardId)

  const handleRequest = async (reward: RewardItem) => {
    if (available < reward.stars || isPending(reward.id) || requestingId) return
    setRequestingId(reward.id)
    setPostError(null)
    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          rewardId: reward.id,
          rewardTitle: reward.title,
          rewardStars: reward.stars,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (res.ok) {
        setSuccessId(reward.id)
        setTimeout(() => setSuccessId(null), 2000)
        await loadData()
        setTab("pending")
      } else {
        console.error("Reward request failed:", res.status, body)
        setPostError(body.error ?? `Lỗi ${res.status} — thử lại nhé`)
        setTimeout(() => setPostError(null), 4000)
      }
    } catch (e) {
      console.error("Error requesting reward:", e)
      setPostError("Không kết nối được máy chủ")
      setTimeout(() => setPostError(null), 4000)
    } finally {
      setRequestingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent" />
      </div>
    )
  }

  const level = Math.floor(earned / 50) + 1
  const levelStart = (level - 1) * 50
  const levelEnd = level * 50
  const levelPct = Math.min(100, Math.round(((earned - levelStart) / (levelEnd - levelStart)) * 100))

  return (
    <div className="space-y-4">
      {/* Stars hero card */}
      <div className="bg-white/95 rounded-3xl p-5 shadow-xl">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 rounded-full px-4 py-1.5 text-sm font-bold mb-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            Kho sao của {child.name}
          </div>
          <div className="text-6xl font-black text-yellow-500 leading-none">
            {available}
          </div>
          <p className="text-gray-500 text-sm mt-1">sao khả dụng</p>
          {spent > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{earned} kiếm được − {spent} đã dùng</p>
          )}
        </div>

        {/* Level progress */}
        <div className="bg-gray-50 rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600">Cấp {level}</span>
            <span className="text-xs text-gray-500">{levelEnd - earned} sao lên cấp {level + 1}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-700"
              style={{ width: `${levelPct}%` }}
            />
          </div>
        </div>

        {/* Breakdown pills */}
        <div className="flex gap-2 mt-3">
          <div className="flex-1 flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
            <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-blue-500">Bài học</p>
              <p className="text-sm font-bold text-blue-700">{breakdown.activities} × +5⭐</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
            <Pill className="w-4 h-4 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-green-500">Uống thuốc</p>
              <p className="text-sm font-bold text-green-700">{breakdown.medications} × +10⭐</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error toast */}
      {postError && (
        <div className="bg-red-100 border border-red-300 rounded-2xl px-4 py-3 text-center">
          <p className="text-red-700 text-sm font-medium">{postError}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white/30 rounded-2xl p-1 gap-1">
        {([
          { key: "shop", label: "Đổi thưởng", icon: Gift },
          { key: "earn", label: "Kiếm sao", icon: Star },
          { key: "pending", label: `Đang chờ${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ""}`, icon: Clock },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === key
                ? "bg-white text-sky-700 shadow-sm"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Shop tab */}
      {tab === "shop" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEFAULT_REWARDS.map((reward) => {
            const canAfford = available >= reward.stars
            const pending = isPending(reward.id)
            const isRequesting = requestingId === reward.id
            const isSuccess = successId === reward.id

            return (
              <div
                key={reward.id}
                className={`bg-white/95 rounded-2xl p-4 shadow-lg border-2 transition-all ${
                  pending
                    ? "border-amber-300 bg-amber-50/90"
                    : canAfford
                    ? "border-green-200 hover:border-green-400"
                    : "border-gray-200 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-3xl">{reward.emoji}</div>
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 rounded-full px-2.5 py-1 text-xs font-bold">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {reward.stars}
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{reward.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{reward.description}</p>

                <button
                  onClick={() => handleRequest(reward)}
                  disabled={!canAfford || pending || isRequesting}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isSuccess
                      ? "bg-green-500 text-white"
                      : pending
                      ? "bg-amber-100 text-amber-600 cursor-default"
                      : canAfford
                      ? "bg-sky-500 hover:bg-sky-600 text-white"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSuccess ? (
                    <><CheckCircle className="w-4 h-4" /> Đã gửi yêu cầu!</>
                  ) : pending ? (
                    <><Clock className="w-4 h-4" /> Đang chờ ba mẹ duyệt</>
                  ) : isRequesting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : canAfford ? (
                    <><Gift className="w-4 h-4" /> Yêu cầu đổi</>
                  ) : (
                    `Cần thêm ${reward.stars - available} sao`
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Earn tab */}
      {tab === "earn" && (
        <div className="bg-white/95 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Cách kiếm sao</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📚</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Hoàn thành bài học</p>
                  <p className="text-xs text-gray-500">Mỗi môn học trong thời khóa biểu</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 rounded-full px-3 py-1.5 font-black text-sm">
                +5 <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">💊</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Uống thuốc đúng giờ</p>
                  <p className="text-xs text-gray-500">Mỗi lần uống thuốc đúng lịch</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-green-50 text-green-700 rounded-full px-3 py-1.5 font-black text-sm">
                +10 <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-4 bg-gray-50">
              <p className="text-xs text-gray-500">Sao tích lũy không hết hạn — dùng bất cứ lúc nào!</p>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* Pending tab */}
      {tab === "pending" && (
        <div className="space-y-3">
          {pendingRequests.length === 0 ? (
            <div className="bg-white/95 rounded-2xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-3">🎁</div>
              <p className="text-gray-500 font-medium">Chưa có yêu cầu nào đang chờ</p>
              <p className="text-gray-400 text-sm mt-1">Chọn quà và gửi yêu cầu nhé!</p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div key={req.actionId} className="bg-white/95 rounded-2xl shadow-lg p-4 border-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{req.rewardTitle}</p>
                    <p className="text-xs text-amber-600">Đang chờ ba mẹ xác nhận...</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 rounded-full px-2.5 py-1 text-xs font-bold flex-shrink-0">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {req.rewardStars}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
