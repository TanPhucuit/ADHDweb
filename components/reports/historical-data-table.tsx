"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ArrowUpDown, Filter } from "lucide-react"
import type { FocusSession, DailyReport } from "@/lib/types"

interface HistoricalDataTableProps {
  sessions: FocusSession[]
  reports: DailyReport[]
}

interface HistoricalData {
  id: string
  date: string
  time: string
  activity: string
  focusScore: number
  heartRate: number
  interventions: number
  status: "focused" | "distracted" | "break"
}

export function HistoricalDataTable({ sessions, reports }: HistoricalDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof HistoricalData>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const historicalData: HistoricalData[] =
    sessions && sessions.length > 0
      ? sessions.map((session) => {
          const startTimeStr =
            typeof session.startTime === "string"
              ? session.startTime
              : session.startTime instanceof Date
                ? session.startTime.toISOString()
                : new Date().toISOString()

          const [datePart, timePart] = startTimeStr.split("T")

          return {
            id: session.id,
            date: datePart || "",
            time: timePart?.substring(0, 5) || "",
            activity: session.subject || 'Không xác định',
            focusScore: session.focusScore || 60,
            heartRate: 90, // Default heart rate
            interventions: 0, // Default to 0 since interventions might not exist
            status:
              (session.focusScore || 60) >= 70 ? "focused" : (session.focusScore || 60) >= 40 ? "distracted" : "break",
          }
        })
      : []

  const filteredData = historicalData.filter(
    (item) =>
      item.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.includes(searchTerm) ||
      item.time.includes(searchTerm),
  )

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const handleSort = (field: keyof HistoricalData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "focused":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Tập trung</Badge>
      case "distracted":
        return <Badge className="bg-red-100 text-red-700">Mất tập trung</Badge>
      case "break":
        return <Badge className="bg-gray-100 text-gray-700">Nghỉ ngơi</Badge>
      default:
        return <Badge className="border">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Dữ liệu lịch sử</CardTitle>
        <CardDescription>Chi tiết các phiên theo dõi với khả năng tìm kiếm và sắp xếp</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo hoạt động, ngày, giờ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="border border-gray-300 p-2">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Data Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    onClick={() => handleSort("date")}
                    className="h-auto p-0 font-medium hover:bg-transparent bg-transparent border-none"
                  >
                    Ngày
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    onClick={() => handleSort("time")}
                    className="h-auto p-0 font-medium hover:bg-transparent bg-transparent border-none"
                  >
                    Giờ
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Hoạt động</TableHead>
                <TableHead>
                  <Button
                    onClick={() => handleSort("focusScore")}
                    className="h-auto p-0 font-medium hover:bg-transparent bg-transparent border-none"
                  >
                    Điểm tập trung
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Nhịp tim</TableHead>
                <TableHead>Can thiệp</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length > 0 ? (
                sortedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{new Date(item.date).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.activity}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            item.focusScore >= 70
                              ? "text-primary"
                              : item.focusScore >= 40
                                ? "text-yellow-600"
                                : "text-destructive"
                          }`}
                        >
                          {item.focusScore > 0 ? `${item.focusScore}%` : "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{item.heartRate} BPM</TableCell>
                    <TableCell>
                      {item.interventions > 0 ? (
                        <Badge className="border text-xs">
                          {item.interventions}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {!sessions || sessions.length === 0 ? "Chưa có dữ liệu phiên học nào" : "Không có dữ liệu phù hợp"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground text-center">
          Hiển thị {sortedData.length} trong tổng số {historicalData.length} bản ghi
        </div>
      </CardContent>
    </Card>
  )
}
