"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "@/components/ui/icons"

interface GoBackButtonProps {
  className?: string
  variant?: "default" | "ghost" | "outline"
}

export function GoBackButton({ className, variant = "ghost" }: GoBackButtonProps) {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  return (
    <Button variant={variant} size="sm" onClick={handleGoBack} className={`flex items-center gap-2 ${className}`}>
      <ArrowLeft className="h-4 w-4" />
      Quay lại
    </Button>
  )
}
