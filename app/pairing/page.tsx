import { PairingFlow } from "@/components/pairing/pairing-flow"

export default function PairingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <PairingFlow />
      </div>
    </div>
  )
}
