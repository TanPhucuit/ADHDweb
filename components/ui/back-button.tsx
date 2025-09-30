"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { getDashboardRoute } from "@/lib/navigation"
import Link from "next/link"

interface BackButtonProps {
  fallbackRoute?: string
  className?: string
}

export function BackButton({ fallbackRoute, className }: BackButtonProps) {
  const { user } = useAuth()

  const backRoute = fallbackRoute || getDashboardRoute(user)

  return (
    <Link href={backRoute}>
      <Button variant="ghost" size="icon" className={`rounded-full ${className}`}>
        <ArrowLeft className="w-5 h-5" />
      </Button>
    </Link>
  )
}
