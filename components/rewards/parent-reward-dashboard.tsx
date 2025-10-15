"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Crown, Plus, Edit, Trash2, Save, X } from "lucide-react"
import type { Child, RewardPoints, Reward, RewardRedemption, ChildRewardProfile } from "@/lib/types"
import { apiService } from "@/lib/api-service"

interface ParentRewardDashboardProps {
  child: Child
}

interface CustomPointRule {
  id: string
  activity: string
  points: number
  description: string
  goal?: string
}

interface CustomReward {
  id: string
  title: string
  description: string
  pointsCost: number
  category: string
  isAvailable: boolean
}

export function ParentRewardDashboard({ child }: ParentRewardDashboardProps) {
  const [profile, setProfile] = useState<ChildRewardProfile | null>(null)
  const [recentPoints, setRecentPoints] = useState<RewardPoints[]>([])
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([])
  const [pendingRedemptions, setPendingRedemptions] = useState<RewardRedemption[]>([])
  const [customRewards, setCustomRewards] = useState<CustomReward[]>([])
  const [rewardSummary, setRewardSummary] = useState<{totalStars: number, scheduleStars: number, medicationStars: number} | null>(null)
  const [loading, setLoading] = useState(true)
  const [customPointRules, setCustomPointRules] = useState<CustomPointRule[]>([
    {
      id: "1",
      activity: "Hoàn thành bài tập",
      points: 10,
      description: "Làm xong bài tập được giao",
      goal: "Hoàn thành đúng hạn và chính xác",
    },
    {
      id: "2",
      activity: "Đọc sách 30 phút",
      points: 15,
      description: "Đọc sách ít nhất 30 phút",
      goal: "Đọc hiểu và có thể kể lại nội dung",
    },
    {
      id: "3",
      activity: "Giúp việc nhà",
      points: 8,
      description: "Tham gia làm việc nhà",
      goal: "Chủ động và làm tốt công việc được giao",
    },
  ])

  const [editingPointRule, setEditingPointRule] = useState<string | null>(null)
  const [editingReward, setEditingReward] = useState<string | null>(null)
  const [newPointRule, setNewPointRule] = useState<CustomPointRule>({
    id: "",
    activity: "",
    points: 0,
    description: "",
    goal: "",
  })
  const [newReward, setNewReward] = useState<CustomReward>({
    id: "",
    title: "",
    description: "",
    pointsCost: 0,
    category: "custom",
    isAvailable: true,
  })

  useEffect(() => {
    loadRewardData()
  }, [child.id])

  const loadRewardData = async () => {
    try {
      setLoading(true)
      const childId = child.id?.toString() || child.childid?.toString()
      console.log('🏆 Loading reward data from API for child:', childId)
      
      if (!childId) {
        console.error('❌ No valid child ID found:', child)
        return
      }
      
      // Get real reward data from API
      const rewards = await apiService.getRewardPoints(childId)
      console.log('🎯 API Reward data:', rewards)
      
      setRewardSummary({
        totalStars: rewards.totalStars,
        scheduleStars: rewards.breakdown?.scheduleStars || 0,
        medicationStars: rewards.breakdown?.medicationStars || 0
      })
      
      // Mock profile data for now since we don't have this API yet
      setProfile({
        childId: child.id,
        totalPointsEarned: rewards.totalStars,
        totalPointsSpent: 0,
        currentPoints: rewards.totalStars,
        level: Math.floor(rewards.totalStars / 50) + 1,
        nextLevelPoints: (Math.floor(rewards.totalStars / 50) + 1) * 50,
        achievements: [],
        streakDays: 0,
        lastActivityDate: new Date(),
        dailyStickers: {
          unicorn: rewards.breakdown?.scheduleActivities || 0,
          total: rewards.breakdown?.scheduleActivities || 0
        },
        dailyBadges: {
          superStar: rewards.breakdown?.medicationLogs || 0, 
          total: rewards.breakdown?.medicationLogs || 0
        },
        lastResetDate: new Date().toISOString().split('T')[0]
      })
      
      // Mock some sample rewards and redemptions
      setAvailableRewards([
        {
          id: "1",
          childId: child.id,
          title: "30 phút chơi game",
          description: "Được chơi game yêu thích 30 phút",
          pointsCost: 20,
          category: "screen_time",
          isActive: true,
          createdBy: "parent-1",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "2", 
          childId: child.id,
          title: "Đi xem phim",
          description: "Được đi xem phim với bố mẹ",
          pointsCost: 50,
          category: "privilege",
          isActive: true,
          createdBy: "parent-1",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
      
      setPendingRedemptions([])
      setRecentPoints([])
      
    } catch (error) {
      console.error('❌ Error loading reward data:', error)
      setRewardSummary({ totalStars: 0, scheduleStars: 0, medicationStars: 0 })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRedemption = async (redemptionId: string, approved: boolean) => {
    // TODO: Implement API call for approving redemption
    console.log('Approving redemption:', redemptionId, approved)
    await loadRewardData()
  }

  const handleAwardPoints = async (points: number, reason: string) => {
    // TODO: Implement API call for awarding points
    console.log('Awarding points:', points, reason)
    await loadRewardData()
  }

  const handleAddPointRule = () => {
    if (newPointRule.activity && newPointRule.points > 0) {
      const rule: CustomPointRule = {
        ...newPointRule,
        id: Date.now().toString(),
      }
      setCustomPointRules([...customPointRules, rule])
      setNewPointRule({ id: "", activity: "", points: 0, description: "", goal: "" })
    }
  }

  const handleEditPointRule = (id: string) => {
    setEditingPointRule(id)
  }

  const handleSavePointRule = (id: string, updatedRule: CustomPointRule) => {
    setCustomPointRules(customPointRules.map((rule) => (rule.id === id ? updatedRule : rule)))
    setEditingPointRule(null)
  }

  const handleDeletePointRule = (id: string) => {
    setCustomPointRules(customPointRules.filter((rule) => rule.id !== id))
  }

  const handleAddCustomReward = () => {
    if (newReward.title && newReward.pointsCost > 0) {
      const reward: CustomReward = {
        ...newReward,
        id: Date.now().toString(),
      }
      setCustomRewards([...customRewards, reward])
      setNewReward({ id: "", title: "", description: "", pointsCost: 0, category: "custom", isAvailable: true })
    }
  }

  const handleEditReward = (id: string) => {
    setEditingReward(id)
  }

  const handleSaveReward = (id: string, updatedReward: CustomReward) => {
    setCustomRewards(customRewards.map((reward) => (reward.id === id ? updatedReward : reward)))
    setEditingReward(null)
  }

  const handleDeleteReward = (id: string) => {
    setCustomRewards(customRewards.filter((reward) => reward.id !== id))
  }

  if (!profile) {
    return <div className="text-center py-8 font-sans text-gray-700">Đang tải dữ liệu thưởng...</div>
  }

  const levelProgress = ((profile.totalPointsEarned - (profile.level - 1) * 100) / 100) * 100

  return (
    <div className="space-y-4 sm:space-y-6 font-sans px-1 sm:px-0">
      {/* Profile Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-2xl font-heading text-gray-900">
            <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-500" />🏆 Hồ sơ thưởng của {child.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
            <div className="text-center bg-white/70 rounded-xl p-2 sm:p-4">
              <div className="text-xl sm:text-3xl font-heading text-blue-600 mb-1 sm:mb-2">{profile.currentPoints}</div>
              <p className="text-xs sm:text-sm font-sans text-blue-700">💎 Điểm hiện tại</p>
            </div>
            <div className="text-center bg-white/70 rounded-xl p-2 sm:p-4">
              <div className="text-xl sm:text-3xl font-heading text-purple-600 mb-1 sm:mb-2">Cấp {profile.level}</div>
              <p className="text-xs sm:text-sm font-sans text-purple-700">🏆 Cấp độ</p>
            </div>
            <div className="text-center bg-white/70 rounded-xl p-2 sm:p-4">
              <div className="text-xl sm:text-3xl font-heading text-green-600 mb-1 sm:mb-2">{profile.streakDays}</div>
              <p className="text-xs sm:text-sm font-sans text-green-700">🔥 Ngày liên tiếp</p>
            </div>
            <div className="text-center bg-white/70 rounded-xl p-2 sm:p-4">
              <div className="text-xl sm:text-3xl font-heading text-orange-600 mb-1 sm:mb-2">
                {profile.totalPointsEarned}
              </div>
              <p className="text-xs sm:text-sm font-sans text-orange-700">⭐ Tổng điểm</p>
            </div>
          </div>

          <div className="mt-3 sm:mt-6 space-y-2 sm:space-y-3">
            <div className="flex justify-between text-xs sm:text-sm font-sans text-gray-800">
              <span>🚀 Tiến độ lên cấp</span>
              <span className="text-right text-xs sm:text-sm">
                {profile.nextLevelPoints - profile.currentPoints} điểm nữa đến cấp {profile.level + 1}
              </span>
            </div>
            <Progress value={levelProgress} className="h-2 sm:h-4" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="daily-rewards" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 bg-gray-100 p-1 rounded-xl h-auto">
          <TabsTrigger
            value="daily-rewards"
            className="font-sans text-xs sm:text-sm text-gray-800 data-[state=active]:bg-white data-[state=active]:text-purple-800 py-2 px-1 sm:px-2"
          >
            <span className="hidden sm:inline">🦄 Thưởng hôm nay</span>
            <span className="sm:hidden">🦄 Hôm nay</span>
          </TabsTrigger>
          <TabsTrigger
            value="custom-points"
            className="font-sans text-xs sm:text-sm text-gray-800 data-[state=active]:bg-white data-[state=active]:text-purple-800 py-2 px-1 sm:px-2"
          >
            <span className="hidden sm:inline">⭐ Tùy chỉnh điểm</span>
            <span className="sm:hidden">⭐ Điểm</span>
          </TabsTrigger>
          <TabsTrigger
            value="custom-rewards"
            className="font-sans text-xs sm:text-sm text-gray-800 data-[state=active]:bg-white data-[state=active]:text-purple-800 py-2 px-1 sm:px-2"
          >
            <span className="hidden sm:inline">🎁 Tùy chỉnh thưởng</span>
            <span className="sm:hidden">🎁 Thưởng</span>
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="font-sans text-xs sm:text-sm text-gray-800 data-[state=active]:bg-white data-[state=active]:text-purple-800 py-2 px-1 sm:px-2"
          >
            <span className="hidden sm:inline">🎯 Quản lý</span>
            <span className="sm:hidden">🎯 QL</span>
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="font-sans text-xs sm:text-sm text-gray-800 data-[state=active]:bg-white data-[state=active]:text-purple-800 py-2 px-1 sm:px-2"
          >
            <span className="hidden sm:inline">⏳ Chờ duyệt</span>
            <span className="sm:hidden">⏳ Chờ</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-rewards" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-base sm:text-xl font-heading text-gray-900">
                🦄 Thưởng hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              {rewardSummary ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">📚</div>
                      <div className="text-2xl font-bold text-purple-600 mb-1">{Math.floor(rewardSummary.scheduleStars / 5)}</div>
                      <p className="text-sm text-purple-700 font-medium">Hoạt động hoàn thành</p>
                      <p className="text-xs text-purple-600 mt-1">
                        {rewardSummary.scheduleStars} sao từ hoàn thành bài tập
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-4 border-2 border-yellow-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">💊</div>
                      <div className="text-2xl font-bold text-orange-600 mb-1">{Math.floor(rewardSummary.medicationStars / 10)}</div>
                      <p className="text-sm text-orange-700 font-medium">Lần uống thuốc</p>
                      <p className="text-xs text-orange-600 mt-1">
                        {rewardSummary.medicationStars} sao từ uống thuốc
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🌟</div>
                      <div className="text-2xl font-bold text-green-600 mb-1">{rewardSummary.totalStars}</div>
                      <p className="text-sm text-green-700 font-medium">Tổng sao hiện tại</p>
                      <p className="text-xs text-green-600 mt-1">
                        Dành dụm để đổi quà nhé!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🌟</div>
                  <p>Đang tải dữ liệu thưởng...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-points" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-base sm:text-xl font-heading text-gray-900">
                ⭐ Tùy chỉnh cách kiếm điểm
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              {/* Add New Point Rule Form */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h4 className="font-heading text-sm sm:text-lg text-blue-800 mb-3 sm:mb-4">
                  ➕ Thêm quy tắc kiếm điểm mới
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="activity" className="font-sans text-gray-800 text-sm">
                      Tên hoạt động
                    </Label>
                    <Input
                      id="activity"
                      value={newPointRule.activity}
                      onChange={(e) => setNewPointRule({ ...newPointRule, activity: e.target.value })}
                      placeholder="VD: Hoàn thành bài tập toán"
                      className="font-sans h-11 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="points" className="font-sans text-gray-800 text-sm">
                      Số điểm thưởng
                    </Label>
                    <Input
                      id="points"
                      type="number"
                      value={newPointRule.points}
                      onChange={(e) =>
                        setNewPointRule({ ...newPointRule, points: Number.parseInt(e.target.value) || 0 })
                      }
                      placeholder="10"
                      className="font-sans h-11 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="font-sans text-gray-800 text-sm">
                      Mô tả chi tiết
                    </Label>
                    <Textarea
                      id="description"
                      value={newPointRule.description}
                      onChange={(e) => setNewPointRule({ ...newPointRule, description: e.target.value })}
                      placeholder="Mô tả cách thực hiện hoạt động"
                      className="font-sans min-h-[80px] text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal" className="font-sans text-gray-800 text-sm">
                      Mục tiêu/Yêu cầu
                    </Label>
                    <Textarea
                      id="goal"
                      value={newPointRule.goal}
                      onChange={(e) => setNewPointRule({ ...newPointRule, goal: e.target.value })}
                      placeholder="Tiêu chí để đạt được điểm"
                      className="font-sans min-h-[80px] text-base"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddPointRule}
                  className="mt-4 w-full sm:w-auto bg-blue-500 hover:bg-blue-600 font-sans h-11"
                  disabled={!newPointRule.activity || newPointRule.points <= 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm quy tắc
                </Button>
              </div>

              {/* Existing Point Rules */}
              <div className="space-y-3 sm:space-y-4">
                {customPointRules.map((rule) => (
                  <PointRuleCard
                    key={rule.id}
                    rule={rule}
                    isEditing={editingPointRule === rule.id}
                    onEdit={() => handleEditPointRule(rule.id)}
                    onSave={(updatedRule) => handleSavePointRule(rule.id, updatedRule)}
                    onDelete={() => handleDeletePointRule(rule.id)}
                    onCancel={() => setEditingPointRule(null)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-rewards" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-base sm:text-xl font-heading text-gray-900">
                🎁 Tùy chỉnh phần thưởng
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              {/* Add New Reward Form */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                <h4 className="font-heading text-sm sm:text-lg text-purple-800 mb-3 sm:mb-4">
                  ➕ Thêm phần thưởng mới
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="reward-title" className="font-sans text-gray-800 text-sm">
                      Tên phần thưởng
                    </Label>
                    <Input
                      id="reward-title"
                      value={newReward.title}
                      onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                      placeholder="VD: Được xem phim 1 tiếng"
                      className="font-sans h-11 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reward-cost" className="font-sans text-gray-800 text-sm">
                      Giá trị điểm
                    </Label>
                    <Input
                      id="reward-cost"
                      type="number"
                      value={newReward.pointsCost}
                      onChange={(e) => setNewReward({ ...newReward, pointsCost: Number.parseInt(e.target.value) || 0 })}
                      placeholder="50"
                      className="font-sans h-11 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reward-description" className="font-sans text-gray-800 text-sm">
                      Mô tả phần thưởng
                    </Label>
                    <Textarea
                      id="reward-description"
                      value={newReward.description}
                      onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                      placeholder="Mô tả chi tiết về phần thưởng và điều kiện"
                      className="font-sans min-h-[80px] text-base"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddCustomReward}
                  className="mt-4 w-full sm:w-auto bg-purple-500 hover:bg-purple-600 font-sans h-11"
                  disabled={!newReward.title || newReward.pointsCost <= 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm phần thưởng
                </Button>
              </div>

              {/* Existing Rewards */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {[...availableRewards, ...customRewards].map((reward) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward as any}
                    isEditing={editingReward === reward.id}
                    onEdit={() => handleEditReward(reward.id)}
                    onSave={(updatedReward) => handleSaveReward(reward.id, updatedReward)}
                    onDelete={() => handleDeleteReward(reward.id)}
                    onCancel={() => setEditingReward(null)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parent Management Tab */}
        <TabsContent value="manage" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="font-heading text-gray-900 text-base sm:text-xl">Quản lý thưởng</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="space-y-3 sm:space-y-4">
                <Button
                  className="w-full font-sans h-10 sm:h-12 text-sm sm:text-base"
                  onClick={() => handleAwardPoints(10, "Thưởng đặc biệt từ phụ huynh")}
                >
                  Tặng 10 điểm thưởng
                </Button>
                <Button variant="outline" className="w-full bg-transparent font-sans h-10 sm:h-12 text-sm sm:text-base">
                  Thêm phần thưởng mới
                </Button>
                <Button variant="outline" className="w-full bg-transparent font-sans h-10 sm:h-12 text-sm sm:text-base">
                  Xem lịch sử điểm
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Redemptions */}
        <TabsContent value="pending" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="font-heading text-gray-900 text-base sm:text-xl">
                Yêu cầu đổi thưởng đang chờ
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              {pendingRedemptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 font-sans">Không có yêu cầu nào đang chờ</p>
              ) : (
                <div className="space-y-3">
                  {pendingRedemptions.map((redemption) => {
                    const reward = availableRewards.find((r) => r.id === redemption.rewardId)
                    return (
                      <div
                        key={redemption.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3"
                      >
                        <div className="flex-1">
                          <p className="font-sans font-medium">{reward?.title}</p>
                          <p className="text-sm text-muted-foreground font-sans">
                            Yêu cầu lúc: {redemption.requestedAt.toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <Badge variant="outline" className="font-sans">
                            {redemption.pointsSpent} điểm
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="font-sans h-9"
                              onClick={() => handleApproveRedemption(redemption.id, true)}
                            >
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="font-sans bg-transparent h-9"
                              onClick={() => handleApproveRedemption(redemption.id, false)}
                            >
                              Từ chối
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="font-heading text-gray-900 text-base sm:text-xl">Lịch sử điểm thưởng</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              {recentPoints.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 font-sans">Chưa có điểm nào trong tuần này</p>
              ) : (
                <div className="space-y-3">
                  {recentPoints.map((point) => (
                    <div key={point.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-sans truncate">{point.reason}</p>
                        <p className="text-sm text-muted-foreground font-sans">
                          {point.earnedAt.toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <Badge className="bg-green-500 font-sans ml-2">+{point.points}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PointRuleCard({
  rule,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  onCancel,
}: {
  rule: CustomPointRule
  isEditing: boolean
  onEdit: () => void
  onSave: (rule: CustomPointRule) => void
  onDelete: () => void
  onCancel: () => void
}) {
  const [editedRule, setEditedRule] = useState(rule)

  if (isEditing) {
    return (
      <div className="p-3 sm:p-4 border-2 rounded-xl bg-blue-50 border-blue-300">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <Label className="font-sans text-gray-800 text-sm">Tên hoạt động</Label>
            <Input
              value={editedRule.activity}
              onChange={(e) => setEditedRule({ ...editedRule, activity: e.target.value })}
              className="font-sans h-11 text-base"
            />
          </div>
          <div>
            <Label className="font-sans text-gray-800 text-sm">Số điểm</Label>
            <Input
              type="number"
              value={editedRule.points}
              onChange={(e) => setEditedRule({ ...editedRule, points: Number.parseInt(e.target.value) || 0 })}
              className="font-sans h-11 text-base"
            />
          </div>
          <div>
            <Label className="font-sans text-gray-800 text-sm">Mô tả</Label>
            <Textarea
              value={editedRule.description}
              onChange={(e) => setEditedRule({ ...editedRule, description: e.target.value })}
              className="font-sans min-h-[80px] text-base"
            />
          </div>
          <div>
            <Label className="font-sans text-gray-800 text-sm">Mục tiêu</Label>
            <Textarea
              value={editedRule.goal || ""}
              onChange={(e) => setEditedRule({ ...editedRule, goal: e.target.value })}
              className="font-sans min-h-[80px] text-base"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => onSave(editedRule)}
              className="bg-green-500 hover:bg-green-600 font-sans h-11 flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu
            </Button>
            <Button onClick={onCancel} variant="outline" className="font-sans bg-transparent h-11 flex-1">
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-2 rounded-xl bg-blue-50 border-blue-200 gap-3">
      <div className="flex-1 min-w-0">
        <h4 className="font-heading text-base sm:text-lg text-blue-800 truncate">{rule.activity}</h4>
        <p className="text-sm text-blue-600 font-sans">{rule.description}</p>
        {rule.goal && <p className="text-xs text-blue-500 font-sans mt-1">🎯 Mục tiêu: {rule.goal}</p>}
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
        <Badge className="bg-blue-500 text-white text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2 font-sans">
          +{rule.points} điểm
        </Badge>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline" size="sm" className="font-sans bg-transparent h-9">
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50 font-sans bg-transparent h-9"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function RewardCard({
  reward,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  onCancel,
}: {
  reward: CustomReward
  isEditing: boolean
  onEdit: () => void
  onSave: (reward: CustomReward) => void
  onDelete: () => void
  onCancel: () => void
}) {
  const [editedReward, setEditedReward] = useState(reward)

  if (isEditing) {
    return (
      <div className="p-3 sm:p-4 border-2 rounded-xl bg-purple-50 border-purple-300">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <Label className="font-sans text-gray-800 text-sm">Tên phần thưởng</Label>
            <Input
              value={editedReward.title}
              onChange={(e) => setEditedReward({ ...editedReward, title: e.target.value })}
              className="font-sans h-11 text-base"
            />
          </div>
          <div>
            <Label className="font-sans text-gray-800 text-sm">Giá trị điểm</Label>
            <Input
              type="number"
              value={editedReward.pointsCost}
              onChange={(e) => setEditedReward({ ...editedReward, pointsCost: Number.parseInt(e.target.value) || 0 })}
              className="font-sans h-11 text-base"
            />
          </div>
          <div>
            <Label className="font-sans text-gray-800 text-sm">Mô tả</Label>
            <Textarea
              value={editedReward.description}
              onChange={(e) => setEditedReward({ ...editedReward, description: e.target.value })}
              className="font-sans min-h-[80px] text-base"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => onSave(editedReward)}
              className="bg-green-500 hover:bg-green-600 font-sans h-11 flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu
            </Button>
            <Button onClick={onCancel} variant="outline" className="font-sans bg-transparent h-11 flex-1">
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 border-2 rounded-xl bg-purple-50 border-purple-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <h4 className="font-heading text-base sm:text-lg text-purple-800 truncate">🎁 {reward.title}</h4>
        <Badge className="bg-purple-500 text-white text-sm sm:text-lg px-3 py-1 font-sans self-start sm:self-center">
          {reward.pointsCost} điểm
        </Badge>
      </div>
      <p className="text-sm text-purple-600 font-sans mb-3">{reward.description}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onEdit} variant="outline" size="sm" className="font-sans bg-transparent h-9 flex-1">
          <Edit className="w-4 h-4 mr-2" />
          Sửa
        </Button>
        <Button
          onClick={onDelete}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50 font-sans bg-transparent h-9 flex-1"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Xóa
        </Button>
      </div>
    </div>
  )
}
