import type React from "react"
import type { Metadata } from "next"
import { Calistoga } from "next/font/google"
import { Suspense } from "react"
import { AuthProvider } from "@/lib/auth"
import "./globals.css"

const helveticaWorld = {
  variable: "--font-helvetica",
  fallback: ["Helvetica", "Arial", "sans-serif"],
}

const calistoga = Calistoga({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-calistoga",
})

export const metadata: Metadata = {
  title: "ADHD Smart Assistant",
  description: "Web dashboard for parents to monitor their children's focus and wellbeing",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${calistoga.variable} font-sans antialiased`}
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        <AuthProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AuthProvider>
      </body>
    </html>
  )
}
