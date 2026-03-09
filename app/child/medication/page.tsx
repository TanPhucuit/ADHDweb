"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Pill, CheckCircle, Clock, Star, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Medication {
  id: string | number
  medicationName: string
  dosage: string
  scheduledTime: string
  status: "pending" | "taken" | "missed"
  notes?: string
}

export default function ChildMedicationPage() {
  const router = useRouter()
  const [childId, setChildId] = useState<string | null>(null)
  const [childName, setChildName] = useState("bé")
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [takingId, setTakingId] = useState<string | number | null>(null)
  const [starPops, setStarPops] = useState<Set<string | number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Auth from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("adhd-dashboard-user")
    if (!stored) { router.push("/"); return }
    try {
      const u = JSON.parse(stored)
      if (!u.id || u.role !== "child") { router.push("/"); return }
      setChildId(String(u.childid || u.id))
      setChildName(u.name || "bé")
    } catch {
      router.push("/")
    }
  }, [router])

  const loadMedications = useCallback(async () => {
    if (!childId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/medication?childId=${childId}`)
      if (!res.ok) throw new Error("Không tải được dữ liệu")
      const json = await res.json()
      setMedications(json.data ?? [])
    } catch (e) {
      setError("Không thể tải lịch thuốc. Kiểm tra kết nối và thử lại.")
    } finally {
      setLoading(false)
    }
  }, [childId])

  useEffect(() => { loadMedications() }, [loadMedications])

  const handleTaken = async (med: Medication) => {
    if (takingId || med.status === "taken") return
    setTakingId(med.id)
    try {
      const res = await fetch("/api/medication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: med.id, status: "taken" }),
      })
      if (!res.ok) throw new Error("Lỗi cập nhật")

      // Optimistic update
      setMedications(prev => prev.map(m => m.id === med.id ? { ...m, status: "taken" } : m))

      // Star pop animation
      setStarPops(prev => new Set([...prev, med.id]))
      setTimeout(() => setStarPops(prev => {
        const next = new Set(prev)
        next.delete(med.id)
        return next
      }), 2500)
    } catch {
      // Reload to get accurate state
      await loadMedications()
    } finally {
      setTakingId(null)
    }
  }

  const takenCount = medications.filter(m => m.status === "taken").length
  const totalCount = medications.length
  const pendingCount = medications.filter(m => m.status === "pending").length
  const allTaken = totalCount > 0 && takenCount === totalCount

  const fmtTime = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) }
    catch { return iso }
  }

  if (!childId) return null

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #fdf4ff 0%, #eff6ff 50%, #f0fdf4 100%)" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/child" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-black text-gray-800">Nhắc nhở uống thuốc</h1>
            <p className="text-sm text-gray-500">Uống đúng giờ để khỏe mạnh nhé! 💊</p>
          </div>
          <button
            onClick={loadMedications}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Summary banner */}
        {!loading && totalCount > 0 && (
          <div className={`rounded-2xl p-4 text-center shadow-sm ${allTaken ? 'bg-green-500 text-white' : 'bg-white border-2 border-purple-200'}`}>
            {allTaken ? (
              <>
                <div className="text-4xl mb-1">🎉</div>
                <p className="font-black text-lg">Tuyệt vời! Đã uống đủ thuốc hôm nay!</p>
                <p className="text-sm opacity-90 mt-0.5">+{totalCount * 10} ⭐ đã được cộng vào kho sao</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="text-3xl font-black text-purple-600">{takenCount}/{totalCount}</div>
                  <Pill className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-gray-700 font-semibold">
                  {pendingCount > 0
                    ? `Còn ${pendingCount} thuốc chưa uống hôm nay`
                    : "Tất cả đã uống rồi!"}
                </p>
                <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2.5">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-700"
                    style={{ width: `${totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0}%` }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-400 border-t-transparent" />
            <p className="text-gray-500 text-sm">Đang tải lịch thuốc...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && totalCount === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <p className="font-bold text-gray-700 text-lg">Hôm nay không có thuốc!</p>
            <p className="text-gray-400 text-sm mt-1">Ba mẹ chưa thiết lập lịch thuốc nào.</p>
          </div>
        )}

        {/* Medication cards */}
        {!loading && medications.map(med => {
          const isTaken = med.status === "taken"
          const isThisTaking = takingId === med.id
          const showStar = starPops.has(med.id)

          return (
            <div
              key={med.id}
              className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 overflow-hidden ${
                isTaken ? 'border-green-300 bg-green-50/50' : 'border-purple-200 hover:border-purple-400'
              }`}
            >
              {/* Star pop animation */}
              {showStar && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="animate-bounce text-5xl">⭐</div>
                  <div className="absolute top-3 right-4 text-green-600 font-black text-xl animate-pulse">+10 sao!</div>
                </div>
              )}

              <div className={`p-4 ${showStar ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    isTaken ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {isTaken
                      ? <CheckCircle className="w-7 h-7 text-green-500" />
                      : <Pill className="w-7 h-7 text-purple-500" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-base truncate">
                      {med.medicationName || `Thuốc #${med.id}`}
                    </h3>
                    {med.dosage && (
                      <p className="text-sm text-purple-600 font-medium">{med.dosage}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">{fmtTime(med.scheduledTime)}</span>
                    </div>
                    {med.notes && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{med.notes}</p>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {isTaken ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-bold text-green-600 px-3 py-1.5 bg-green-100 rounded-xl">Đã uống ✓</span>
                        <span className="text-xs text-green-500 font-semibold">+10 ⭐</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleTaken(med)}
                        disabled={isThisTaking || !!takingId}
                        className="flex flex-col items-center gap-0.5 bg-gradient-to-b from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-60 text-white font-bold px-4 py-3 rounded-2xl text-sm transition-all active:scale-95 shadow-md"
                      >
                        {isThisTaking ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <span>Đã uống!</span>
                            <span className="text-xs opacity-80 font-normal flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />+10
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Reward reminder */}
        {!loading && totalCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="text-sm font-bold text-yellow-800">Mỗi lần uống thuốc đúng giờ = +10 ⭐</p>
              <p className="text-xs text-yellow-600 mt-0.5">Tích sao để đổi quà từ ba mẹ nhé!</p>
            </div>
            <Link
              href="/child/rewards"
              className="ml-auto text-xs font-bold text-yellow-700 bg-yellow-100 hover:bg-yellow-200 px-3 py-1.5 rounded-xl transition-colors flex-shrink-0"
            >
              Xem quà →
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
