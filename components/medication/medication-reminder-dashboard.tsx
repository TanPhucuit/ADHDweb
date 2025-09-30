"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Pill, Plus, Settings, CheckCircle, XCircle, AlertTriangle, Heart, Star } from "lucide-react"
import type { MedicationReminder, MedicationLog, MedicationSettings } from "@/lib/types"
import { dataStore } from "@/lib/data-store"

interface MedicationReminderDashboardProps {
  childId: string
  isParentView?: boolean
}

export function MedicationReminderDashboard({ childId, isParentView = false }: MedicationReminderDashboardProps) {
  const [reminders, setReminders] = useState<MedicationReminder[]>([])
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([])
  const [settings, setSettings] = useState<MedicationSettings | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [newReminder, setNewReminder] = useState<Partial<MedicationReminder>>({
    medicationName: "",
    dosage: "",
    frequency: "daily",
    times: ["08:00"],
    startDate: new Date().toISOString().split("T")[0],
    isActive: true,
    notes: "",
  })

  useEffect(() => {
    loadData()
    // Set up interval to check for due medications
    const interval = setInterval(checkForDueMedications, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [childId])

  const loadData = async () => {
    try {
      const [remindersData, logsData, settingsData] = await Promise.all([
        dataStore.getMedicationReminders(childId),
        dataStore.getTodayMedicationLogs(childId),
        dataStore.getMedicationSettings(childId),
      ])
      setReminders(remindersData)
      setTodayLogs(logsData)
      setSettings(settingsData)
    } catch (error) {
      console.error("Error loading medication data:", error)
    }
  }

  const checkForDueMedications = async () => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    for (const reminder of reminders) {
      if (!reminder.isActive) continue

      for (const time of reminder.times) {
        const [hours, minutes] = time.split(":").map(Number)
        const reminderTime = new Date()
        reminderTime.setHours(hours, minutes, 0, 0)

        const timeDiff = reminderTime.getTime() - now.getTime()
        const advanceMs = (settings?.reminderAdvanceMinutes || 5) * 60 * 1000

        // Check if it's time to send reminder
        if (Math.abs(timeDiff) <= advanceMs) {
          const existingLog = todayLogs.find(
            (log) =>
              log.reminderId === reminder.id &&
              log.scheduledTime.getHours() === hours &&
              log.scheduledTime.getMinutes() === minutes,
          )

          if (!existingLog) {
            await sendMedicationReminder(reminder, time)
          }
        }
      }
    }
  }

  const sendMedicationReminder = async (reminder: MedicationReminder, time: string) => {
    try {
      // Create notification
      if (settings?.enablePushNotifications) {
        await dataStore.createNotification({
          userId: childId,
          type: "medication_reminder" as any,
          title: "Medication Reminder",
          message: `Time to take ${reminder.medicationName} (${reminder.dosage})`,
          read: false,
          createdAt: new Date(),
        })
      }

      // Play sound if enabled
      if (settings?.enableSoundAlerts) {
        const audio = new Audio("/sounds/medication-reminder.mp3")
        audio.play().catch(console.error)
      }

      // Create medication log
      const [hours, minutes] = time.split(":").map(Number)
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, 0, 0)

      await dataStore.createMedicationLog({
        reminderId: reminder.id,
        childId,
        scheduledTime,
        status: "pending",
        reportedBy: "system",
        createdAt: new Date(),
      })

      loadData() // Refresh data
    } catch (error) {
      console.error("Error sending medication reminder:", error)
    }
  }

  const markMedicationTaken = async (logId: string, takenTime?: Date) => {
    try {
      await dataStore.updateMedicationLog(logId, {
        status: "taken",
        takenTime: takenTime || new Date(),
        reportedBy: isParentView ? "parent" : "child",
      })
      loadData()
    } catch (error) {
      console.error("Error marking medication as taken:", error)
    }
  }

  const addReminder = async () => {
    if (!newReminder.medicationName || !newReminder.dosage) return

    try {
      await dataStore.createMedicationReminder({
        ...newReminder,
        childId,
        createdBy: "parent", // In real app, get from auth
        createdAt: new Date(),
        updatedAt: new Date(),
      } as MedicationReminder)

      setNewReminder({
        medicationName: "",
        dosage: "",
        frequency: "daily",
        times: ["08:00"],
        startDate: new Date().toISOString().split("T")[0],
        isActive: true,
        notes: "",
      })
      setShowAddDialog(false)
      loadData()
    } catch (error) {
      console.error("Error adding medication reminder:", error)
    }
  }

  const updateSettings = async (newSettings: Partial<MedicationSettings>) => {
    try {
      await dataStore.updateMedicationSettings(childId, {
        ...settings,
        ...newSettings,
        updatedAt: new Date(),
      } as MedicationSettings)
      loadData()
      setShowSettingsDialog(false)
    } catch (error) {
      console.error("Error updating medication settings:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "taken":
        return "bg-green-100 text-green-800"
      case "missed":
        return "bg-red-100 text-red-800"
      case "delayed":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken":
        return <CheckCircle className="h-4 w-4" />
      case "missed":
        return <XCircle className="h-4 w-4" />
      case "delayed":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
              <Pill className="h-8 w-8 text-purple-600" />
            </div>
            <Heart className="h-6 w-6 text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {isParentView ? "Medication Reminders" : "Thuốc của bé"}
          </h2>
          <p className="text-gray-600">
            {isParentView
              ? "Manage medication schedules and track doses"
              : "Nhớ uống thuốc đúng giờ để khỏe mạnh nhé! 🌟"}
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
              >
                <Settings className="h-4 w-4 mr-2" />
                {isParentView ? "Settings" : "Cài đặt"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isParentView ? "Medication Settings" : "Cài đặt Thuốc"}</DialogTitle>
                <DialogDescription>
                  {isParentView ? "Configure reminder preferences" : "Thiết lập các thông báo nhắc nhở"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{isParentView ? "Reminder advance (minutes)" : "Thời gian nhắc nhở trước (phút)"}</Label>
                  <Input
                    type="number"
                    value={settings?.reminderAdvanceMinutes || 5}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev ? { ...prev, reminderAdvanceMinutes: Number.parseInt(e.target.value) } : null,
                      )
                    }
                    className="w-20"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{isParentView ? "Enable sound alerts" : "Bật thông báo âm thanh"}</Label>
                  <Switch
                    checked={settings?.enableSoundAlerts || false}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => (prev ? { ...prev, enableSoundAlerts: checked } : null))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{isParentView ? "Enable push notifications" : "Bật thông báo đẩy"}</Label>
                  <Switch
                    checked={settings?.enablePushNotifications || false}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => (prev ? { ...prev, enablePushNotifications: checked } : null))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{isParentView ? "Allow child to mark taken" : "Cho bé đánh dấu đã uống"}</Label>
                  <Switch
                    checked={settings?.allowChildToMarkTaken || false}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => (prev ? { ...prev, allowChildToMarkTaken: checked } : null))
                    }
                  />
                </div>
                <Button onClick={() => updateSettings(settings || ({} as MedicationSettings))} className="w-full">
                  {isParentView ? "Save Settings" : "Lưu Cài đặt"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {isParentView && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{isParentView ? "Add Medication Reminder" : "Thêm Thuốc"}</DialogTitle>
                  <DialogDescription>
                    {isParentView ? "Set up a new medication schedule" : "Đặt lịch uống thuốc mới"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{isParentView ? "Medication Name" : "Tên Thuốc"}</Label>
                    <Input
                      value={newReminder.medicationName}
                      onChange={(e) => setNewReminder((prev) => ({ ...prev, medicationName: e.target.value }))}
                      placeholder="e.g., Ritalin, Adderall"
                    />
                  </div>
                  <div>
                    <Label>{isParentView ? "Dosage" : "Liều lượng"}</Label>
                    <Input
                      value={newReminder.dosage}
                      onChange={(e) => setNewReminder((prev) => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 10mg, 1 tablet"
                    />
                  </div>
                  <div>
                    <Label>{isParentView ? "Frequency" : "Tần suất"}</Label>
                    <Select
                      value={newReminder.frequency}
                      onValueChange={(value) => setNewReminder((prev) => ({ ...prev, frequency: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{isParentView ? "Once daily" : "Mỗi ngày"}</SelectItem>
                        <SelectItem value="twice_daily">{isParentView ? "Twice daily" : "Ngày 2 lần"}</SelectItem>
                        <SelectItem value="three_times_daily">
                          {isParentView ? "Three times daily" : "Ngày 3 lần"}
                        </SelectItem>
                        <SelectItem value="weekly">{isParentView ? "Weekly" : "Hàng tuần"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{isParentView ? "Times" : "Giờ uống"}</Label>
                    {newReminder.times?.map((time, index) => (
                      <Input
                        key={index}
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...(newReminder.times || [])]
                          newTimes[index] = e.target.value
                          setNewReminder((prev) => ({ ...prev, times: newTimes }))
                        }}
                        className="mt-1"
                      />
                    ))}
                  </div>
                  <div>
                    <Label>{isParentView ? "Notes (Optional)" : "Ghi chú (Tùy chọn)"}</Label>
                    <Textarea
                      value={newReminder.notes}
                      onChange={(e) => setNewReminder((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Special instructions, side effects to watch for..."
                    />
                  </div>
                  <Button onClick={addReminder} className="w-full">
                    {isParentView ? "Add Reminder" : "Thêm Nhắc nhở"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-purple-100 to-pink-100">
          <TabsTrigger value="today" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
            {isParentView ? "Today's Medications" : "Hôm nay 📅"}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
            {isParentView ? "All Reminders" : "Lịch uống thuốc 📋"}
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
            {isParentView ? "History" : "Lịch sử 📊"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {todayLogs.length === 0 ? (
            <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-fit mx-auto mb-4">
                    <Pill className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {isParentView ? "No medications scheduled for today" : "Hôm nay không có thuốc nào! 🎉"}
                  </h3>
                  <p className="text-gray-600">
                    {isParentView ? "All set for today!" : "Bé được nghỉ ngơi hôm nay rồi!"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {todayLogs.map((log) => {
                const reminder = reminders.find((r) => r.id === log.reminderId)
                if (!reminder) return null

                return (
                  <Card
                    key={log.id}
                    className="border-l-4 border-l-purple-400 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                          <Pill className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">{reminder.medicationName}</h3>
                          <p className="text-purple-600 font-medium">{reminder.dosage}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              {isParentView ? "Scheduled:" : "Giờ uống:"}{" "}
                              {log.scheduledTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(log.status)} px-3 py-1 text-sm font-medium`}>
                          {getStatusIcon(log.status)}
                          <span className="ml-2">
                            {isParentView
                              ? log.status
                              : log.status === "taken"
                                ? "Đã uống ✅"
                                : log.status === "missed"
                                  ? "Bỏ lỡ ❌"
                                  : log.status === "delayed"
                                    ? "Trễ giờ ⏰"
                                    : "Chưa uống 🔔"}
                          </span>
                        </Badge>
                        {log.status === "pending" && (settings?.allowChildToMarkTaken || isParentView) && (
                          <Button
                            size="sm"
                            onClick={() => markMedicationTaken(log.id)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                          >
                            {isParentView ? "Mark Taken" : "Đã uống! 🎉"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          {reminders.length === 0 ? (
            <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-fit mx-auto mb-4">
                    <Calendar className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {isParentView ? "No medication reminders set up" : "Chưa có lịch uống thuốc"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isParentView
                      ? "Get started by adding your first medication"
                      : "Hãy nhờ bố mẹ thiết lập lịch uống thuốc nhé!"}
                  </p>
                  {isParentView && (
                    <Button
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      onClick={() => setShowAddDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Medication
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reminders.map((reminder) => (
                <Card
                  key={reminder.id}
                  className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-blue-400"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                          <Pill className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-gray-800">{reminder.medicationName}</CardTitle>
                          <CardDescription className="text-blue-600 font-medium">{reminder.dosage}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={reminder.isActive ? "default" : "secondary"} className="px-3 py-1">
                        {reminder.isActive ? (
                          <>
                            <Star className="h-3 w-3 mr-1" />
                            {isParentView ? "Active" : "Đang dùng"}
                          </>
                        ) : isParentView ? (
                          "Inactive"
                        ) : (
                          "Tạm dừng"
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {isParentView
                            ? `${(reminder.frequency || "daily").replace("_", " ")} at ${(reminder.times || []).join(", ")}`
                            : `${
                                reminder.frequency === "daily"
                                  ? "Mỗi ngày"
                                  : reminder.frequency === "twice_daily"
                                    ? "Ngày 2 lần"
                                    : reminder.frequency === "three_times_daily"
                                      ? "Ngày 3 lần"
                                      : "Hàng tuần"
                              } 
                             lúc ${(reminder.times || []).join(", ")}`}
                        </span>
                      </div>
                      {reminder.notes && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>{isParentView ? "Notes:" : "Ghi chú:"}</strong> {reminder.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                {isParentView ? "Medication History" : "Lịch sử uống thuốc"}
              </CardTitle>
              <CardDescription>
                {isParentView ? "Track medication adherence over time" : "Xem lại những lần đã uống thuốc"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full w-fit mx-auto mb-4">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-gray-600">
                  {isParentView ? "History view coming soon..." : "Tính năng này sẽ có sớm thôi! 🚀"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
