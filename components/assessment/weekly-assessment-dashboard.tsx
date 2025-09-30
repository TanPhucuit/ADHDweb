"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Heart,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  Stethoscope,
} from "lucide-react"
import type { Child, WeeklyAssessment, ADHDSymptomTracking } from "@/lib/types"
import { dataStore } from "@/lib/data-store"

interface WeeklyAssessmentDashboardProps {
  child: Child
  isParentView?: boolean
}

export function WeeklyAssessmentDashboard({ child, isParentView = false }: WeeklyAssessmentDashboardProps) {
  const [currentAssessment, setCurrentAssessment] = useState<WeeklyAssessment | null>(null)
  const [previousAssessment, setPreviousAssessment] = useState<WeeklyAssessment | null>(null)
  const [symptomTracking, setSymptomTracking] = useState<ADHDSymptomTracking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssessmentData()
  }, [child.id])

  const loadAssessmentData = async () => {
    setLoading(true)

    const current = dataStore.getCurrentWeeklyAssessment(child.id)
    const previous = dataStore.getPreviousWeeklyAssessment(child.id)
    const symptoms = dataStore.getRecentSymptomTracking(child.id, 7)

    setCurrentAssessment(current)
    setPreviousAssessment(previous)
    setSymptomTracking(symptoms)
    setLoading(false)
  }

  const getSeverityLevel = (score: number) => {
    if (score <= 25) return { level: "Nhẹ", color: "bg-green-500", textColor: "text-green-700" }
    if (score <= 50) return { level: "Trung bình", color: "bg-yellow-500", textColor: "text-yellow-700" }
    if (score <= 75) return { level: "Nặng", color: "bg-orange-500", textColor: "text-orange-700" }
    return { level: "Rất nặng", color: "bg-red-500", textColor: "text-red-700" }
  }

  const getProgressColor = (current: number, previous?: number) => {
    if (!previous) return "text-gray-500"
    if (current > previous) return "text-green-600"
    if (current < previous) return "text-red-600"
    return "text-gray-500"
  }

  const getProgressIcon = (current: number, previous?: number) => {
    if (!previous) return null
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />
    return null
  }

  if (loading) {
    return <div className="text-center py-8">Đang tải dữ liệu đánh giá...</div>
  }

  if (!currentAssessment) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">Chưa có đánh giá tuần này</h3>
          <p className="text-muted-foreground mb-4">Hệ thống sẽ tự động tạo báo cáo đánh giá vào cuối tuần</p>
          {isParentView && (
            <Button onClick={() => dataStore.generateWeeklyAssessment(child.id)}>Tạo đánh giá ngay</Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const severity = getSeverityLevel(currentAssessment.adhdSeverityScore)

  return (
    <div className="space-y-6">
      {/* Overall Assessment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Đánh giá tổng quan tuần này
            <Badge variant="outline">
              {new Date(currentAssessment.weekStartDate).toLocaleDateString("vi-VN")} -{" "}
              {new Date(currentAssessment.weekEndDate).toLocaleDateString("vi-VN")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* ADHD Severity */}
            <div className="text-center">
              <div className="mb-2">
                <div className={`text-2xl font-bold ${severity.textColor}`}>
                  {currentAssessment.adhdSeverityScore}/100
                </div>
                <Badge className={severity.color}>{severity.level}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Mức độ ADHD</p>
              <div className="flex items-center justify-center mt-1">
                {getProgressIcon(currentAssessment.adhdSeverityScore, previousAssessment?.adhdSeverityScore)}
                <span
                  className={`text-xs ml-1 ${getProgressColor(
                    currentAssessment.adhdSeverityScore,
                    previousAssessment?.adhdSeverityScore,
                  )}`}
                >
                  {previousAssessment &&
                    `${currentAssessment.adhdSeverityScore > previousAssessment.adhdSeverityScore ? "+" : ""}${currentAssessment.adhdSeverityScore - previousAssessment.adhdSeverityScore}`}
                </span>
              </div>
            </div>

            {/* Focus Improvement */}
            <div className="text-center">
              <div className="mb-2">
                <div className="text-2xl font-bold text-blue-600">{currentAssessment.focusImprovementScore}/100</div>
              </div>
              <p className="text-sm text-muted-foreground">Cải thiện tập trung</p>
              <div className="flex items-center justify-center mt-1">
                {getProgressIcon(currentAssessment.focusImprovementScore, previousAssessment?.focusImprovementScore)}
                <span
                  className={`text-xs ml-1 ${getProgressColor(
                    currentAssessment.focusImprovementScore,
                    previousAssessment?.focusImprovementScore,
                  )}`}
                >
                  {previousAssessment &&
                    `${currentAssessment.focusImprovementScore > previousAssessment.focusImprovementScore ? "+" : ""}${currentAssessment.focusImprovementScore - previousAssessment.focusImprovementScore}`}
                </span>
              </div>
            </div>

            {/* Behavior Score */}
            <div className="text-center">
              <div className="mb-2">
                <div className="text-2xl font-bold text-green-600">{currentAssessment.behaviorScore}/100</div>
              </div>
              <p className="text-sm text-muted-foreground">Điểm hành vi</p>
              <div className="flex items-center justify-center mt-1">
                {getProgressIcon(currentAssessment.behaviorScore, previousAssessment?.behaviorScore)}
                <span
                  className={`text-xs ml-1 ${getProgressColor(
                    currentAssessment.behaviorScore,
                    previousAssessment?.behaviorScore,
                  )}`}
                >
                  {previousAssessment &&
                    `${currentAssessment.behaviorScore > previousAssessment.behaviorScore ? "+" : ""}${currentAssessment.behaviorScore - previousAssessment.behaviorScore}`}
                </span>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="text-center">
              <div className="mb-2">
                {currentAssessment.overallProgress === "excellent" && (
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                )}
                {currentAssessment.overallProgress === "good" && <Target className="w-8 h-8 text-blue-500 mx-auto" />}
                {currentAssessment.overallProgress === "fair" && (
                  <BarChart3 className="w-8 h-8 text-yellow-500 mx-auto" />
                )}
                {currentAssessment.overallProgress === "needs_attention" && (
                  <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">Tiến độ chung</p>
              <Badge variant="outline" className="mt-1">
                {currentAssessment.overallProgress === "excellent" && "Xuất sắc"}
                {currentAssessment.overallProgress === "good" && "Tốt"}
                {currentAssessment.overallProgress === "fair" && "Khá"}
                {currentAssessment.overallProgress === "needs_attention" && "Cần chú ý"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Recommendation Alert */}
      {currentAssessment.doctorRecommendation && (
        <Alert
          className={
            currentAssessment.doctorRecommendation === "urgent_consultation"
              ? "border-red-500 bg-red-50"
              : currentAssessment.doctorRecommendation === "schedule_consultation"
                ? "border-yellow-500 bg-yellow-50"
                : "border-blue-500 bg-blue-50"
          }
        >
          <Stethoscope className="h-4 w-4" />
          <AlertDescription>
            {currentAssessment.doctorRecommendation === "urgent_consultation" && (
              <div>
                <strong>Khuyến nghị khẩn cấp:</strong> Nên đặt lịch gặp bác sĩ chuyên khoa ngay để được tư vấn và điều
                chỉnh phương pháp hỗ trợ.
              </div>
            )}
            {currentAssessment.doctorRecommendation === "schedule_consultation" && (
              <div>
                <strong>Khuyến nghị:</strong> Nên đặt lịch gặp bác sĩ trong 1-2 tuần tới để đánh giá và điều chỉnh kế
                hoạch hỗ trợ.
              </div>
            )}
            {currentAssessment.doctorRecommendation === "continue_monitoring" && (
              <div>
                <strong>Tiếp tục theo dõi:</strong> Tình trạng đang ổn định, tiếp tục theo dõi và áp dụng các phương
                pháp hiện tại.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Nhận xét</TabsTrigger>
          <TabsTrigger value="symptoms">Triệu chứng</TabsTrigger>
          <TabsTrigger value="recommendations">Khuyến nghị</TabsTrigger>
        </TabsList>

        {/* Key Insights */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Những điểm chính trong tuần
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentAssessment.keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Symptom Tracking */}
        <TabsContent value="symptoms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theo dõi triệu chứng ADHD</CardTitle>
            </CardHeader>
            <CardContent>
              {symptomTracking.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Chưa có dữ liệu theo dõi triệu chứng trong tuần này
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Average Scores */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { key: "hyperactivityLevel", label: "Tăng động", color: "bg-red-500" },
                      { key: "inattentionLevel", label: "Mất tập trung", color: "bg-orange-500" },
                      { key: "impulsivityLevel", label: "Bốc đồng", color: "bg-yellow-500" },
                      { key: "emotionalRegulation", label: "Điều hòa cảm xúc", color: "bg-blue-500" },
                      { key: "socialInteraction", label: "Tương tác xã hội", color: "bg-green-500" },
                    ].map((symptom) => {
                      const avgScore =
                        symptomTracking.reduce((sum, s) => sum + s[symptom.key as keyof ADHDSymptomTracking], 0) /
                        symptomTracking.length
                      return (
                        <div key={symptom.key} className="text-center">
                          <div className="mb-2">
                            <div className="text-lg font-bold">{avgScore.toFixed(1)}/5</div>
                          </div>
                          <p className="text-xs text-muted-foreground">{symptom.label}</p>
                          <Progress value={(avgScore / 5) * 100} className="h-2 mt-1" />
                        </div>
                      )
                    })}
                  </div>

                  {/* Recent Entries */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Ghi chép gần đây:</h4>
                    {symptomTracking.slice(0, 3).map((entry) => (
                      <div key={entry.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">
                            {new Date(entry.date).toLocaleDateString("vi-VN")}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {entry.reportedBy === "parent"
                              ? "Phụ huynh"
                              : entry.reportedBy === "child"
                                ? "Trẻ"
                                : "Hệ thống"}
                          </Badge>
                        </div>
                        {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Khuyến nghị cho tuần tới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentAssessment.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>

              {isParentView && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium mb-3">Hành động được đề xuất:</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Calendar className="w-4 h-4 mr-2" />
                      Điều chỉnh lịch trình học tập
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Brain className="w-4 h-4 mr-2" />
                      Cập nhật mục tiêu tập trung
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Heart className="w-4 h-4 mr-2" />
                      Thêm hoạt động thư giãn
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
