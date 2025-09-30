import { ScheduleManagement } from "@/components/schedule/schedule-management"

export default function ParentSchedulePage() {
  return (
    <div className="container mx-auto py-6">
      <ScheduleManagement childId="child-1" isParentView={true} />
    </div>
  )
}
