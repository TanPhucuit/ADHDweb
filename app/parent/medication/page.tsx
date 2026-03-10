"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardHeader } from "@/components/parent/dashboard-header"
import { ChildSelector } from "@/components/parent/child-selector"
import { GoBackButton } from "@/components/ui/go-back-button"
import { Pill, Plus, Trash2, RefreshCw, RotateCcw, Clock, CheckCircle, AlertCircle, X, Calendar } from "lucide-react"
import type { Child } from "@/lib/types"

function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const stored = localStorage.getItem("adhd-dashboard-user")
    if (stored) {
      try {
        const u = JSON.parse(stored)
        if (u.id && u.role && u.email) setUser(u)
      } catch {}
    }
    setLoading(false)
  }, [])
  return { user, loading }
}

interface Medication {
  id: string | number
  medicationName: string
  dosage: string
  scheduledTime: string
  status: "pending" | "taken" | "missed"
  notes?: string
  daysOfWeek?: string
  session?: string
}

const DAYS = [
  { label: "T2", value: 1 },
  { label: "T3", value: 2 },
  { label: "T4", value: 3 },
  { label: "T5", value: 4 },
  { label: "T6", value: 5 },
  { label: "T7", value: 6 },
  { label: "CN", value: 0 },
]

const SESSIONS = [
  { label: "Buổi sáng", value: "morning" },
  { label: "Buổi chiều", value: "afternoon" },
  { label: "Buổi tối", value: "evening" },
]

const ALL_DAYS = "0,1,2,3,4,5,6"
const emptyForm = {
  medicationName: "",
  dosage: "1 viên",
  time: "08:00",
  notes: "",
  daysOfWeek: ALL_DAYS,
  session: "morning",
}

function parseDays(str: string): number[] {
  return (str || ALL_DAYS).split(",").map(Number).filter(n => !isNaN(n))
}

function formatDays(days: number[]): string {
  if (days.length === 7) return "Mỗi ngày"
  const labels = DAYS.filter(d => days.includes(d.value)).map(d => d.label)
  return labels.length > 0 ? labels.join(", ") : "Không có ngày"
}

function sessionLabel(s?: string) {
  return SESSIONS.find(x => x.value === s)?.label || "Buổi sáng"
}

export default function ParentMedicationPage() {
  const { user, loading: authLoading } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [fetching, setFetching] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Load children
  useEffect(() => {
    if (!user) return
    fetch(`/api/parent/children?parentId=${user.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list = d?.data || d?.children || []
        setChildren(list)
        if (list.length > 0) setSelectedChild(list[0])
      })
      .catch(() => {})
  }, [user])

  const childId = selectedChild ? String((selectedChild as any).id ?? (selectedChild as any).childid) : null

  const loadMedications = useCallback(async () => {
    if (!childId) return
    setFetching(true)
    setError(null)
    try {
      const res = await fetch(`/api/medication?childId=${childId}`)
      const json = await res.json()
      setMedications(json.data ?? [])
    } catch {
      setError("Không tải được danh sách thuốc")
    } finally {
      setFetching(false)
    }
  }, [childId])

  useEffect(() => { loadMedications() }, [loadMedications])

  const toast = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const toggleDay = (dayValue: number) => {
    const current = parseDays(form.daysOfWeek)
    const next = current.includes(dayValue)
      ? current.filter(d => d !== dayValue)
      : [...current, dayValue]
    setForm(f => ({ ...f, daysOfWeek: next.sort((a, b) => a - b).join(",") }))
  }

  const toggleAllDays = () => {
    const current = parseDays(form.daysOfWeek)
    setForm(f => ({ ...f, daysOfWeek: current.length === 7 ? "" : ALL_DAYS }))
  }

  const handleAdd = async () => {
    if (!childId || !form.medicationName.trim()) return
    if (parseDays(form.daysOfWeek).length === 0) {
      setError("Vui lòng chọn ít nhất 1 ngày trong tuần")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/medication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          medicationName: form.medicationName.trim(),
          dosage: form.dosage.trim() || "1 viên",
          time: form.time + ":00",
          notes: form.notes.trim() || undefined,
          daysOfWeek: form.daysOfWeek || ALL_DAYS,
          session: form.session,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setForm(emptyForm)
      setShowForm(false)
      await loadMedications()
      toast("Đã thêm thuốc mới!")
    } catch (e: any) {
      setError(e.message || "Không thêm được thuốc")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string | number) => {
    setDeletingId(id)
    try {
      await fetch(`/api/medication?id=${id}`, { method: "DELETE" })
      await loadMedications()
      toast("Đã xoá thuốc")
    } catch {
      setError("Không xoá được thuốc")
    } finally {
      setDeletingId(null)
    }
  }

  const handleResetAll = async () => {
    if (!childId) return
    setResetting(true)
    try {
      await fetch("/api/medication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, action: "reset_all" }),
      })
      await loadMedications()
      toast("Đã đặt lại trạng thái thuốc cho ngày mới!")
    } catch {
      setError("Không đặt lại được")
    } finally {
      setResetting(false)
    }
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  }

  if (!user || user.role !== "parent") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center"><div className="text-4xl mb-4">🚫</div><p className="text-gray-600">Trang này chỉ dành cho phụ huynh</p></div>
      </div>
    )
  }

  const takenCount = medications.filter(m => m.status === "taken").length
  const selectedDays = parseDays(form.daysOfWeek)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-6 space-y-5 max-w-2xl">
        <div className="flex items-center gap-3">
          <GoBackButton />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý thuốc</h1>
            <p className="text-sm text-gray-500">Thiết lập lịch uống thuốc theo tuần — tự động reset mỗi ngày</p>
          </div>
        </div>

        <ChildSelector children={children} selectedChild={selectedChild} onChildSelect={setSelectedChild} />

        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
            <CheckCircle className="w-4 h-4 flex-shrink-0" /> {successMsg}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {selectedChild && (
          <>
            {/* Summary + actions bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-bold text-gray-800 text-lg">
                  {takenCount}/{medications.length} thuốc đã uống hôm nay
                </p>
                <p className="text-sm text-gray-500">{selectedChild.name}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleResetAll}
                  disabled={resetting || medications.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <RotateCcw className={`w-4 h-4 ${resetting ? "animate-spin" : ""}`} />
                  Đặt lại hôm nay
                </button>
                <button
                  onClick={loadMedications}
                  disabled={fetching}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} />
                  Làm mới
                </button>
                <button
                  onClick={() => { setShowForm(v => !v); setError(null) }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Thêm thuốc
                </button>
              </div>
            </div>

            {/* Add form */}
            {showForm && (
              <div className="bg-white rounded-2xl shadow-sm border-2 border-purple-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-800">Thêm thuốc mới</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Tên thuốc *</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      placeholder="VD: Ritalin, Concerta..."
                      value={form.medicationName}
                      onChange={e => setForm(f => ({ ...f, medicationName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Liều dùng</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      placeholder="VD: 1 viên"
                      value={form.dosage}
                      onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Giờ uống</label>
                    <input
                      type="time"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      value={form.time}
                      onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    />
                  </div>

                  {/* Days of week */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-600">Uống vào các ngày *</label>
                      <button
                        type="button"
                        onClick={toggleAllDays}
                        className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                      >
                        {selectedDays.length === 7 ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {DAYS.map(day => {
                        const active = selectedDays.includes(day.value)
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDay(day.value)}
                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                              active
                                ? "bg-purple-600 text-white shadow-sm"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {day.label}
                          </button>
                        )
                      })}
                    </div>
                    {selectedDays.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">Chọn ít nhất 1 ngày</p>
                    )}
                  </div>

                  {/* Session */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 mb-2 block">Buổi uống</label>
                    <div className="flex gap-2">
                      {SESSIONS.map(s => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, session: s.value }))}
                          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                            form.session === s.value
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Ghi chú (tuỳ chọn)</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      placeholder="VD: Uống sau bữa ăn"
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                    Huỷ
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={saving || !form.medicationName.trim()}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Plus className="w-4 h-4" />}
                    Lưu thuốc
                  </button>
                </div>
              </div>
            )}

            {/* Medication list */}
            {fetching && medications.length === 0 ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-400 border-t-transparent" /></div>
            ) : medications.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                <div className="text-5xl mb-3">💊</div>
                <p className="font-bold text-gray-700 text-lg">Không có thuốc hôm nay</p>
                <p className="text-gray-400 text-sm mt-1">Nhấn "Thêm thuốc" để thiết lập lịch uống thuốc theo tuần cho con</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medications.map(med => {
                  const isTaken = med.status === "taken"
                  const isDeleting = deletingId === med.id
                  const fmtTime = (() => {
                    try { return new Date(med.scheduledTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) }
                    catch { return med.scheduledTime }
                  })()
                  const daysText = formatDays(parseDays(med.daysOfWeek || ALL_DAYS))
                  return (
                    <div key={med.id} className={`bg-white rounded-2xl shadow-sm border-2 p-4 transition-all ${isTaken ? "border-green-200 opacity-80" : "border-purple-100"}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isTaken ? "bg-green-100" : "bg-purple-100"}`}>
                          {isTaken ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Pill className="w-6 h-6 text-purple-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 truncate">{med.medicationName}</p>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className="text-xs text-purple-600 font-medium">{med.dosage}</span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" /> {fmtTime}
                            </span>
                            <span className="text-xs text-blue-500">{sessionLabel(med.session)}</span>
                            {med.notes && <span className="text-xs text-gray-400 truncate">{med.notes}</span>}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">{daysText}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isTaken ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                            {isTaken ? "Đã uống" : "Chưa uống"}
                          </span>
                          <button
                            onClick={() => handleDelete(med.id)}
                            disabled={isDeleting}
                            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            {isDeleting ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Info about auto-reset */}
            {medications.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
                <p className="font-semibold mb-0.5">Tự động reset mỗi ngày</p>
                <p className="text-blue-600">Trạng thái thuốc sẽ tự reset về "Chưa uống" vào đầu mỗi ngày theo lịch đã cài. Con chỉ thấy các thuốc được lên lịch cho ngày hôm nay.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
