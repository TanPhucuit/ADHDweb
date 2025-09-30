import { MedicationReminderDashboard } from "@/components/medication/medication-reminder-dashboard"
import { GoBackButton } from "@/components/ui/go-back-button"

export default function ChildMedicationPage() {
  // In a real app, get childId from auth/session
  const childId = "child-1"

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <GoBackButton className="text-gray-600 hover:bg-gray-100" />
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">💊 Nhắc nhở uống thuốc</h1>
            <p className="text-gray-600">Theo dõi và nhắc nhở uống thuốc đúng giờ</p>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <MedicationReminderDashboard childId={childId} isParentView={false} />
        </div>
      </div>
    </div>
  )
}
