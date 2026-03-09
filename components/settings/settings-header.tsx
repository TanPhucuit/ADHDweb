"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"

function getHomeRoute(): string {
  if (typeof window === "undefined") return "/"
  try {
    const stored = localStorage.getItem("adhd-dashboard-user")
    if (stored) {
      const u = JSON.parse(stored)
      if (u.role === "parent") return "/parent"
      if (u.role === "child") return "/child"
    }
  } catch {}
  return "/"
}

export function SettingsHeader() {
  const [backRoute, setBackRoute] = useState("/")

  useEffect(() => {
    setBackRoute(getHomeRoute())
  }, [])

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={backRoute}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-lg">Cài đặt</h1>
              <p className="text-xs text-muted-foreground">Quản lý tài khoản và thiết bị</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
