"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface GoBackButtonProps {
  className?: string
  variant?: "default" | "ghost" | "outline"
}

function getBackRoute(pathname: string): string {
  if (/^\/parent\/.+/.test(pathname)) return "/parent"
  if (/^\/child\/.+/.test(pathname)) return "/child"
  return "/"
}

export function GoBackButton({ className, variant = "ghost" }: GoBackButtonProps) {
  const pathname = usePathname()
  const backRoute = getBackRoute(pathname)

  return (
    <Link href={backRoute}>
      <Button variant={variant} size="sm" className={`flex items-center gap-2 ${className ?? ""}`}>
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Button>
    </Link>
  )
}
