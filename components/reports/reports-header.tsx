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

      console.log('📸 Preparing PDF export...')
      
      // Clone main content  
      const clonedMain = mainElement.cloneNode(true) as HTMLElement
      document.body.appendChild(clonedMain)
      clonedMain.style.position = 'absolute'
      clonedMain.style.left = '-9999px'
      clonedMain.style.top = '0'
      
      // Replace all charts with text summaries
      const chartContainers = clonedMain.querySelectorAll('[class*="recharts"], canvas, svg')
      console.log('🔍 Replacing', chartContainers.length, 'charts with text')
      
      chartContainers.forEach(chart => {
        const card = chart.closest('.bg-white')
        if (card) {
          const title = card.querySelector('h3, h2')?.textContent || 'Biểu đồ'
          const textDiv = document.createElement('div')
          textDiv.style.cssText = 'padding: 24px; border: 2px dashed #d1d5db; border-radius: 8px; background: #f9fafb; margin: 12px 0;'
          textDiv.innerHTML = `
            <p style="font-weight: 600; font-size: 18px; margin-bottom: 8px; color: #111827;">${title}</p>
            <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">📊 Dữ liệu biểu đồ được hiển thị trên giao diện web</p>
            <p style="font-size: 13px; color: #9ca3af; margin-top: 8px;">Vui lòng truy cập hệ thống để xem chi tiết</p>
          `
          chart.parentElement?.replaceChild(textDiv, chart)
        }
      })
      
      // CRITICAL: Remove ALL stylesheets and classes to avoid lab() colors
      const allElements = clonedMain.querySelectorAll('*')
      allElements.forEach(el => {
        // Remove all classes (which might reference lab() colors in CSS)
        el.removeAttribute('class')
        // Keep only inline styles with safe colors
        const style = el.getAttribute('style')
        if (style) {
          // Remove any style with lab/lch/oklab
          if (style.includes('lab(') || style.includes('lch(') || style.includes('oklab(')) {
            el.removeAttribute('style')
          }
        }
      })
      
      // Remove all style tags
      clonedMain.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => el.remove())
      
      console.log('✅ Cleaned DOM for PDF export')
      
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
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Lỗi xuất PDF",
        description: "Không thể xuất báo cáo. Vui lòng thử lại.",
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
