import type {
  User,
  Child,
  Device,
  FocusSession,
  DailyReport,
  Notification,
  ChatMessage,
  Intervention,
  ScheduleItem,
  RewardPoints,
  Reward,
  RewardRedemption,
  ChildRewardProfile,
  WeeklyAssessment,
  ADHDSymptomTracking,
  MedicationReminder,
  MedicationLog,
  MedicationSettings,
} from "./types"

// Simulated database with realistic data
class DataStore {
  private users: Map<string, User> = new Map()
  private children: Map<string, Child> = new Map()
  private devices: Map<string, Device> = new Map()
  private focusSessions: Map<string, FocusSession> = new Map()
  private dailyReports: Map<string, DailyReport> = new Map()
  private notifications: Map<string, Notification> = new Map()
  private chatMessages: Map<string, ChatMessage> = new Map()
  private scheduleItems: Map<string, ScheduleItem> = new Map()
  private rewardPoints: Map<string, RewardPoints> = new Map()
  private rewards: Map<string, Reward> = new Map()
  private rewardRedemptions: Map<string, RewardRedemption> = new Map()
  private childRewardProfiles: Map<string, ChildRewardProfile> = new Map()
  private weeklyAssessments: Map<string, WeeklyAssessment> = new Map()
  private symptomTracking: Map<string, ADHDSymptomTracking> = new Map()
  private medicationReminders: Map<string, MedicationReminder> = new Map()
  private medicationLogs: Map<string, MedicationLog> = new Map()
  private medicationSettings: Map<string, MedicationSettings> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    console.log('🔄 Loading data from localStorage...')
    if (typeof window === 'undefined') {
      // Server-side: initialize with default data
      console.log('⚠️ Server-side: using default data')
      this.initializeData()
      return
    }

    try {
      // Try to load persisted data from localStorage
      const savedSchedules = localStorage.getItem('adhd-schedules')
      const savedMedications = localStorage.getItem('adhd-medications')
      const savedRewardProfiles = localStorage.getItem('adhd-reward-profiles')

      if (savedSchedules) {
        const schedules = JSON.parse(savedSchedules)
        schedules.forEach((item: ScheduleItem) => {
          // Convert date strings back to Date objects
          item.createdAt = new Date(item.createdAt)
          item.updatedAt = new Date(item.updatedAt)
          if (item.completedAt) item.completedAt = new Date(item.completedAt)
          this.scheduleItems.set(item.id, item)
        })
        console.log('✅ Loaded schedules from localStorage:', schedules.length)
      }

      if (savedMedications) {
        const medications = JSON.parse(savedMedications)
        medications.forEach((med: MedicationLog) => {
          // Convert date strings back to Date objects
          med.createdAt = new Date(med.createdAt)
          med.scheduledTime = new Date(med.scheduledTime)
          if (med.takenTime) med.takenTime = new Date(med.takenTime)
          this.medicationLogs.set(med.id, med)
        })
        console.log('✅ Loaded medications from localStorage:', medications.length)
      }

      if (savedRewardProfiles) {
        const profiles = JSON.parse(savedRewardProfiles)
        profiles.forEach((profile: ChildRewardProfile) => {
          profile.lastActivityDate = new Date(profile.lastActivityDate)
          this.childRewardProfiles.set(profile.childId, profile)
        })
        console.log('✅ Loaded reward profiles from localStorage:', profiles.length)
      }

      // Always initialize base data (users, children, etc.)
      this.initializeData()
      
      // If no persisted data found, save initial data
      if (!savedSchedules || !savedMedications) {
        this.saveToStorage()
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      // Fallback to default initialization
      this.initializeData()
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return

    console.log('💾 Saving data to localStorage...')
    try {
      // Save schedules
      const schedules = Array.from(this.scheduleItems.values())
      localStorage.setItem('adhd-schedules', JSON.stringify(schedules))

      // Save medications
      const medications = Array.from(this.medicationLogs.values())
      localStorage.setItem('adhd-medications', JSON.stringify(medications))

      // Save reward profiles
      const profiles = Array.from(this.childRewardProfiles.values())
      localStorage.setItem('adhd-reward-profiles', JSON.stringify(profiles))

      console.log('✅ Data saved to localStorage successfully!')
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  private initializeData() {
    // Create multiple parent users
    const parentUsers: User[] = [
      {
        id: "parent-1",
        email: "nguyen.lan@gmail.com",
        name: "Nguyễn Thị Lan",
        firstName: "Lan",
        lastName: "Nguyễn Thị",
        role: "parent",
        avatar: "/parent-avatar.png",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date(),
      },
      {
        id: "parent-2", 
        email: "tran.minh@gmail.com",
        name: "Trần Văn Minh",
        firstName: "Minh",
        lastName: "Trần Văn",
        role: "parent",
        avatar: "/parent-avatar.png",
        createdAt: new Date("2024-02-10"),
        updatedAt: new Date(),
      },
      {
        id: "parent-3",
        email: "le.hong@gmail.com", 
        name: "Lê Thị Hồng",
        firstName: "Hồng",
        lastName: "Lê Thị",
        role: "parent",
        avatar: "/parent-avatar.png",
        createdAt: new Date("2024-03-05"),
        updatedAt: new Date(),
      }
    ]

    parentUsers.forEach(user => this.users.set(user.id, user))

    // Create multiple child users
    const childUsers: User[] = [
      {
        id: "child-1",
        email: "minhan@child.com",
        name: "Nguyễn Minh An",
        firstName: "An",
        lastName: "Nguyễn Minh",
        role: "child",
        avatar: "/child-avatar.png",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date(),
      },
      {
        id: "child-2",
        email: "bacnam@child.com",
        name: "Trần Bắc Nam",
        firstName: "Nam",
        lastName: "Trần Bắc",
        role: "child",
        avatar: "/child-avatar.png",
        createdAt: new Date("2024-02-10"),
        updatedAt: new Date(),
      },
      {
        id: "child-3",
        email: "thuytrang@child.com",
        name: "Lê Thụy Trang",
        firstName: "Trang",
        lastName: "Lê Thụy",
        role: "child",
        avatar: "/child-avatar.png",
        createdAt: new Date("2024-03-05"),
        updatedAt: new Date(),
      }
    ]

    childUsers.forEach(user => this.users.set(user.id, user))

    // Create child profiles for each parent
    const childProfiles: Child[] = [
      {
        id: "child-1",
        parentId: "parent-1",
        name: "Nguyễn Minh An",
        age: 10,
        grade: "Lớp 5",
        avatar: "/child-avatar.png",
        deviceId: "device-1",
        settings: {
          focusGoalMinutes: 120,
          breakReminderInterval: 30,
          lowFocusThreshold: 40,
          subjects: ["Toán", "Văn", "Tiếng Anh", "Khoa học", "Lịch sử"],
          schoolHours: {
            start: "07:30",
            end: "16:30",
          },
        },
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date(),
      },
      {
        id: "child-2",
        parentId: "parent-2",
        name: "Trần Bắc Nam",
        age: 8,
        grade: "Lớp 3",
        avatar: "/child-avatar.png",
        deviceId: "device-2",
        settings: {
          focusGoalMinutes: 90,
          breakReminderInterval: 25,
          lowFocusThreshold: 35,
          subjects: ["Toán", "Văn", "Tiếng Anh", "Khoa học"],
          schoolHours: {
            start: "07:45",
            end: "16:15",
          },
        },
        createdAt: new Date("2024-02-10"),
        updatedAt: new Date(),
      },
      {
        id: "child-3",
        parentId: "parent-3",
        name: "Lê Thụy Trang",
        age: 12,
        grade: "Lớp 7",
        avatar: "/child-avatar.png",
        deviceId: "device-3",
        settings: {
          focusGoalMinutes: 150,
          breakReminderInterval: 35,
          lowFocusThreshold: 45,
          subjects: ["Toán", "Văn", "Tiếng Anh", "Khoa học", "Lịch sử", "Địa lý", "Sinh học"],
          schoolHours: {
            start: "07:00",
            end: "17:00",
          },
        },
        createdAt: new Date("2024-03-05"),
        updatedAt: new Date(),
      }
    ]

    childProfiles.forEach(child => this.children.set(child.id, child))

    // Create devices for each child
    const devices: Device[] = [
      {
        id: "device-1",
        childId: "child-1",
        name: "Đồng hồ của Minh An",
        type: "smartwatch",
        status: "connected",
        batteryLevel: 78,
        lastSync: new Date(),
        firmwareVersion: "2.1.4",
      },
      {
        id: "device-2",
        childId: "child-2",
        name: "Đồng hồ của Bắc Nam",
        type: "smartwatch",
        status: "connected",
        batteryLevel: 92,
        lastSync: new Date(Date.now() - 5 * 60000), // 5 minutes ago
        firmwareVersion: "2.1.3",
      },
      {
        id: "device-3",
        childId: "child-3",
        name: "Đồng hồ của Thụy Trang",
        type: "smartwatch",
        status: "connected",
        batteryLevel: 65,
        lastSync: new Date(Date.now() - 2 * 60000), // 2 minutes ago
        firmwareVersion: "2.1.4",
      }
    ]

    devices.forEach(device => this.devices.set(device.id, device))

    // Generate realistic focus sessions for the last 7 days
    this.generateFocusSessions()
    this.generateDailyReports()
    this.generateNotifications()
    this.generateChatHistory()
    this.generateScheduleItems()
    this.generateRewardData()
    this.generateAssessmentData()
    // Initialize medication-related data
    this.generateMedicationReminders()
    this.generateMedicationLogs()
    this.generateMedicationSettings()
  }

  private generateFocusSessions() {
    const subjects = ["Toán", "Văn", "Tiếng Anh", "Khoa học", "Lịch sử"]
    const activities = ["Đọc sách", "Làm bài tập", "Nghe giảng", "Thực hành", "Ôn tập"]
    const childIds = ["child-1", "child-2", "child-3"]
    const deviceIds = ["device-1", "device-2", "device-3"]

    // Generate data for all children
    childIds.forEach((childId, childIndex) => {
      for (let day = 0; day < 7; day++) {
        const date = new Date()
        date.setDate(date.getDate() - day)

        // Generate 3-5 sessions per day per child
        const sessionsPerDay = Math.floor(Math.random() * 3) + 3

        for (let session = 0; session < sessionsPerDay; session++) {
          const sessionId = `session-${childId}-${day}-${session}`
          const startTime = new Date(date)
          startTime.setHours(8 + session * 2, Math.random() * 60, 0, 0)

          const endTime = new Date(startTime)
          endTime.setMinutes(startTime.getMinutes() + 30 + Math.random() * 60)

          const focusScore = Math.floor(Math.random() * 40) + 40 // 40-80
          const heartRate = Math.floor(Math.random() * 30) + 70 // 70-100
          const fidgetLevel = Math.floor(Math.random() * 60) + 20 // 20-80

          const interventions: Intervention[] = []
          if (focusScore < 50) {
            interventions.push({
              id: `intervention-${sessionId}-1`,
              sessionId,
              type: "reminder",
              message: "Hãy tập trung vào bài học nhé!",
              timestamp: new Date(startTime.getTime() + 15 * 60000),
              effectiveness: Math.floor(Math.random() * 30) + 50,
            })
          }

          const focusSession: FocusSession = {
            id: sessionId,
            childId: childId,
            deviceId: deviceIds[childIndex],
            startTime,
            endTime,
            focusScore,
            heartRate,
            fidgetLevel,
            activity: activities[Math.floor(Math.random() * activities.length)],
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            interventions,
            status: "completed",
          }

          this.focusSessions.set(sessionId, focusSession)
        }
      }
    })
  }

  private generateDailyReports() {
    const childIds = ["child-1", "child-2", "child-3"]

    childIds.forEach((childId) => {
      for (let day = 0; day < 7; day++) {
        const date = new Date()
        date.setDate(date.getDate() - day)
        const dateString = date.toISOString().split("T")[0]

        const daySessions = Array.from(this.focusSessions.values()).filter(
          (session) => session.childId === childId && session.startTime && session.startTime.toDateString() === date.toDateString(),
        )

        if (daySessions.length === 0) continue

        const totalFocusTime = daySessions.reduce((total, session) => {
          if (session.endTime && session.startTime) {
            return total + (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
          }
          return total
        }, 0)

        const averageFocusScore = daySessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) / daySessions.length
        const averageHeartRate = daySessions.reduce((sum, s) => sum + (s.heartRate || 0), 0) / daySessions.length
        const averageFidgetLevel = daySessions.reduce((sum, s) => sum + (s.fidgetLevel || 0), 0) / daySessions.length

        const subjectBreakdown: Record<string, number> = {}
        daySessions.forEach((session) => {
          if (session.subject) {
            subjectBreakdown[session.subject] = (subjectBreakdown[session.subject] || 0) + 1
          }
        })

        const achievements: string[] = []
        if (averageFocusScore > 70) achievements.push("Tập trung tốt hôm nay!")
        if (totalFocusTime > 120) achievements.push("Đạt mục tiêu thời gian học")

        const report: DailyReport = {
          id: `report-${childId}-${dateString}`,
          childId: childId,
          date: dateString,
          totalFocusTime: Math.round(totalFocusTime),
          averageFocusScore: Math.round(averageFocusScore),
          averageHeartRate: Math.round(averageHeartRate),
          averageFidgetLevel: Math.round(averageFidgetLevel),
          sessionsCount: daySessions.length,
          interventionsCount: daySessions.reduce((sum, s) => sum + (s.interventions?.length || 0), 0),
          subjectBreakdown,
          achievements,
        }

        this.dailyReports.set(report.id, report)
      }
    })
  }

  private generateNotifications() {
    const notifications: Notification[] = [
      {
        id: "notif-1",
        userId: "parent-1",
        type: "focus_alert",
        title: "Mức tập trung thấp",
        message: "Minh An đang có mức tập trung dưới 40% trong 15 phút qua",
        read: false,
        createdAt: new Date(Date.now() - 30 * 60000),
      },
      {
        id: "notif-2",
        userId: "parent-1",
        type: "achievement",
        title: "Thành tích mới!",
        message: "Minh An đã hoàn thành 2 giờ học tập tập trung hôm nay",
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60000),
      },
      {
        id: "notif-3",
        userId: "parent-1",
        type: "daily_summary",
        title: "Báo cáo hàng ngày",
        message: "Xem báo cáo chi tiết về ngày học của Minh An",
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ]

    notifications.forEach((notif) => this.notifications.set(notif.id, notif))
  }

  private generateChatHistory() {
    const messages: ChatMessage[] = [
      {
        id: "msg-1",
        userId: "parent-1",
        content: "ADHD là gì và làm thế nào để hỗ trợ con tôi?",
        role: "user",
        timestamp: new Date(Date.now() - 2 * 60 * 60000),
      },
      {
        id: "msg-2",
        userId: "parent-1",
        content:
          "ADHD (Attention Deficit Hyperactivity Disorder) là rối loạn tăng động giảm chú ý, một tình trạng thần kinh phổ biến ở trẻ em...",
        role: "assistant",
        timestamp: new Date(Date.now() - 2 * 60 * 60000 + 30000),
        metadata: { topicCategory: "education" },
      },
    ]

    messages.forEach((msg) => this.chatMessages.set(msg.id, msg))
  }

  private generateScheduleItems() {
    const subjects = ["Toán", "Văn", "Tiếng Anh", "Khoa học", "Lịch sử"]
    const today = new Date().toISOString().split("T")[0]
    const childIds = ["child-1", "child-2", "child-3"]

    // Generate schedule for all children
    const allSchedules: ScheduleItem[] = []
    
    childIds.forEach((childId, childIndex) => {
      const scheduleTemplates = [
        {
          title: "Ôn tập bài Toán",
          description: "Làm bài tập chương phân số và số thập phân",
          subject: "Toán",
          startTime: "08:00",
          endTime: "09:30",
          status: (childIndex === 0 ? "completed" : "pending") as "pending" | "in-progress" | "completed" | "overdue",
          priority: "high" as "low" | "medium" | "high",
          progress: childIndex === 0 ? 100 : 0,
          notes: childIndex === 0 ? "Đã hoàn thành tốt, con hiểu rõ về phân số" : undefined,
        },
        {
          title: "Đọc truyện Văn",
          description: "Đọc và tóm tắt truyện 'Tấm Cám'",
          subject: "Văn", 
          startTime: "10:00",
          endTime: "11:00",
          status: (childIndex === 0 ? "in-progress" : "pending") as "pending" | "in-progress" | "completed" | "overdue",
          priority: "medium" as "low" | "medium" | "high",
          progress: childIndex === 0 ? 60 : 0,
          notes: childIndex === 0 ? "Đang đọc được nửa truyện, con rất thích" : undefined,
        },
        {
          title: "Học từ vựng Tiếng Anh",
          description: "Học 20 từ vựng mới về động vật",
          subject: "Tiếng Anh",
          startTime: "14:00", 
          endTime: "15:00",
          status: "pending" as "pending" | "in-progress" | "completed" | "overdue",
          priority: "medium" as "low" | "medium" | "high",
          progress: 0,
        },
        {
          title: "Thí nghiệm Khoa học",
          description: "Quan sát sự nảy mầm của hạt đậu",
          subject: "Khoa học",
          startTime: "15:30",
          endTime: "16:30", 
          status: "pending" as "pending" | "in-progress" | "completed" | "overdue",
          priority: "low" as "low" | "medium" | "high",
          progress: 0,
          notes: "Cần chuẩn bị hạt đậu và bông gòn",
        },
      ]

      scheduleTemplates.forEach((template, index) => {
        const scheduleItem: ScheduleItem = {
          id: `schedule-${childId}-${index + 1}`,
          childId: childId,
          date: today,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...(template.status === "completed" ? { completedAt: new Date() } : {}),
          ...template,
        }
        allSchedules.push(scheduleItem)
      })
    })

    allSchedules.forEach((item) => this.scheduleItems.set(item.id, item))
  }

  private generateRewardData() {
    // Generate reward points history
    const pointsHistory: RewardPoints[] = [
      {
        id: "points-1",
        childId: "child-1",
        points: 10,
        reason: "Hoàn thành lịch trình Toán",
        category: "schedule_completion",
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        scheduleItemId: "schedule-1",
      },
      {
        id: "points-2",
        childId: "child-1",
        points: 5,
        reason: "Hoàn thành phiên Pomodoro",
        category: "focus_improvement",
        earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: "points-3",
        childId: "child-1",
        points: 15,
        reason: "Cải thiện điểm tập trung lên 80%",
        category: "focus_improvement",
        earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: "points-4",
        childId: "child-1",
        points: 20,
        reason: "Nghe lời và làm bài tập đúng giờ",
        category: "behavior_improvement",
        earnedAt: new Date(),
      },
    ]

    pointsHistory.forEach((point) => this.rewardPoints.set(point.id, point))

    // Generate available rewards
    const availableRewards: Reward[] = [
      {
        id: "reward-1",
        childId: "child-1",
        title: "30 phút xem TV thêm",
        description: "Được xem TV thêm 30 phút vào cuối tuần",
        pointsCost: 25,
        category: "screen_time",
        isActive: true,
        createdBy: "parent-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "reward-2",
        childId: "child-1",
        title: "Đi chơi công viên",
        description: "Được đi chơi công viên với bố mẹ",
        pointsCost: 50,
        category: "activity",
        isActive: true,
        createdBy: "parent-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "reward-3",
        childId: "child-1",
        title: "Kem yêu thích",
        description: "Được mua kem vị yêu thích",
        pointsCost: 15,
        category: "treat",
        isActive: true,
        createdBy: "parent-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "reward-4",
        childId: "child-1",
        title: "Ngủ muộn 30 phút",
        description: "Được ngủ muộn hơn 30 phút vào cuối tuần",
        pointsCost: 20,
        category: "privilege",
        isActive: true,
        createdBy: "parent-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    availableRewards.forEach((reward) => this.rewards.set(reward.id, reward))

    // Generate child reward profile
    const totalEarned = pointsHistory.reduce((sum, p) => sum + p.points, 0)
    const profile: ChildRewardProfile = {
      childId: "child-1",
      totalPointsEarned: totalEarned,
      totalPointsSpent: 0,
      currentPoints: totalEarned,
      level: Math.floor(totalEarned / 100) + 1,
      nextLevelPoints: (Math.floor(totalEarned / 100) + 1) * 100,
      achievements: ["Người mới bắt đầu", "Tập trung tốt", "Hoàn thành nhiệm vụ"],
      streakDays: 3,
      lastActivityDate: new Date(),
      // Initialize daily rewards
      dailyStickers: {
        unicorn: 0,
        total: 0
      },
      dailyBadges: {
        superStar: 0,
        total: 0
      },
      lastResetDate: new Date().toISOString().split('T')[0]
    }

    this.childRewardProfiles.set("child-1", profile)
  }

  private generateAssessmentData() {
    // Generate symptom tracking data
    const symptoms: ADHDSymptomTracking[] = []
    for (let day = 0; day < 7; day++) {
      const date = new Date()
      date.setDate(date.getDate() - day)
      const dateString = date.toISOString().split("T")[0]

      const symptom: ADHDSymptomTracking = {
        id: `symptom-${day}`,
        childId: "child-1",
        date: dateString,
        hyperactivityLevel: Math.floor(Math.random() * 3) + 2, // 2-4
        inattentionLevel: Math.floor(Math.random() * 3) + 2, // 2-4
        impulsivityLevel: Math.floor(Math.random() * 3) + 1, // 1-3
        emotionalRegulation: Math.floor(Math.random() * 2) + 3, // 3-4
        socialInteraction: Math.floor(Math.random() * 2) + 3, // 3-4
        notes: day === 0 ? "Con tập trung tốt hơn hôm nay, ít bị xao nhãng" : undefined,
        reportedBy: day % 2 === 0 ? "parent" : "system",
        createdAt: date,
      }

      symptoms.push(symptom)
      this.symptomTracking.set(symptom.id, symptom)
    }

    // Generate current week assessment
    const currentWeekStart = new Date()
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay())
    const currentWeekEnd = new Date(currentWeekStart)
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6)

    const avgHyperactivity = symptoms.reduce((sum, s) => sum + s.hyperactivityLevel, 0) / symptoms.length
    const avgInattention = symptoms.reduce((sum, s) => sum + s.inattentionLevel, 0) / symptoms.length
    const avgImpulsivity = symptoms.reduce((sum, s) => sum + s.impulsivityLevel, 0) / symptoms.length

    // Calculate ADHD severity (higher symptom scores = higher severity)
    const adhdSeverityScore = Math.round(((avgHyperactivity + avgInattention + avgImpulsivity) / 15) * 100)

    // Get focus improvement from recent sessions
    const recentSessions = Array.from(this.focusSessions.values())
      .filter((s) => s.childId === "child-1")
      .slice(0, 10)
    const avgFocusScore = recentSessions.reduce((sum, s) => sum + s.focusScore, 0) / recentSessions.length

    const currentAssessment: WeeklyAssessment = {
      id: "assessment-current",
      childId: "child-1",
      weekStartDate: currentWeekStart.toISOString().split("T")[0],
      weekEndDate: currentWeekEnd.toISOString().split("T")[0],
      adhdSeverityScore,
      focusImprovementScore: Math.round(avgFocusScore),
      behaviorScore: 75,
      overallProgress: adhdSeverityScore <= 40 ? "good" : adhdSeverityScore <= 60 ? "fair" : "needs_attention",
      recommendations: [
        "Tiếp tục sử dụng kỹ thuật Pomodoro để cải thiện thời gian tập trung",
        "Tăng cường hoạt động thể chất để giảm mức độ tăng động",
        "Thiết lập môi trường học tập yên tĩnh, ít kích thích",
        "Khuyến khích và khen ngợi khi con hoàn thành nhiệm vụ đúng hạn",
        "Duy trì lịch trình ngủ đều đặn để cải thiện khả năng tập trung",
      ],
      keyInsights: [
        "Con đã có tiến bộ rõ rệt trong việc hoàn thành lịch trình học tập",
        "Mức độ tăng động giảm nhẹ so với tuần trước, đặc biệt vào buổi chiều",
        "Khả năng tập trung cải thiện khi sử dụng timer Pomodoro",
        "Cần chú ý thêm đến việc kiểm soát cảm xúc khi gặp khó khăn",
      ],
      doctorRecommendation:
        adhdSeverityScore > 70
          ? "schedule_consultation"
          : adhdSeverityScore > 85
            ? "urgent_consultation"
            : "continue_monitoring",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.weeklyAssessments.set(currentAssessment.id, currentAssessment)

    // Generate previous week assessment for comparison
    const previousWeekStart = new Date(currentWeekStart)
    previousWeekStart.setDate(previousWeekStart.getDate() - 7)
    const previousWeekEnd = new Date(previousWeekStart)
    previousWeekEnd.setDate(previousWeekEnd.getDate() + 6)

    const previousAssessment: WeeklyAssessment = {
      id: "assessment-previous",
      childId: "child-1",
      weekStartDate: previousWeekStart.toISOString().split("T")[0],
      weekEndDate: previousWeekEnd.toISOString().split("T")[0],
      adhdSeverityScore: adhdSeverityScore + 10, // Slightly worse last week
      focusImprovementScore: Math.round(avgFocusScore) - 5,
      behaviorScore: 70,
      overallProgress: "fair",
      recommendations: [
        "Tập trung vào việc xây dựng thói quen học tập đều đặn",
        "Giảm thời gian sử dụng thiết bị điện tử trước khi ngủ",
        "Thêm các hoạt động thư giãn vào lịch trình hàng ngày",
      ],
      keyInsights: [
        "Con gặp khó khăn trong việc duy trì sự tập trung trong thời gian dài",
        "Có xu hướng bị xao nhãng nhiều hơn vào buổi sáng",
        "Phản ứng tích cực với hệ thống thưởng điểm",
      ],
      doctorRecommendation: "continue_monitoring",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    }

    this.weeklyAssessments.set(previousAssessment.id, previousAssessment)
  }

  private generateMedicationReminders() {
    const reminders: MedicationReminder[] = [
      {
        id: "reminder-1",
        childId: "child-1",
        medicationName: "Methylphenidate",
        scheduledTime: new Date(Date.now() - 30 * 60000),
        status: "pending",
        notes: "Lần uống sáng hôm nay",
        createdAt: new Date(Date.now() - 30 * 60000),
        updatedAt: new Date(Date.now() - 30 * 60000),
      },
      {
        id: "reminder-2",
        childId: "child-1",
        medicationName: "Atomoxetine",
        scheduledTime: new Date(Date.now() - 2 * 60 * 60000),
        status: "pending",
        notes: "Lần uống chiều hôm nay",
        createdAt: new Date(Date.now() - 2 * 60 * 60000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60000),
      },
    ]

    reminders.forEach((reminder) => this.medicationReminders.set(reminder.id, reminder))
  }

  private generateMedicationLogs() {
    const logs: MedicationLog[] = [
      {
        id: "log-1",
        childId: "child-1",
        medicationName: "Methylphenidate",
        scheduledTime: new Date(Date.now() - 30 * 60000),
        status: "taken",
        notes: "Con đã uống thuốc",
        createdAt: new Date(Date.now() - 30 * 60000),
        updatedAt: new Date(Date.now() - 30 * 60000),
      },
      {
        id: "log-2",
        childId: "child-1",
        medicationName: "Atomoxetine",
        scheduledTime: new Date(Date.now() - 2 * 60 * 60000),
        status: "missed",
        notes: "Con quên uống thuốc",
        createdAt: new Date(Date.now() - 2 * 60 * 60000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60000),
      },
    ]

    logs.forEach((log) => this.medicationLogs.set(log.id, log))
  }

  private generateMedicationSettings() {
    const settings: MedicationSettings = {
      childId: "child-1",
      reminderAdvanceMinutes: 5,
      allowChildToMarkTaken: false,
      requireParentConfirmation: true,
      enableSoundAlerts: true,
      enablePushNotifications: true,
      missedDoseAlertMinutes: 30,
      updatedAt: new Date(),
    }

    this.medicationSettings.set(settings.childId, settings)
  }

  // API methods
  async authenticateUser(email: string, password: string): Promise<User | null> {
    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const user = Array.from(this.users.values()).find((u) => u.email === email)

    // Accept any password for simplicity - in real app this would be properly hashed
    if (user && password.length >= 1) {
      return user
    }

    return null
  }

  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) || null
  }

  getCurrentUser(): User | null {
    // In a real app, this would get the user from session/auth context
    // For demo purposes, return the parent user
    return this.users.get("parent-1") || null
  }

  async getChildByParent(parentId: string): Promise<Child | null> {
    return Array.from(this.children.values()).find((c) => c.parentId === parentId) || null
  }

  getChildrenByParent(parentId: string): Child[] {
    return Array.from(this.children.values()).filter((c) => c.parentId === parentId)
  }

  async getDevice(childId: string): Promise<Device | null> {
    return Array.from(this.devices.values()).find((d) => d.childId === childId) || null
  }

  async getFocusSessions(childId: string, days = 7): Promise<FocusSession[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return Array.from(this.focusSessions.values())
      .filter((s) => s.childId === childId && s.startTime >= cutoffDate)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
  }

  async getDailyReports(childId: string, days = 7): Promise<DailyReport[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffString = cutoffDate.toISOString().split("T")[0]

    return Array.from(this.dailyReports.values())
      .filter((r) => r.childId === childId && r.date >= cutoffString)
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter((m) => m.userId === userId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  async addChatMessage(message: Omit<ChatMessage, "id">): Promise<ChatMessage> {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newMessage: ChatMessage = { ...message, id }
    this.chatMessages.set(id, newMessage)
    return newMessage
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId)
    if (notification) {
      notification.read = true
      this.notifications.set(notificationId, notification)
    }
  }

  async updateDeviceStatus(deviceId: string, status: Device["status"], batteryLevel?: number): Promise<void> {
    const device = this.devices.get(deviceId)
    if (device) {
      device.status = status
      if (batteryLevel !== undefined) device.batteryLevel = batteryLevel
      device.lastSync = new Date()
      this.devices.set(deviceId, device)
    }
  }

  // Real-time data simulation
  getCurrentFocusData(childId: string) {
    const now = new Date()
    const baseScore = 60 + Math.sin(now.getTime() / 300000) * 20 // Oscillates between 40-80
    const noise = (Math.random() - 0.5) * 10

    return {
      focusScore: Math.max(0, Math.min(100, Math.round(baseScore + noise))),
      heartRate: Math.round(75 + Math.sin(now.getTime() / 180000) * 15 + (Math.random() - 0.5) * 5),
      fidgetLevel: Math.round(30 + Math.sin(now.getTime() / 240000) * 25 + (Math.random() - 0.5) * 10),
      activity: "Làm bài tập Toán",
      status: baseScore + noise > 45 ? "Tập trung tốt" : "Cần hỗ trợ",
      emoji: baseScore + noise > 70 ? "😊" : baseScore + noise > 45 ? "😐" : "😔",
    }
  }

  getCurrentSession(childId: string): FocusSession | null {
    // Find the most recent session that's still active (no endTime or endTime is very recent)
    const recentSessions = Array.from(this.focusSessions.values())
      .filter((s) => s.childId === childId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())

    if (recentSessions.length === 0) return null

    const mostRecent = recentSessions[0]
    const now = new Date()

    // Consider a session "current" if it started within the last 4 hours and either:
    // 1. Has no end time (still active)
    // 2. Ended within the last 30 minutes
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000)
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)

    if (mostRecent.startTime >= fourHoursAgo) {
      if (!mostRecent.endTime || mostRecent.endTime >= thirtyMinutesAgo) {
        return mostRecent
      }
    }

    return null
  }

  getDailyReport(childId: string, date: string): DailyReport | null {
    return Array.from(this.dailyReports.values()).find((r) => r.childId === childId && r.date === date) || null
  }

  getRecentSessions(childId: string, hours: number): FocusSession[] {
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - hours)

    return Array.from(this.focusSessions.values())
      .filter((s) => s.childId === childId && s.startTime >= cutoffDate)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
  }

  getScheduleByDate(childId: string, date: string): ScheduleItem[] {
    return Array.from(this.scheduleItems.values())
      .filter((item) => item.childId === childId && item.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  updateScheduleItem(itemId: string, updates: Partial<ScheduleItem>): ScheduleItem | null {
    const item = this.scheduleItems.get(itemId)
    if (!item) return null

    const updatedItem = {
      ...item,
      ...updates,
      updatedAt: new Date(),
    }

    this.scheduleItems.set(itemId, updatedItem)
    this.saveToStorage() // Save to localStorage when updated
    return updatedItem
  }

  createScheduleItem(item: Omit<ScheduleItem, "id" | "createdAt" | "updatedAt">): ScheduleItem {
    const id = `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newItem: ScheduleItem = {
      ...item,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.scheduleItems.set(id, newItem)
    return newItem
  }

  deleteScheduleItem(itemId: string): boolean {
    return this.scheduleItems.delete(itemId)
  }

  getChildById(childId: string): Child | null {
    return this.children.get(childId) || null
  }

  startFocusSession(childId: string, activity: string): FocusSession {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newSession: FocusSession = {
      id: sessionId,
      childId,
      deviceId: "device-1",
      startTime: new Date(),
      focusScore: 75,
      heartRate: 80,
      fidgetLevel: 30,
      activity,
      interventions: [],
      status: "active",
    }

    this.focusSessions.set(sessionId, newSession)
    return newSession
  }

  getChildRewardProfile(childId: string): ChildRewardProfile | null {
    let profile = this.childRewardProfiles.get(childId)
    
    // Auto-create profile if doesn't exist
    if (!profile) {
      profile = {
        childId,
        level: 1,
        currentPoints: 0,
        totalPointsEarned: 0,
        totalPointsSpent: 0,
        nextLevelPoints: 100,
        streakDays: 0,
        achievements: [],
        lastActivityDate: new Date(),
        dailyStickers: {
          unicorn: 0,
          total: 0
        },
        dailyBadges: {
          superStar: 0,
          total: 0
        },
        lastResetDate: new Date().toISOString().split('T')[0]
      }
      
      this.childRewardProfiles.set(childId, profile)
      console.log('Auto-created reward profile for child:', childId)
    }
    
    return profile
  }

  getRecentRewardPoints(childId: string, days: number): RewardPoints[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return Array.from(this.rewardPoints.values())
      .filter((point) => point.childId === childId && point.earnedAt >= cutoffDate)
      .sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime())
  }

  getAvailableRewards(childId: string): Reward[] {
    return Array.from(this.rewards.values())
      .filter((reward) => reward.childId === childId && reward.isActive)
      .sort((a, b) => a.pointsCost - b.pointsCost)
  }

  getPendingRedemptions(childId: string): RewardRedemption[] {
    return Array.from(this.rewardRedemptions.values())
      .filter((redemption) => redemption.childId === childId && redemption.status === "pending")
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
  }

  requestRewardRedemption(childId: string, rewardId: string, pointsCost: number): RewardRedemption | null {
    const profile = this.childRewardProfiles.get(childId)
    if (!profile || profile.currentPoints < pointsCost) {
      return null
    }

    const redemptionId = `redemption-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const redemption: RewardRedemption = {
      id: redemptionId,
      childId,
      rewardId,
      pointsSpent: pointsCost,
      status: "pending",
      requestedAt: new Date(),
    }

    // Deduct points temporarily (will be restored if rejected)
    profile.currentPoints -= pointsCost
    this.childRewardProfiles.set(childId, profile)

    this.rewardRedemptions.set(redemptionId, redemption)
    return redemption
  }

  approveRewardRedemption(redemptionId: string, approved: boolean, parentId: string): boolean {
    const redemption = this.rewardRedemptions.get(redemptionId)
    if (!redemption || redemption.status !== "pending") {
      return false
    }

    const profile = this.childRewardProfiles.get(redemption.childId)
    if (!profile) return false

    if (approved) {
      redemption.status = "approved"
      redemption.approvedAt = new Date()
      redemption.approvedBy = parentId
      profile.totalPointsSpent += redemption.pointsSpent
    } else {
      redemption.status = "rejected"
      // Restore points
      profile.currentPoints += redemption.pointsSpent
    }

    this.rewardRedemptions.set(redemptionId, redemption)
    this.childRewardProfiles.set(redemption.childId, profile)
    this.saveToStorage() // Save to localStorage when redemption status is updated
    return true
  }

  awardPoints(
    childId: string,
    points: number,
    reason: string,
    category: RewardPoints["category"],
    sessionId?: string,
    scheduleItemId?: string,
  ): RewardPoints {
    const pointId = `points-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const rewardPoint: RewardPoints = {
      id: pointId,
      childId,
      points,
      reason,
      category,
      earnedAt: new Date(),
      sessionId,
      scheduleItemId,
    }

    this.rewardPoints.set(pointId, rewardPoint)

    // Update profile
    const profile = this.childRewardProfiles.get(childId)
    if (profile) {
      profile.totalPointsEarned += points
      profile.currentPoints += points
      profile.lastActivityDate = new Date()

      // Check for level up
      const newLevel = Math.floor(profile.totalPointsEarned / 100) + 1
      if (newLevel > profile.level) {
        profile.level = newLevel
        profile.nextLevelPoints = newLevel * 100
        profile.achievements.push(`Đạt cấp ${newLevel}`)
      }

      this.childRewardProfiles.set(childId, profile)
      this.saveToStorage() // Save to localStorage when points are awarded
    }

    return rewardPoint
  }

  createReward(reward: Omit<Reward, "id" | "createdAt" | "updatedAt">): Reward {
    const id = `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newReward: Reward = {
      ...reward,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.rewards.set(id, newReward)
    return newReward
  }

  updateReward(rewardId: string, updates: Partial<Reward>): Reward | null {
    const reward = this.rewards.get(rewardId)
    if (!reward) return null

    const updatedReward = {
      ...reward,
      ...updates,
      updatedAt: new Date(),
    }

    this.rewards.set(rewardId, updatedReward)
    return updatedReward
  }

  deleteReward(rewardId: string): boolean {
    return this.rewards.delete(rewardId)
  }

  getCurrentWeeklyAssessment(childId: string): WeeklyAssessment | null {
    return (
      Array.from(this.weeklyAssessments.values())
        .filter((assessment) => assessment.childId === childId)
        .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime())[0] || null
    )
  }

  getPreviousWeeklyAssessment(childId: string): WeeklyAssessment | null {
    const assessments = Array.from(this.weeklyAssessments.values())
      .filter((assessment) => assessment.childId === childId)
      .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime())

    return assessments[1] || null
  }

  getRecentSymptomTracking(childId: string, days: number): ADHDSymptomTracking[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return Array.from(this.symptomTracking.values())
      .filter((symptom) => symptom.childId === childId && new Date(symptom.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  addSymptomTracking(symptom: Omit<ADHDSymptomTracking, "id" | "createdAt">): ADHDSymptomTracking {
    const id = `symptom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newSymptom: ADHDSymptomTracking = {
      ...symptom,
      id,
      createdAt: new Date(),
    }

    this.symptomTracking.set(id, newSymptom)
    return newSymptom
  }

  generateWeeklyAssessment(childId: string): WeeklyAssessment {
    // Get recent data for assessment
    const recentSessions = this.getRecentSessions(childId, 168) // Last week (168 hours)
    const recentSymptoms = this.getRecentSymptomTracking(childId, 7)
    const recentReports = Array.from(this.dailyReports.values())
      .filter((r) => r.childId === childId)
      .slice(0, 7)

    // Calculate scores
    const avgFocusScore = recentSessions.reduce((sum, s) => sum + s.focusScore, 0) / recentSessions.length || 0
    const avgSymptomSeverity =
      recentSymptoms.length > 0
        ? recentSymptoms.reduce((sum, s) => sum + s.hyperactivityLevel + s.inattentionLevel + s.impulsivityLevel, 0) /
          (recentSymptoms.length * 3)
        : 3

    const adhdSeverityScore = Math.round((avgSymptomSeverity / 5) * 100)
    const focusImprovementScore = Math.round(avgFocusScore)
    const behaviorScore = Math.round(75 + (Math.random() - 0.5) * 20) // 65-85 range

    const currentWeekStart = new Date()
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay())
    const currentWeekEnd = new Date(currentWeekStart)
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6)

    const assessment: WeeklyAssessment = {
      id: `assessment-${Date.now()}`,
      childId,
      weekStartDate: currentWeekStart.toISOString().split("T")[0],
      weekEndDate: currentWeekEnd.toISOString().split("T")[0],
      adhdSeverityScore,
      focusImprovementScore,
      behaviorScore,
      overallProgress:
        adhdSeverityScore <= 40
          ? "excellent"
          : adhdSeverityScore <= 60
            ? "good"
            : adhdSeverityScore <= 80
              ? "fair"
              : "needs_attention",
      recommendations: [
        "Tiếp tục sử dụng kỹ thuật Pomodoro để cải thiện thời gian tập trung",
        "Tăng cường hoạt động thể chất để giảm mức độ tăng động",
        "Thiết lập môi trường học tập yên tĩnh, ít kích thích",
        "Khuyến khích và khen ngợi khi con hoàn thành nhiệm vụ đúng hạn",
      ],
      keyInsights: [
        `Điểm tập trung trung bình trong tuần: ${focusImprovementScore}/100`,
        `Hoàn thành ${recentSessions.length} phiên học tập`,
        "Có tiến bộ trong việc duy trì sự chú ý",
      ],
      doctorRecommendation:
        adhdSeverityScore > 80
          ? "schedule_consultation"
          : adhdSeverityScore > 90
            ? "urgent_consultation"
            : "continue_monitoring",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.weeklyAssessments.set(assessment.id, assessment)
    return assessment
  }

  updateWeeklyAssessment(assessmentId: string, updates: Partial<WeeklyAssessment>): WeeklyAssessment | null {
    const assessment = this.weeklyAssessments.get(assessmentId)
    if (!assessment) return null

    const updatedAssessment = {
      ...assessment,
      ...updates,
      updatedAt: new Date(),
    }

    this.weeklyAssessments.set(assessmentId, updatedAssessment)
    return updatedAssessment
  }

  getWeeklyAssessmentHistory(childId: string, weeks = 4): WeeklyAssessment[] {
    return Array.from(this.weeklyAssessments.values())
      .filter((assessment) => assessment.childId === childId)
      .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime())
      .slice(0, weeks)
  }

  createMedicationReminder(reminder: Omit<MedicationReminder, "id">): MedicationReminder {
    const id = `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newReminder: MedicationReminder = {
      ...reminder,
      id,
    }

    this.medicationReminders.set(id, newReminder)
    return newReminder
  }

  getMedicationReminders(childId: string): MedicationReminder[] {
    return Array.from(this.medicationReminders.values())
      .filter((reminder) => reminder.childId === childId)
      .sort((a, b) => a.medicationName.localeCompare(b.medicationName))
  }

  updateMedicationReminder(reminderId: string, updates: Partial<MedicationReminder>): MedicationReminder | null {
    const reminder = this.medicationReminders.get(reminderId)
    if (!reminder) return null

    const updatedReminder = {
      ...reminder,
      ...updates,
      updatedAt: new Date(),
    }

    this.medicationReminders.set(reminderId, updatedReminder)
    return updatedReminder
  }

  deleteMedicationReminder(reminderId: string): boolean {
    return this.medicationReminders.delete(reminderId)
  }

  createMedicationLog(log: Omit<MedicationLog, "id">): MedicationLog {
    const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newLog: MedicationLog = {
      ...log,
      id,
    }

    this.medicationLogs.set(id, newLog)
    this.saveToStorage() // Save to localStorage when created
    return newLog
  }

  getMedicationLogs(childId: string, startDate?: Date, endDate?: Date): MedicationLog[] {
    return Array.from(this.medicationLogs.values())
      .filter((log) => {
        if (log.childId !== childId) return false
        if (startDate && log.scheduledTime < startDate) return false
        if (endDate && log.scheduledTime > endDate) return false
        return true
      })
      .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())
  }

  getTodayMedicationLogs(childId: string): MedicationLog[] {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    return this.getMedicationLogs(childId, startOfDay, endOfDay)
  }

  updateMedicationLog(logId: string, updates: Partial<MedicationLog>): MedicationLog | null {
    const log = this.medicationLogs.get(logId)
    if (!log) return null

    const updatedLog = {
      ...log,
      ...updates,
    }

    this.medicationLogs.set(logId, updatedLog)
    this.saveToStorage() // Save to localStorage when updated
    return updatedLog
  }

  getMedicationSettings(childId: string): MedicationSettings | null {
    return (
      this.medicationSettings.get(childId) || {
        childId,
        reminderAdvanceMinutes: 5,
        allowChildToMarkTaken: false,
        requireParentConfirmation: true,
        enableSoundAlerts: true,
        enablePushNotifications: true,
        missedDoseAlertMinutes: 30,
        updatedAt: new Date(),
      }
    )
  }

  updateMedicationSettings(childId: string, settings: MedicationSettings): MedicationSettings {
    this.medicationSettings.set(childId, settings)
    return settings
  }

  getMedicationAdherence(
    childId: string,
    days = 7,
  ): {
    totalScheduled: number
    totalTaken: number
    adherenceRate: number
    missedDoses: MedicationLog[]
  } {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const logs = this.getMedicationLogs(childId, startDate, endDate)
    const totalScheduled = logs.length
    const takenLogs = logs.filter((log) => log.status === "taken")
    const totalTaken = takenLogs.length
    const missedDoses = logs.filter((log) => log.status === "missed")

    return {
      totalScheduled,
      totalTaken,
      adherenceRate: totalScheduled > 0 ? (totalTaken / totalScheduled) * 100 : 0,
      missedDoses,
    }
  }

  // Find parent of a child
  getParentIdByChildId(childId: string): string | null {
    const child = this.children.get(childId)
    return child?.parentId || null
  }

  // Create notification for parent
  createNotificationForParent(
    childId: string,
    type: "schedule_completed" | "break_taken" | "medicine_taken" | "child_login" | "child_logout",
    title: string,
    message: string,
    activityId?: string
  ): void {
    const parentId = this.getParentIdByChildId(childId)
    if (!parentId) return

    const notification: Notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: parentId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
      childId,
      activityId
    }

    this.notifications.set(notification.id, notification)
  }

  // Notify parent when child completes schedule activity
  notifyScheduleActivityCompleted(childId: string, activity: ScheduleItem): void {
    const child = this.children.get(childId)
    if (!child) return

    this.createNotificationForParent(
      childId,
      "schedule_completed",
      "🎉 Hoàn thành bài học",
      `${child.name} đã hoàn thành bài "${activity.title}" (${activity.subject}) lúc ${new Date().toLocaleTimeString('vi-VN')}`,
      activity.id
    )
  }

  // Notify parent when child takes break
  notifyBreakTaken(childId: string, activity?: ScheduleItem): void {
    const child = this.children.get(childId)
    if (!child) return

    const activityInfo = activity ? ` từ bài "${activity.title}"` : ""
    
    this.createNotificationForParent(
      childId,
      "break_taken",
      "☕ Nghỉ giải lao",
      `${child.name} đã xin nghỉ giải lao${activityInfo} lúc ${new Date().toLocaleTimeString('vi-VN')}`,
      activity?.id
    )
  }

  // Notify parent when child takes medicine
  notifyMedicineTaken(childId: string, medicineLog: MedicationLog): void {
    const child = this.children.get(childId)
    if (!child) return

    // Extract medicine name from notes if available
    const medicineName = medicineLog.notes?.split(' ')[0] || "thuốc"
    
    this.createNotificationForParent(
      childId,
      "medicine_taken",
      "💊 Đã uống thuốc",
      `${child.name} đã uống ${medicineName} lúc ${new Date().toLocaleTimeString('vi-VN')}`,
      medicineLog.id
    )
  }

  // Notify parent when child logs in
  notifyChildLogin(childId: string): void {
    const child = this.children.get(childId)
    if (!child) return
    
    this.createNotificationForParent(
      childId,
      "child_login",
      "🟢 Trẻ đang hoạt động",
      `${child.name} đã đăng nhập lúc ${new Date().toLocaleTimeString('vi-VN')}`
    )
  }

  // Notify parent when child logs out
  notifyChildLogout(childId: string): void {
    const child = this.children.get(childId)
    if (!child) return
    
    this.createNotificationForParent(
      childId,
      "child_logout",
      "🔴 Trẻ đã dừng hoạt động",
      `${child.name} đã đăng xuất lúc ${new Date().toLocaleTimeString('vi-VN')}`
    )
  }

  // Reset daily rewards at midnight
  private checkAndResetDailyRewards(childId: string): void {
    const profile = this.childRewardProfiles.get(childId)
    if (!profile) return

    const today = new Date().toISOString().split('T')[0]
    if (profile.lastResetDate !== today) {
      // Reset daily counters
      profile.dailyStickers = { unicorn: 0, total: 0 }
      profile.dailyBadges = { superStar: 0, total: 0 }
      profile.lastResetDate = today
      
      this.childRewardProfiles.set(childId, profile)
    }
  }

  // Award Unicorn Sticker for schedule completion (5 stars)
  awardUnicornSticker(childId: string, scheduleItemId: string): void {
    console.log('🦄 Awarding Unicorn Sticker to child:', childId, 'for schedule:', scheduleItemId)
    
    this.checkAndResetDailyRewards(childId)
    
    const profile = this.getChildRewardProfile(childId)
    if (!profile) {
      console.error('❌ No reward profile found for child:', childId)
      return
    }

    console.log('📊 Current profile before reward:', profile)

    // Add sticker
    profile.dailyStickers.unicorn += 1
    profile.dailyStickers.total += 1
    
    // Add points
    profile.totalPointsEarned += 5
    profile.currentPoints += 5

    this.childRewardProfiles.set(childId, profile)
    this.saveToStorage() // Save to localStorage when reward profile is updated

    console.log('✅ Updated profile after reward:', profile)

    // Create reward points record
    const pointId = `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const rewardPoint: RewardPoints = {
      id: pointId,
      childId,
      points: 5,
      reason: "Hoàn thành bài tập",
      category: "schedule_completion",
      earnedAt: new Date(),
      scheduleItemId,
      rewardType: "sticker_unicorn"
    }

    this.rewardPoints.set(pointId, rewardPoint)
    console.log('💫 Created reward point record:', rewardPoint)
  }

  // Award Badge Super Star for medicine taking (10 stars)
  awardSuperStarBadge(childId: string, medicineId: string): void {
    console.log('⭐ Awarding Super Star Badge to child:', childId, 'for medicine:', medicineId)
    
    this.checkAndResetDailyRewards(childId)
    
    const profile = this.getChildRewardProfile(childId)
    if (!profile) {
      console.error('❌ No reward profile found for child:', childId)
      return
    }

    console.log('📊 Current profile before reward:', profile)

    // Add badge
    profile.dailyBadges.superStar += 1
    profile.dailyBadges.total += 1
    
    // Add points
    profile.totalPointsEarned += 10
    profile.currentPoints += 10

    this.childRewardProfiles.set(childId, profile)

    console.log('✅ Updated profile after reward:', profile)

    // Create reward points record
    const pointId = `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const rewardPoint: RewardPoints = {
      id: pointId,
      childId,
      points: 10,
      reason: "Uống thuốc đúng giờ",
      category: "medicine_taken",
      earnedAt: new Date(),
      scheduleItemId: medicineId,
      rewardType: "badge_super_star"
    }

    this.rewardPoints.set(pointId, rewardPoint)
    console.log('💫 Created reward point record:', rewardPoint)
  }

  // Get daily reward summary for child
  getDailyRewardSummary(childId: string): { stickers: any, badges: any, totalStars: number } {
    this.checkAndResetDailyRewards(childId)
    
    const profile = this.childRewardProfiles.get(childId)
    if (!profile) {
      return {
        stickers: { unicorn: 0, total: 0 },
        badges: { superStar: 0, total: 0 },
        totalStars: 0
      }
    }

    const totalStars = (profile.dailyStickers.unicorn * 5) + (profile.dailyBadges.superStar * 10)
    
    return {
      stickers: profile.dailyStickers,
      badges: profile.dailyBadges,
      totalStars
    }
  }
}

// Export singleton instance
export const dataStore = new DataStore()
