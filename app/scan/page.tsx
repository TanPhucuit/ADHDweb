import { QRScanner } from "@/components/pairing/qr-scanner"

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <QRScanner />
      </div>
    </div>
  )
}
