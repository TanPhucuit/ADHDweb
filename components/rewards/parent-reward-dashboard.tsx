"use client"

import { useState, useEffect, useCallback } from "react"
import { Star, BookOpen, Pill, CheckCircle, X, Clock, Gift, RefreshCw } from "lucide-react"
import type { Child } from "@/lib/types"
import { DEFAULT_REWARDS } from "@/lib/reward-catalog"

interface ParentRewardDashboardProps {
  child: Child
}

interface PendingRequest {
  actionId: string | number
  rewardId: string
  rewardTitle: string
  rewardStars: number
  requestedAt: string
}

interface RewardSummary {
  totalStars: number
  spent: number
  activities: number
  medications: number
}

export function ParentRewardDashboard({ child }: ParentRewardDashboardProps) {
  const [summary, setSummary] = useState<RewardSummary | null>(null)
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingId, setRespondingId] = useState<string | number | null>(null)
  const [respondedIds, setRespondedIds] = useState<Set<string | number>>(new Set())
  const [tab, setTab] = useState<"pending" | "catalog" | "stats">("pending")

  const childId = String(child.id ?? (child as any).childid)
  const parentId = String((child as any).parentId ?? (child as any).parentid)

  const loadData = useCallback(async () => {
    try {
      const [starsRes, spentRes, pendingRes] = await Promise.all([
        fetch(`/api/rewards/calculate?childId=${childId}&parentId=${parentId}`),
        fetch(`/api/rewards/spent?childId=${childId}`),
        fetch(`/api/rewards/redeem?childId=${childId}`),
      ])

      let totalStars = 0, spent = 0, activities = 0, medications = 0

      if (starsRes.ok) {
        const d = await starsRes.json()
        totalStars = d.totalStars ?? 0
        activities = d.breakdown?.completedScheduleCount ?? d.breakdown?.scheduleActivities ?? 0
        medications = d.breakdown?.takenMedicationCount ?? d.breakdown?.medicationLogs ?? 0
      }
      if (spentRes.ok) {
        const d = await spentRes.json()
        spent = d.spent ?? 0
      }

      setSummary({ totalStars, spent, activities, medications })

      if (pendingRes.ok) {
        const d = await pendingRes.json()
        setPendingRequests(
          (d.requests ?? []).filter((r: PendingRequest) => !respondedIds.has(r.actionId))
        )
      }
    } catch (e) {
      console.error("Error loading parent reward data:", e)
    } finally {
      setLoading(false)
    }
  }, [childId, parentId, respondedIds])

  useEffect(() => { loadData() }, [childId]) // reload when child changes

  const handleRespond = async (req: PendingRequest, approved: boolean) => {
    if (respondingId) return
    setRespondingId(req.actionId)
    try {
      await fetch('/api/rewards/redeem/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          rewardId: req.rewardId,
          rewardTitle: req.rewardTitle,
          rewardStars: req.rewardStars,
          approved,
        }),
      })
      setRespondedIds(prev => new Set([...prev, req.actionId]))
      setPendingRequests(prev => prev.filter(r => r.actionId !== req.actionId))
      if (approved) await loadData() // refresh stars to reflect spent change
    } catch (e) {
      console.error("Error responding to reward request:", e)
    } finally {
      setRespondingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  const available = (summary?.totalStars ?? 0) - (summary?.spent ?? 0)
  const level = Math.floor((summary?.totalStars ?? 0) / 50) + 1

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 text-lg">
            Kho sao của {child.name}
          </h2>
          <button
            onClick={loadData}
            className="p-2 rounded-xl hover:bg-white/60 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-black text-yellow-500">{summary?.totalStars ?? 0}</div>
            <p className="text-xs text-gray-500 mt-0.5">Tổng sao kiếm</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-black text-indigo-500">{available}</div>
            <p className="text-xs text-gray-500 mt-0.5">Sao khả dụng</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1 text-blue-500">
              <BookOpen className="w-4 h-4" />
              <span className="text-2xl font-black">{summary?.activities ?? 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Bài học hoàn thành</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1 text-green-500">
              <Pill className="w-4 h-4" />
              <span className="text-2xl font-black">{summary?.medications ?? 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Lần uống thuốc</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          Cấp {level} &nbsp;·&nbsp; {summary?.spent ?? 0} sao đã đổi thưởng
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
        {([
          { key: "pending", label: "Yêu cầu đổi thưởng", badge: pendingRequests.length },
          { key: "catalog", label: "Danh sách quà" },
          { key: "stats", label: "Quy tắc điểm" },
        ] as const).map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors relative ${
              tab === key
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
            {badge != null && badge > 0 && (
              <span className="absolute -top-1.5 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending requests tab */}
      {tab === "pending" && (
        <div className="space-y-3">
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold text-gray-600">Không có yêu cầu nào đang chờ</p>
              <p className="text-sm text-gray-400 mt-1">Khi con yêu cầu đổi thưởng, sẽ hiện ở đây</p>
            </div>
          ) : (
            pendingRequests.map((req) => {
              const reward = DEFAULT_REWARDS.find(r => r.id === req.rewardId)
              const isResponding = respondingId === req.actionId
              const canAfford = available >= req.rewardStars

              return (
                <div key={req.actionId} className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{reward?.emoji ?? "🎁"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800">{req.rewardTitle}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600 font-semibold">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {req.rewardStars} sao
                        </span>
                        {!canAfford && (
                          <span className="text-xs text-red-500 font-medium">
                            (con thiếu {req.rewardStars - available} sao)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 rounded-full px-2.5 py-1 text-xs font-semibold">
                        <Clock className="w-3 h-3" /> Đang chờ
                      </span>
                    </div>
                  </div>

                  {isResponding ? (
                    <div className="flex justify-center py-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent" />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(req, false)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-sm transition-colors border border-red-200"
                      >
                        <X className="w-4 h-4" /> Từ chối
                      </button>
                      <button
                        onClick={() => handleRespond(req, true)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> Đồng ý
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Catalog tab */}
      {tab === "catalog" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">Danh sách phần thưởng mặc định con có thể yêu cầu</p>
          </div>
          <div className="divide-y divide-gray-50">
            {DEFAULT_REWARDS.map((reward) => (
              <div key={reward.id} className="flex items-center gap-3 px-4 py-3">
                <div className="text-2xl w-9 text-center">{reward.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{reward.title}</p>
                  <p className="text-xs text-gray-400">{reward.description}</p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 rounded-full px-2.5 py-1 text-xs font-bold flex-shrink-0">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {reward.stars}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats / rules tab */}
      {tab === "stats" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-700">Quy tắc tích sao</p>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-lg">📚</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Hoàn thành bài học</p>
                  <p className="text-xs text-gray-400">Mỗi môn học trong thời khóa biểu</p>
                </div>
              </div>
              <span className="font-black text-blue-600">+5 ⭐</span>
            </div>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-lg">💊</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Uống thuốc đúng giờ</p>
                  <p className="text-xs text-gray-400">Mỗi lần uống thuốc đúng lịch</p>
                </div>
              </div>
              <span className="font-black text-green-600">+10 ⭐</span>
            </div>
            <div className="px-4 py-4 bg-indigo-50">
              <p className="text-xs text-indigo-600 font-medium">
                Sao tích lũy không hết hạn. Khi đồng ý yêu cầu đổi thưởng, sao sẽ bị trừ tự động.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
