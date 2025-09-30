"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Trophy, Crown } from "lucide-react"
import type { Child, Reward, RewardRedemption, ChildRewardProfile } from "@/lib/types"
import { dataStore } from "@/lib/data-store"

interface ChildRewardDashboardProps {
  child: Child
}

export function ChildRewardDashboard({ child }: ChildRewardDashboardProps) {
  const [profile, setProfile] = useState<ChildRewardProfile | null>(null)
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([])
  const [pendingRedemptions, setPendingRedemptions] = useState<RewardRedemption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRewardData()
  }, [child.id])

  const loadRewardData = async () => {
    try {
      setLoading(true)
      console.log('🏆 Loading child reward data from API for child:', child.id)
      
      // Get real reward data from API mới với đúng parent ID
      const response = await fetch(`/api/rewards/calculate?childId=${child.id}&parentId=${child.parentId}`)
      const rewards = await response.json()
      console.log('🎯 API Reward data for child:', child.id, 'parent:', child.parentId, rewards)
      
      // Create profile from API data
      const rewardProfile: ChildRewardProfile = {
        childId: child.id.toString(),
        totalPointsEarned: rewards.totalStars,
        totalPointsSpent: 0, // TODO: Get from database when available
        currentPoints: rewards.totalStars,
        level: Math.floor(rewards.totalStars / 50) + 1,
        nextLevelPoints: (Math.floor(rewards.totalStars / 50) + 1) * 50,
        achievements: [], // TODO: Get from database when available
        streakDays: 0, // TODO: Calculate from database
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
      }
      
      setProfile(rewardProfile)
      
      // Mock available rewards and redemptions for now
      // TODO: Replace with real API when available
      setAvailableRewards([
        {
          id: "reward-1",
          title: "15 phút chơi game",
          description: "Thời gian chơi game bổ sung",
          pointsCost: 50,
          category: "screen_time",
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "reward-2", 
          title: "Đi xem phim",
          description: "Cùng gia đình đi xem phim",
          pointsCost: 100,
          category: "activity",
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
      
      setPendingRedemptions([])
      
    } catch (error) {
      console.error('❌ Error loading reward data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeemReward = async (reward: Reward) => {
    if (!profile || profile.currentPoints < reward.pointsCost) return

    const redemption = dataStore.requestRewardRedemption(child.id, reward.id, reward.pointsCost)
    if (redemption) {
      await loadRewardData()
    }
  }

  if (!profile) {
    return <div>Đang tải dữ liệu thưởng...</div>
  }

  const levelProgress = ((profile.totalPointsEarned - (profile.level - 1) * 100) / 100) * 100

  return (
    <div className="space-y-6">
      {/* Fun Profile Overview for Child */}
      <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-6 h-6 text-yellow-500" />🌟 Điểm thưởng của {child.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center bg-white/70 rounded-xl p-4">
              <div className="text-4xl font-bold text-blue-600 mb-2">{profile.currentPoints}</div>
              <p className="text-sm font-medium text-blue-700">💎 Điểm hiện tại</p>
            </div>
            <div className="text-center bg-white/70 rounded-xl p-4">
              <div className="text-4xl font-bold text-purple-600 mb-2">Cấp {profile.level}</div>
              <p className="text-sm font-medium text-purple-700">🏆 Cấp độ</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span>🚀 Tiến độ lên cấp</span>
              <span>
                {profile.nextLevelPoints - profile.currentPoints} điểm nữa đến cấp {profile.level + 1}
              </span>
            </div>
            <Progress value={levelProgress} className="h-4" />
          </div>

          {profile.achievements.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">🎖️ Thành tích gần đây:</h4>
              <div className="flex flex-wrap gap-2">
                {profile.achievements.slice(0, 3).map((achievement, index) => (
                  <Badge key={index} className="bg-yellow-100 text-yellow-800">
                    <Trophy className="w-3 h-3 mr-1" />
                    {achievement}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="earn" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="earn">🌟 Kiếm điểm</TabsTrigger>
          <TabsTrigger value="spend">🎁 Đổi thưởng</TabsTrigger>
        </TabsList>

        {/* Earn Points Tab - Child-friendly */}
        <TabsContent value="earn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Star className="w-5 h-5 text-yellow-500" />🎯 Cách kiếm điểm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📚</div>
                    <span className="font-medium">Hoàn thành lịch trình</span>
                  </div>
                  <Badge className="bg-blue-500 text-lg px-3 py-1">+10 điểm</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">⏰</div>
                    <span className="font-medium">Phiên Pomodoro hoàn thành</span>
                  </div>
                  <Badge className="bg-green-500 text-lg px-3 py-1">+5 điểm</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🧠</div>
                    <span className="font-medium">Cải thiện điểm tập trung</span>
                  </div>
                  <Badge className="bg-purple-500 text-lg px-3 py-1">+15 điểm</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">⭐</div>
                    <span className="font-medium">Hành vi tích cực</span>
                  </div>
                  <Badge className="bg-orange-500 text-lg px-3 py-1">+20 điểm</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spend Points Tab - Child-friendly */}
        <TabsContent value="spend" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRewards.map((reward) => (
              <Card key={reward.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">🎁 {reward.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-500 text-lg px-3 py-1">{reward.pointsCost} điểm</Badge>
                    <Button
                      onClick={() => handleRedeemReward(reward)}
                      disabled={profile.currentPoints < reward.pointsCost}
                      size="sm"
                      className="text-lg px-4 py-2"
                    >
                      {profile.currentPoints < reward.pointsCost ? "Chưa đủ điểm" : "Đổi ngay! 🎉"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pending Redemptions for Child */}
          {pendingRedemptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">⏳ Đang chờ bố mẹ duyệt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingRedemptions.map((redemption) => {
                    const reward = availableRewards.find((r) => r.id === redemption.rewardId)
                    return (
                      <div
                        key={redemption.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50"
                      >
                        <div>
                          <p className="font-medium">🎁 {reward?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Yêu cầu lúc: {redemption.requestedAt.toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{redemption.pointsSpent} điểm</Badge>
                          <Badge className="bg-yellow-500">⏳ Đang chờ</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
