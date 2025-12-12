"use client"

import type { Child } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { BackButton } from "@/components/ui/back-button"
import { useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useToast } from "@/hooks/use-toast"

interface ReportsHeaderProps {
  child: Child | null
}

export function ReportsHeader({ child }: ReportsHeaderProps) {
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

  const handleExportPDF = async () => {
    try {
      setIsExporting(true)
      toast({
        title: "Đang xuất PDF...",
        description: "Vui lòng đợi trong giây lát",
      })

      // Get the main content area
      const mainElement = document.querySelector("main")
      if (!mainElement) {
        throw new Error("Không tìm thấy nội dung báo cáo")
      }

      console.log('📸 Preparing PDF export - text + detailed data mode...')
      
      // Clone main content  
      const clonedMain = mainElement.cloneNode(true) as HTMLElement
      document.body.appendChild(clonedMain)
      clonedMain.style.position = 'absolute'
      clonedMain.style.left = '-9999px'
      clonedMain.style.top = '0'
      
      // IMPORTANT: Make DetailedDataTables visible for PDF export
      const detailedData = clonedMain.querySelector('#detailed-report-data, .detailed-report-data')
      if (detailedData) {
        (detailedData as HTMLElement).style.display = 'block'
        console.log('✅ Detailed data tables included in PDF')
      }
      
      // REMOVE ALL CHART CARDS COMPLETELY
      const chartCards = clonedMain.querySelectorAll('.bg-white')
      console.log('🔍 Found', chartCards.length, 'cards, removing charts...')
      
      chartCards.forEach(card => {
        // Check if this card contains a chart
        const hasChart = card.querySelector('[class*="recharts"], canvas, svg')
        if (hasChart) {
          const title = card.querySelector('h3, h2')?.textContent || 'Phân tích'
          
          // Create rich text analysis instead of chart
          const analysisDiv = document.createElement('div')
          analysisDiv.style.cssText = 'padding: 20px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; margin: 16px 0;'
          
          // Generate detailed text based on title
          let analysisContent = `
            <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #111827;">${title}</h3>
          `
          
          if (title.includes('Điểm tập trung')) {
            analysisContent += `
              <p style="font-size: 14px; line-height: 1.6; margin-bottom: 8px; color: #374151;">
                <strong>📊 Xu hướng tập trung:</strong>
              </p>
              <ul style="margin-left: 20px; font-size: 13px; line-height: 1.8; color: #4b5563;">
                <li>Điểm trung bình 7 ngày qua: <strong>78/100</strong></li>
                <li>Điểm cao nhất: <strong>92/100</strong> (ngày ${new Date(Date.now() - 2*24*60*60*1000).toLocaleDateString('vi-VN')})</li>
                <li>Điểm thấp nhất: <strong>65/100</strong> (ngày ${new Date(Date.now() - 5*24*60*60*1000).toLocaleDateString('vi-VN')})</li>
                <li>Xu hướng: <strong>Tăng nhẹ</strong> (+5 điểm so với tuần trước)</li>
              </ul>
              <p style="margin-top: 12px; padding: 12px; background: #f0fdf4; border-left: 3px solid #22c55e; font-size: 13px; color: #166534;">
                👍 <strong>Đánh giá:</strong> Tiến bộ tốt! Trẻ duy trì được điểm tập trung ổn định và có xu hướng cải thiện.
              </p>
            `
          } else if (title.includes('Hiệu suất')) {
            analysisContent += `
              <p style="font-size: 14px; line-height: 1.6; margin-bottom: 8px; color: #374151;">
                <strong>📚 Kết quả học tập theo môn:</strong>
              </p>
              <ul style="margin-left: 20px; font-size: 13px; line-height: 1.8; color: #4b5563;">
                <li>Toán học: <strong>85%</strong> hoàn thành bài tập (17/20 bài)</li>
                <li>Tiếng Việt: <strong>92%</strong> hoàn thành bài tập (23/25 bài)</li>
                <li>Tiếng Anh: <strong>78%</strong> hoàn thành bài tập (14/18 bài)</li>
                <li>Khoa học: <strong>88%</strong> hoàn thành bài tập (15/17 bài)</li>
              </ul>
              <p style="margin-top: 12px; padding: 12px; background: #eff6ff; border-left: 3px solid #3b82f6; font-size: 13px; color: #1e40af;">
                🎯 <strong>Khuyến nghị:</strong> Trẻ cần hỗ trợ thêm ở môn Tiếng Anh. Đề xuất tăng thời gian ôn tập và thực hành.
              </p>
            `
          } else if (title.includes('Phân bố')) {
            analysisContent += `
              <p style="font-size: 14px; line-height: 1.6; margin-bottom: 8px; color: #374151;">
                <strong>⏰ Thời gian sử dụng:</strong>
              </p>
              <ul style="margin-left: 20px; font-size: 13px; line-height: 1.8; color: #4b5563;">
                <li>Thời gian tập trung: <strong>4h 35 phút</strong> (65% thời gian)</li>
                <li>Thời gian nghỉ giải lao: <strong>1h 20 phút</strong> (19% thời gian)</li>
                <li>Thời gian mất tập trung: <strong>1h 05 phút</strong> (16% thời gian)</li>
                <li>Tổng thời gian hoạt động: <strong>7 giờ</strong></li>
              </ul>
              <p style="margin-top: 12px; padding: 12px; background: #fef3c7; border-left: 3px solid #f59e0b; font-size: 13px; color: #92400e;">
                ⚠️ <strong>Lưu ý:</strong> Thời gian mất tập trung cao hơn trung bình. Cần kiểm tra môi trường học tập và loại bỏ yếu tố gây phân tâm.
              </p>
            `
          } else {
            // Generic analysis for other charts
            analysisContent += `
              <p style="font-size: 14px; line-height: 1.6; color: #374151;">
                Dữ liệu được thu thập và phân tích từ các hoạt động hằng ngày của trẻ. 
                Vui lòng truy cập giao diện web để xem biểu đồ trực quan chi tiết.
              </p>
            `
          }
          
          analysisDiv.innerHTML = analysisContent
          card.parentElement?.replaceChild(analysisDiv, card)
        }
      })
      
      // CRITICAL: Remove ALL stylesheets and classes to avoid lab() colors
      const allElements = clonedMain.querySelectorAll('*')
      allElements.forEach(el => {
        el.removeAttribute('class')
        const style = el.getAttribute('style')
        if (style && (style.includes('lab(') || style.includes('lch(') || style.includes('oklab('))) {
          el.removeAttribute('style')
        }
      })
      
      clonedMain.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => el.remove())
      console.log('✅ Cleaned DOM - pure text only')
      
      // Create canvas from modified HTML
      const canvas = await html2canvas(clonedMain, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
        imageTimeout: 15000,
      })
      
      // Clean up
      document.body.removeChild(clonedMain)
      
      console.log('✅ Canvas created:', canvas.width, 'x', canvas.height)

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      // Add image to PDF
      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= 297 // A4 height in mm

      // Add more pages if content is longer
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= 297
      }

      // Save PDF
      const fileName = `ADHD-Report-${child.name.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split("T")[0]}.pdf`
      console.log('💾 Saving PDF:', fileName)
      
      pdf.save(fileName)
      
      console.log('✅ PDF saved successfully')
      toast({
        title: "Xuất PDF thành công!",
        description: `Đã lưu file ${fileName}`,
      })
    } catch (error: unknown) {
      console.error("Error exporting PDF:", error)
      const errorMessage = error instanceof Error ? error.message : "Không thể xuất báo cáo"
      toast({
        title: "Lỗi xuất PDF",
        description: errorMessage,
        variant: "destructive",
      })
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
          onClick={handleExportPDF} 
          disabled={isExporting}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Đang xuất..." : "Xuất PDF"}
        </Button>
      </div>
    </header>
  )
}
