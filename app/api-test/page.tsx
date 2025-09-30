"use client"

import { useState, useEffect } from 'react'
import { apiService } from '@/lib/api-service'

export default function ApiTestPage() {
  const [scheduleData, setScheduleData] = useState([])
  const [medicationData, setMedicationData] = useState([])
  const [rewardData, setRewardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading data from APIs...')
      
      const [schedules, medications, rewards] = await Promise.all([
        apiService.getScheduleActivities('child-1'),
        apiService.getMedicationLogs('child-1'),
        apiService.getRewardPoints('child-1')
      ])
      
      setScheduleData(schedules)
      setMedicationData(medications)
      setRewardData(rewards)
      
      console.log('✅ Data loaded:', { schedules, medications, rewards })
    } catch (error) {
      console.error('❌ Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const completeActivity = async (activityId: string) => {
    try {
      console.log('🎯 Completing activity:', activityId)
      const result = await apiService.completeScheduleActivity(activityId)
      console.log('✅ Activity completed:', result)
      
      // Reload data to see changes
      await loadData()
    } catch (error) {
      console.error('❌ Error completing activity:', error)
    }
  }

  const takeMedication = async (medicationId: string) => {
    try {
      console.log('💊 Taking medication:', medicationId)
      const result = await apiService.takeMedication(medicationId, 'Đã uống thuốc')
      console.log('✅ Medication taken:', result)
      
      // Reload data to see changes
      await loadData()
    } catch (error) {
      console.error('❌ Error taking medication:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
        <div className="text-white text-xl">Đang tải dữ liệu từ API...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-400 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          🎯 API Integration Test - Persistent State Demo
        </h1>

        {/* Rewards Display */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold text-purple-800 mb-4 text-center">
            🌟 Điểm thưởng tổng: {rewardData?.totalStars || 0} sao
          </h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-green-100 rounded-lg p-4">
              <div className="text-green-600 font-bold">Hoạt động học tập</div>
              <div className="text-2xl font-bold text-green-800">
                {rewardData?.breakdown.scheduleStars || 0} sao
              </div>
              <div className="text-sm text-green-600">
                ({rewardData?.breakdown.scheduleActivities || 0} × 5 sao)
              </div>
            </div>
            <div className="bg-blue-100 rounded-lg p-4">
              <div className="text-blue-600 font-bold">Uống thuốc</div>
              <div className="text-2xl font-bold text-blue-800">
                {rewardData?.breakdown.medicationStars || 0} sao
              </div>
              <div className="text-sm text-blue-600">
                ({rewardData?.breakdown.medicationLogs || 0} × 10 sao)
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Activities */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-purple-800 mb-4">📚 Hoạt động học tập</h2>
          <div className="space-y-3">
            {scheduleData.map((activity: any) => (
              <div key={activity.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold">{activity.subject}</div>
                  <div className="text-sm text-gray-600">{activity.title}</div>
                  <div className="text-xs text-gray-500">{activity.start_time} - {activity.end_time}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    activity.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status === 'completed' ? 'Hoàn thành' : 'Chưa làm'}
                  </span>
                  {activity.status === 'pending' && (
                    <button
                      onClick={() => completeActivity(activity.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Hoàn thành (+5 sao)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div className="bg-white rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-purple-800 mb-4">💊 Thuốc cần uống</h2>
          <div className="space-y-3">
            {medicationData.map((med: any) => (
              <div key={med.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold">{med.medication_name}</div>
                  <div className="text-sm text-gray-600">Liều lượng: {med.dosage}</div>
                  <div className="text-xs text-gray-500">
                    Thời gian: {new Date(med.scheduled_time).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    med.status === 'taken' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {med.status === 'taken' ? 'Đã uống' : 'Chưa uống'}
                  </span>
                  {med.status === 'pending' && (
                    <button
                      onClick={() => takeMedication(med.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Uống thuốc (+10 sao)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={loadData}
            className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50"
          >
            🔄 Tải lại dữ liệu
          </button>
        </div>
      </div>
    </div>
  )
}