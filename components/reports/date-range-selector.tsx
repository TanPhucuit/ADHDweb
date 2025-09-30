"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface DateRangeSelectorProps {
  selectedRange: string
  onRangeChange: (range: string) => void
}

export function DateRangeSelector({ selectedRange, onRangeChange }: DateRangeSelectorProps) {
  const [customDate, setCustomDate] = useState<Date>()

  const ranges = [
    { id: "today", label: "Hôm nay" },
    { id: "7days", label: "7 ngày qua" },
    { id: "30days", label: "30 ngày qua" },
    { id: "custom", label: "Tùy chỉnh" },
  ]

  const handleRangeChange = (rangeId: string) => {
    if (typeof onRangeChange === "function") {
      onRangeChange(rangeId)
    } else {
      console.warn("[v0] onRangeChange is not a function:", typeof onRangeChange)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Chọn khoảng thời gian</h2>
      <div className="flex flex-wrap items-center gap-3">
        {ranges.map((range) => (
          <Button
            key={range.id}
            variant={selectedRange === range.id ? "default" : "outline"}
            onClick={() => handleRangeChange(range.id)}
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {range.label}
          </Button>
        ))}

        {selectedRange === "custom" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent border-gray-300">
                <CalendarIcon className="w-4 h-4" />
                {customDate ? format(customDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={customDate} onSelect={setCustomDate} initialFocus />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}
