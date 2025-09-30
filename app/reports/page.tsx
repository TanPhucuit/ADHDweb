import { ReportsHeader } from "@/components/reports/reports-header"
import { DateRangeSelector } from "@/components/reports/date-range-selector"
import { FocusScoreChart } from "@/components/reports/focus-score-chart"
import { SubjectPerformanceChart } from "@/components/reports/subject-performance-chart"
import { TimeDistributionChart } from "@/components/reports/time-distribution-chart"
import { HistoricalDataTable } from "@/components/reports/historical-data-table"

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <ReportsHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Date Range Selector */}
        <DateRangeSelector />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Focus Score Over Time */}
          <div className="lg:col-span-2">
            <FocusScoreChart />
          </div>

          {/* Subject Performance */}
          <SubjectPerformanceChart />

          {/* Time Distribution */}
          <TimeDistributionChart />
        </div>

        {/* Historical Data Table */}
        <HistoricalDataTable />
      </main>
    </div>
  )
}
