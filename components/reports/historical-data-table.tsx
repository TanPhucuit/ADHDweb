"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ArrowUpDown, Filter } from "lucide-react"

interface HistoricalDataTableProps {
  parentId: string
}

interface ParentAction {
  id: number
  parentid: number
  action_label: string
  timestamp: string
}

interface HistoricalData {
  id: string
  date: string
  time: string
  actionLabel: string
  actionName: string
  status: "focused" | "distracted" | "break"
}

export function HistoricalDataTable({ parentId }: HistoricalDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof HistoricalData>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [actions, setActions] = useState<ParentAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActions = async () => {
      if (!parentId) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        const response = await fetch(`/api/parent/actions/list?parentId=${parentId}`)
        if (response.ok) {
          const data = await response.json()
          setActions(data.actions || [])
        }
      } catch (error) {
        console.error('Error fetching actions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActions()
  }, [parentId])

  // Map action labels to Vietnamese names
  const actionLabelMap: Record<string, string> = {
    'nhac-tap-trung': 'Nhắc nhở tập trung',
    'khen-ngoi': 'Khen ngợi',
    'dong-vien': 'Động viên',
    'nghi-giai-lao': 'Nghỉ giải lao',
  }

  // Determine status based on action label
  const getStatusFromAction = (label: string): "focused" | "distracted" | "break" => {
    if (label === 'nhac-tap-trung') return 'distracted'
    if (label === 'nghi-giai-lao') return 'break'
    return 'focused'
  }

  const historicalData: HistoricalData[] = actions.map((action) => {
    const timestamp = new Date(action.timestamp)
    const date = timestamp.toISOString().split('T')[0]
    const time = timestamp.toTimeString().substring(0, 5)

    return {
      id: action.id ? String(action.id) : `action-${Date.now()}`,
      date,
      time,
      actionLabel: action.action_label,
      actionName: actionLabelMap[action.action_label] || action.action_label,
      status: getStatusFromAction(action.action_label),
    }
  })

  const filteredData = historicalData.filter(
    (item) =>
      item.actionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                <TableHead>Hành động</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : sortedData.length > 0 ? (
                sortedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{new Date(item.date).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.actionName}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    {actions.length === 0 ? "Chưa có dữ liệu hành động nào" : "Không có dữ liệu phù hợp"}
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
