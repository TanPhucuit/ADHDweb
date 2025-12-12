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

      // Create canvas from HTML
      const canvas = await html2canvas(mainElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

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
      const fileName = `ADHD-Report-${child.name}-${new Date().toISOString().split("T")[0]}.pdf`
      pdf.save(fileName)

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
