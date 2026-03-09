"use client"

import type { Child } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { BackButton } from "@/components/ui/back-button"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface ReportData {
  scheduleActivities: any[]
  medicationLogs: any[]
  parentActions: any[]
}

interface ReportsHeaderProps {
  child: Child | null
  data?: ReportData
  dateRange?: string
}

function buildReportHtml(child: Child, data: ReportData, dateRange: string): string {
  const { scheduleActivities, medicationLogs, parentActions } = data
  const exportDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const rangeLabel = dateRange === 'today' ? 'Hôm nay' : dateRange === '7days' ? '7 ngày gần đây' : '30 ngày gần đây'

  const completed = scheduleActivities.filter(a => a.status === 'completed').length
  const totalAct = scheduleActivities.length
  const taken = medicationLogs.filter(l => l.taken || l.status === 'taken').length
  const totalMed = medicationLogs.length
  const completionRate = totalAct > 0 ? Math.round((completed / totalAct) * 100) : 0
  const medRate = totalMed > 0 ? Math.round((taken / totalMed) * 100) : 0

  const rateColor = completionRate >= 80 ? '#16a34a' : completionRate >= 60 ? '#d97706' : '#dc2626'
  const medColor = medRate >= 80 ? '#16a34a' : medRate >= 60 ? '#d97706' : '#dc2626'

  const actRows = scheduleActivities.map((a, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
      <td style="padding:9px 10px;color:#374151;font-size:13px">${a.completed_at ? new Date(a.completed_at).toLocaleDateString('vi-VN') : 'N/A'}</td>
      <td style="padding:9px 10px;color:#111827;font-weight:600;font-size:13px">${a.subject || a.activity_name || 'Không rõ'}</td>
      <td style="padding:9px 10px;color:#6b7280;font-size:13px">${a.start_time && a.end_time ? `${a.start_time} – ${a.end_time}` : 'N/A'}</td>
      <td style="padding:9px 10px;font-size:13px">
        <span style="padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;background:${a.status === 'completed' ? '#dcfce7' : '#fef3c7'};color:${a.status === 'completed' ? '#166534' : '#92400e'}">
          ${a.status === 'completed' ? '✓ Hoàn thành' : a.status || 'Chờ'}
        </span>
      </td>
    </tr>`).join('')

  const medRows = medicationLogs.map((l, i) => {
    const ok = l.taken || l.status === 'taken'
    return `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
      <td style="padding:9px 10px;color:#374151;font-size:13px">${l.taken_at ? new Date(l.taken_at).toLocaleDateString('vi-VN') : 'N/A'}</td>
      <td style="padding:9px 10px;color:#111827;font-weight:600;font-size:13px">${l.medication_name || 'Không rõ'}</td>
      <td style="padding:9px 10px;color:#6b7280;font-size:13px">${l.dosage || 'N/A'}</td>
      <td style="padding:9px 10px;color:#6b7280;font-size:13px">${l.taken_at ? new Date(l.taken_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
      <td style="padding:9px 10px;font-size:13px">
        <span style="padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;background:${ok ? '#dcfce7' : '#fee2e2'};color:${ok ? '#166534' : '#991b1b'}">
          ${ok ? '✓ Đã uống' : '✗ Bỏ lỡ'}
        </span>
      </td>
      <td style="padding:9px 10px;color:#9ca3af;font-size:12px">${l.notes || '—'}</td>
    </tr>`
  }).join('')

  const actionLabelMap: Record<string, string> = {
    'khen-ngoi': 'Khen ngợi',
    'dong-vien': 'Động viên',
    'nhac-tap-trung': 'Nhắc nhở tập trung',
    'nghi-giai-lao': 'Cho nghỉ giải lao',
  }

  const actionRows = parentActions.map((a, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
      <td style="padding:9px 10px;color:#374151;font-size:13px">${a.created_at || a.timestamp ? new Date(a.created_at || a.timestamp).toLocaleDateString('vi-VN') : 'N/A'}</td>
      <td style="padding:9px 10px;color:#374151;font-size:13px">${a.created_at || a.timestamp ? new Date(a.created_at || a.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
      <td style="padding:9px 10px;color:#111827;font-weight:600;font-size:13px">${actionLabelMap[a.action_label || a.action_type || ''] || a.action_type || a.action_label || 'Không rõ'}</td>
      <td style="padding:9px 10px;color:#6b7280;font-size:13px">${a.description || a.message || '—'}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo cáo tiến độ học tập — ${child.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #1f2937; }
    @media print {
      body { background: white; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    .container { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
    /* Header */
    .report-header { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #0ea5e9 100%); border-radius: 16px; padding: 28px 32px; color: white; margin-bottom: 24px; }
    .report-header h1 { font-size: 26px; font-weight: 800; margin-bottom: 6px; }
    .report-header .meta { font-size: 14px; opacity: 0.85; display: flex; gap: 24px; flex-wrap: wrap; margin-top: 12px; }
    .report-header .meta span { display: flex; align-items: center; gap: 6px; }
    /* Summary cards */
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .summary-card { background: white; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.07); border: 1px solid #e5e7eb; }
    .summary-card .num { font-size: 28px; font-weight: 900; line-height: 1; }
    .summary-card .lbl { font-size: 12px; color: #6b7280; margin-top: 6px; }
    /* Section */
    .section { background: white; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); border: 1px solid #e5e7eb; margin-bottom: 20px; overflow: hidden; }
    .section-header { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
    .section-header h2 { font-size: 16px; font-weight: 700; color: #111827; }
    .section-header .badge { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
    /* Table */
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f8fafc; }
    thead th { padding: 10px 10px; font-size: 12px; font-weight: 700; color: #374151; text-align: left; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #e5e7eb; }
    tbody tr:last-child td { border-bottom: none; }
    tbody td { border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .empty { padding: 32px; text-align: center; color: #9ca3af; font-style: italic; font-size: 14px; }
    /* Print button */
    .print-bar { text-align: right; margin-bottom: 20px; }
    .print-btn { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .print-btn:hover { background: #1d4ed8; }
    /* Footer */
    .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
<div class="container">

  <div class="print-bar no-print">
    <button class="print-btn" onclick="window.print()">🖨️ In / Lưu PDF</button>
  </div>

  <!-- Header -->
  <div class="report-header">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px">
      <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px">📊</div>
      <div>
        <h1>Báo cáo tiến độ học tập</h1>
        <div style="font-size:18px;font-weight:700;opacity:0.9">${child.name}</div>
      </div>
    </div>
    <div class="meta">
      <span>📅 Kỳ báo cáo: ${rangeLabel}</span>
      <span>🗓️ Xuất ngày: ${exportDate}</span>
      <span>🏫 Hệ thống quản lý ADHD</span>
    </div>
  </div>

  <!-- Summary -->
  <div class="summary-grid">
    <div class="summary-card">
      <div class="num" style="color:#2563eb">${completed}/${totalAct}</div>
      <div class="lbl">Hoạt động hoàn thành</div>
    </div>
    <div class="summary-card">
      <div class="num" style="color:${rateColor}">${completionRate}%</div>
      <div class="lbl">Tỷ lệ hoàn thành</div>
    </div>
    <div class="summary-card">
      <div class="num" style="color:${medColor}">${taken}/${totalMed}</div>
      <div class="lbl">Uống thuốc đúng lịch</div>
    </div>
    <div class="summary-card">
      <div class="num" style="color:#7c3aed">${parentActions.length}</div>
      <div class="lbl">Lần can thiệp</div>
    </div>
  </div>

  <!-- Activities -->
  <div class="section">
    <div class="section-header">
      <h2>📅 Hoạt động học tập</h2>
      <span class="badge" style="background:#dbeafe;color:#1e40af">${totalAct} hoạt động</span>
    </div>
    ${totalAct === 0 ? '<p class="empty">Chưa có hoạt động nào trong kỳ báo cáo này.</p>' : `
    <table>
      <thead><tr>
        <th>Ngày</th><th>Môn học / Hoạt động</th><th>Giờ học</th><th>Kết quả</th>
      </tr></thead>
      <tbody>${actRows}</tbody>
    </table>`}
  </div>

  <!-- Medications -->
  <div class="section">
    <div class="section-header">
      <h2>💊 Lịch sử uống thuốc</h2>
      <span class="badge" style="background:#d1fae5;color:#065f46">${taken}/${totalMed} lần đúng giờ</span>
    </div>
    ${totalMed === 0 ? '<p class="empty">Chưa có bản ghi uống thuốc nào.</p>' : `
    <table>
      <thead><tr>
        <th>Ngày</th><th>Tên thuốc</th><th>Liều lượng</th><th>Giờ uống</th><th>Trạng thái</th><th>Ghi chú</th>
      </tr></thead>
      <tbody>${medRows}</tbody>
    </table>`}
  </div>

  ${parentActions.length > 0 ? `
  <!-- Parent actions -->
  <div class="section">
    <div class="section-header">
      <h2>👨‍👩‍👧 Can thiệp của phụ huynh</h2>
      <span class="badge" style="background:#fef3c7;color:#92400e">${parentActions.length} lần</span>
    </div>
    <table>
      <thead><tr>
        <th>Ngày</th><th>Giờ</th><th>Loại can thiệp</th><th>Mô tả</th>
      </tr></thead>
      <tbody>${actionRows}</tbody>
    </table>
  </div>` : ''}

  <!-- Evaluation -->
  <div class="section">
    <div class="section-header"><h2>📈 Nhận xét tổng quan</h2></div>
    <div style="padding:20px;display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div style="padding:16px;border-radius:10px;background:${completionRate >= 80 ? '#f0fdf4' : completionRate >= 60 ? '#fffbeb' : '#fef2f2'};border-left:4px solid ${rateColor}">
        <div style="font-weight:700;margin-bottom:6px;color:#111827">Học tập</div>
        <div style="font-size:14px;color:#374151">
          ${completionRate >= 80
            ? `Xuất sắc! Hoàn thành ${completionRate}% các hoạt động. Trẻ đang học tập rất tốt.`
            : completionRate >= 60
            ? `Khá tốt! Tỷ lệ hoàn thành ${completionRate}%. Có thể cải thiện để đạt mục tiêu 80%.`
            : `Cần cải thiện. Tỷ lệ hoàn thành chỉ đạt ${completionRate}%. Hãy tăng cường hỗ trợ.`}
        </div>
      </div>
      <div style="padding:16px;border-radius:10px;background:${medRate >= 80 ? '#f0fdf4' : medRate >= 60 ? '#fffbeb' : '#fef2f2'};border-left:4px solid ${medColor}">
        <div style="font-weight:700;margin-bottom:6px;color:#111827">Tuân thủ thuốc</div>
        <div style="font-size:14px;color:#374151">
          ${totalMed === 0 ? 'Không có dữ liệu thuốc trong kỳ này.' :
            medRate >= 80
            ? `Rất tốt! Uống thuốc đúng giờ ${medRate}% số lần (${taken}/${totalMed}).`
            : medRate >= 60
            ? `Cần theo dõi. Chỉ uống đúng giờ ${medRate}% (${taken}/${totalMed} lần). Cần nhắc nhở thêm.`
            : `Đáng lo ngại! Bỏ lỡ nhiều lần uống thuốc. Cần kiểm tra lại lịch nhắc nhở.`}
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    Báo cáo được tạo tự động bởi Hệ thống quản lý ADHD — ${exportDate}
  </div>

</div>
</body>
</html>`
}

export function ReportsHeader({ child, data, dateRange = '7days' }: ReportsHeaderProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  if (!child) {
    return (
      <header className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Đang tải báo cáo...</h1>
              <p className="text-sm text-gray-600">Vui lòng chờ trong giây lát</p>
            </div>
          </div>
        </div>
      </header>
    )
  }

  const handleExport = () => {
    try {
      setIsExporting(true)

      const reportData: ReportData = data ?? { scheduleActivities: [], medicationLogs: [], parentActions: [] }
      const html = buildReportHtml(child, reportData, dateRange)

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `BaoCao_${child.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Đã tải báo cáo!',
        description: 'Mở file HTML rồi nhấn Ctrl+P (hoặc nút "In / Lưu PDF") để lưu PDF.',
      })
    } catch (err) {
      console.error('Export error:', err)
      toast({ title: 'Lỗi xuất báo cáo', variant: 'destructive' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <header className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Báo cáo của {child.name}</h1>
              <p className="text-sm text-gray-600">Phân tích dữ liệu tập trung và học tập</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Đang tạo...' : 'Tải báo cáo'}
        </Button>
      </div>
    </header>
  )
}
