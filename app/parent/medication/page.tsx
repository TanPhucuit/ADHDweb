import { MedicationReminderDashboard } from "@/components/medication/medication-reminder-dashboard"

export default function ParentMedicationPage() {
  // In a real app, get childId from selected child or route params
  const childId = "child-1"

  return (
    <div className="container mx-auto py-6">
      <MedicationReminderDashboard childId={childId} isParentView={true} />
    </div>
  )
}
