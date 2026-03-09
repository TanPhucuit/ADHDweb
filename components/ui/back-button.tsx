"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BackButtonProps {
  fallbackRoute?: string
  className?: string
}

function getBackRoute(pathname: string, fallback?: string): string {
  if (fallback) return fallback
  if (/^\/parent\/.+/.test(pathname)) return "/parent"
  if (/^\/child\/.+/.test(pathname)) return "/child"
  return "/"
}

export function BackButton({ fallbackRoute, className }: BackButtonProps) {
  const pathname = usePathname()
  const backRoute = getBackRoute(pathname, fallbackRoute)

  return (
    <Link href={backRoute}>
      <Button variant="ghost" size="icon" className={`rounded-full ${className ?? ""}`}>
        <ArrowLeft className="w-5 h-5" />
      </Button>
    </Link>
  )
}
