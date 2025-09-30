"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Bell, TrendingUp } from "lucide-react"
import { useInterventionCount } from "@/hooks/use-intervention-count"

interface InterventionCounterProps {
  parentId?: string
}

export function InterventionCounter({ parentId }: InterventionCounterProps) {
  const { totalActions, todayActions, isLoading, error } = useInterventionCount(parentId)

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-purple-200 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-purple-200 rounded animate-pulse mb-2"></div>
              <div className="h-6 bg-purple-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-red-200 flex items-center justify-center">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Lỗi tải dữ liệu</h3>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-purple-200 flex items-center justify-center relative">
            <Bell className="w-6 h-6 text-purple-600" />
            {todayActions > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{todayActions > 9 ? '9+' : todayActions}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-purple-800 mb-1">
              Số lần can thiệp
            </h3>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-purple-900">
                {totalActions}
              </p>
              <div className="flex items-center text-xs text-purple-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>{todayActions} hôm nay</span>
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-1">
              {todayActions === 0 
                ? "Chưa có can thiệp nào hôm nay" 
                : todayActions > 5 
                  ? "Nhiều hơn bình thường" 
                  : "Trong mức bình thường"
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}