"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Gift, Trophy, Zap, Crown, Target } from "lucide-react"
import type { Child, RewardPoints, Reward, RewardRedemption, ChildRewardProfile } from "@/lib/types"
import { dataStore } from "@/lib/data-store"

interface RewardDashboardProps {
  child: Child
  isParentView?: boolean
}

export function RewardDashboard({ child, isParentView = false }: RewardDashboardProps) {
  const [profile, setProfile] = useState<ChildRewardProfile | null>(null)
  const [recentPoints, setRecentPoints] = useState<RewardPoints[]>([])
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([])
  const [pendingRedemptions, setPendingRedemptions] = useState<RewardRedemption[]>([])

  useEffect(() => {
    loadRewardData()
  }, [child.id])

  const loadRewardData = async () => {
    const rewardProfile = dataStore.getChildRewardProfile(child.id)
    const points = dataStore.getRecentRewardPoints(child.id, 7) // Last 7 days
    const rewards = dataStore.getAvailableRewards(child.id)
    const redemptions = dataStore.getPendingRedemptions(child.id)

    setProfile(rewardProfile)
    setRecentPoints(points)
    setAvailableRewards(rewards)
    setPendingRedemptions(redemptions)
  }

  const handleRedeemReward = async (reward: Reward) => {
    if (!profile || profile.currentPoints < reward.pointsCost) return

    const redemption = dataStore.requestRewardRedemption(child.id, reward.id, reward.pointsCost)
    if (redemption) {
      await loadRewardData() // Refresh data
    }
  }

  const handleApproveRedemption = async (redemptionId: string, approved: boolean) => {
    if (!isParentView) return

    dataStore.approveRewardRedemption(redemptionId, approved, "parent-1")
    await loadRewardData()
  }

  if (!profile) {
    return <div>Đang tải dữ liệu thưởng...</div>
  }

  const levelProgress = ((profile.totalPointsEarned - (profile.level - 1) * 100) / 100) * 100

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Hồ sơ thưởng của {child.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{profile.currentPoints}</div>
              <p className="text-sm text-muted-foreground">Điểm hiện tại</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Cấp {profile.level}</div>
              <p className="text-sm text-muted-foreground">Cấp độ</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{profile.streakDays}</div>
              <p className="text-sm text-muted-foreground">Ngày liên tiếp</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{profile.totalPointsEarned}</div>
              <p className="text-sm text-muted-foreground">Tổng điểm kiếm được</p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tiến độ lên cấp</span>
              <span>
                {profile.nextLevelPoints - profile.currentPoints} điểm nữa đến cấp {profile.level + 1}
              </span>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </div>

          {/* Achievements */}
          {profile.achievements.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Thành tích gần đây:</h4>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earn">Kiếm điểm</TabsTrigger>
          <TabsTrigger value="spend">Đổi thưởng</TabsTrigger>
          {isParentView && <TabsTrigger value="manage">Quản lý</TabsTrigger>}
        </TabsList>

        {/* Earn Points Tab */}
        <TabsContent value="earn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Cách kiếm điểm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Hoàn thành lịch trình</span>
                    </div>
                    <Badge className="bg-blue-500">+10 điểm</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Phiên Pomodoro hoàn thành</span>
                    </div>
                    <Badge className="bg-green-500">+5 điểm</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Cải thiện điểm tập trung</span>
                    </div>
                    <Badge className="bg-purple-500">+15 điểm</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Hành vi tích cực</span>
                    </div>
                    <Badge className="bg-orange-500">+20 điểm</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-pink-600" />
                      <span className="text-sm">Thưởng đặc biệt</span>
                    </div>
                    <Badge className="bg-pink-500">+50 điểm</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Points */}
          <Card>
            <CardHeader>
              <CardTitle>Điểm kiếm được gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              {recentPoints.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Chưa có điểm nào trong tuần này</p>
              ) : (
                <div className="space-y-3">
                  {recentPoints.map((point) => (
                    <div key={point.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{point.reason}</p>
                        <p className="text-sm text-muted-foreground">{point.earnedAt.toLocaleDateString("vi-VN")}</p>
                      </div>
                      <Badge className="bg-green-500">+{point.points}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spend Points Tab */}
        <TabsContent value="spend" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRewards.map((reward) => (
              <Card key={reward.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{reward.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-500">{reward.pointsCost} điểm</Badge>
                    <Button
                      onClick={() => handleRedeemReward(reward)}
                      disabled={profile.currentPoints < reward.pointsCost}
                      size="sm"
                    >
                      {profile.currentPoints < reward.pointsCost ? "Không đủ điểm" : "Đổi thưởng"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pending Redemptions */}
          {pendingRedemptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Yêu cầu đổi thưởng đang chờ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingRedemptions.map((redemption) => {
                    const reward = availableRewards.find((r) => r.id === redemption.rewardId)
                    return (
                      <div key={redemption.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{reward?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Yêu cầu lúc: {redemption.requestedAt.toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{redemption.pointsSpent} điểm</Badge>
                          <Badge className="bg-yellow-500">Đang chờ</Badge>
                          {isParentView && (
                            <div className="flex gap-1">
                              <Button size="sm" onClick={() => handleApproveRedemption(redemption.id, true)}>
                                Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveRedemption(redemption.id, false)}
                              >
                                Từ chối
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Parent Management Tab */}
        {isParentView && (
          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý thưởng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full">Thêm phần thưởng mới</Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Tặng điểm thưởng
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Xem lịch sử điểm
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
