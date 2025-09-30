import { AIChat } from "@/components/ai-chat"
import { GoBackButton } from "@/components/ui/go-back-button"

export default function ChildAIChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-1 sm:p-2">
      <div className="container mx-auto max-w-full">
        <div className="mb-2 sm:mb-3">
          <GoBackButton className="text-white hover:bg-white/20" />
        </div>

        <div className="mb-2 sm:mb-4 text-center px-1">
          <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">🤖 Trò chuyện với Dr. AI</h1>
          <p className="text-white/80 text-xs sm:text-base">Bạn nhỏ thông minh luôn sẵn sàng giúp đỡ!</p>
        </div>

        <div className="h-[calc(100vh-100px)] sm:h-[calc(100vh-160px)] bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-2xl shadow-xl flex flex-col overflow-hidden">
          <AIChat
            childId="child-1"
            context="Tôi đang trò chuyện với một em nhỏ ADHD. Hãy sử dụng ngôn ngữ thân thiện, dễ hiểu và khuyến khích."
          />
        </div>
      </div>
    </div>
  )
}
