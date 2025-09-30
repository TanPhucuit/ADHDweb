"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, HelpCircle, BookOpen, Target } from "lucide-react"

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void
}

export function ExamplePrompts({ onSelectPrompt }: ExamplePromptsProps) {
  const prompts = [
    {
      icon: Clock,
      title: "Tạo thời gian biểu",
      prompt: "Tạo thời gian biểu học buổi tối cho bé",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: HelpCircle,
      title: "Tìm hiểu ADHD",
      prompt: "ADHD là gì và có những triệu chứng nào?",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Target,
      title: "Cải thiện tập trung",
      prompt: "Làm thế nào để giúp con tập trung tốt hơn khi học?",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: BookOpen,
      title: "Phương pháp học",
      prompt: "Phương pháp học tập nào phù hợp với trẻ ADHD?",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ]

  return (
    <Card className="bg-muted/30 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading">Câu hỏi gợi ý</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {prompts.map((prompt, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => onSelectPrompt(prompt.prompt)}
              className="h-auto p-3 justify-start text-left hover:bg-background/80"
            >
              <div className="flex items-start gap-3 w-full">
                <div className={`w-8 h-8 rounded-lg ${prompt.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <prompt.icon className={`w-4 h-4 ${prompt.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm mb-1">{prompt.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{prompt.prompt}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
