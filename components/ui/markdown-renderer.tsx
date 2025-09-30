"use client"

import type React from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const formatContent = (text: string) => {
    // Split content into lines for processing
    const lines = text.split("\n")
    const elements: React.ReactNode[] = []
    let currentIndex = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Handle headers
      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={currentIndex++} className="text-lg font-semibold mt-4 mb-2 text-gray-800">
            {line.replace("### ", "")}
          </h3>,
        )
        continue
      }

      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={currentIndex++} className="text-xl font-bold mt-6 mb-3 text-gray-900 flex items-center gap-2">
            {formatInlineText(line.replace("## ", ""))}
          </h2>,
        )
        continue
      }

      // Handle tables (for schedule)
      if (line.includes("|") && line.includes("---")) {
        const tableLines = []
        let j = i

        // Collect all table lines
        while (j < lines.length && lines[j].includes("|")) {
          if (!lines[j].includes("---")) {
            tableLines.push(lines[j])
          }
          j++
        }

        if (tableLines.length > 1) {
          const headers = tableLines[0]
            .split("|")
            .map((h) => h.trim())
            .filter((h) => h)
          const rows = tableLines.slice(1).map((row) =>
            row
              .split("|")
              .map((cell) => cell.trim())
              .filter((cell) => cell),
          )

          elements.push(
            <div key={currentIndex++} className="my-4 overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg shadow-sm border border-gray-200">
                <thead>
                  <tr className="bg-blue-50">
                    {headers.map((header, idx) => (
                      <th key={idx} className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                        {formatInlineText(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="border border-gray-200 px-4 py-3 text-gray-700">
                          {formatInlineText(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>,
          )
          i = j - 1 // Skip processed lines
          continue
        }
      }

      // Handle bullet points
      if (line.startsWith("- ") || line.startsWith("• ")) {
        const bulletContent = line.replace(/^[-•]\s*/, "")
        elements.push(
          <div key={currentIndex++} className="flex items-start gap-2 my-1">
            <span className="text-blue-500 mt-1">•</span>
            <span className="text-gray-700">{formatInlineText(bulletContent)}</span>
          </div>,
        )
        continue
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(line)) {
        const listContent = line.replace(/^\d+\.\s*/, "")
        elements.push(
          <div key={currentIndex++} className="flex items-start gap-2 my-1">
            <span className="text-blue-500 font-medium">{line.match(/^\d+/)?.[0]}.</span>
            <span className="text-gray-700">{formatInlineText(listContent)}</span>
          </div>,
        )
        continue
      }

      // Handle checkmarks
      if (line.includes("✅") || line.includes("🔴") || line.includes("⚠️")) {
        elements.push(
          <div key={currentIndex++} className="flex items-start gap-2 my-1 p-2 bg-gray-50 rounded">
            <span className="text-gray-700">{formatInlineText(line)}</span>
          </div>,
        )
        continue
      }

      // Handle regular paragraphs
      if (line.trim()) {
        elements.push(
          <p key={currentIndex++} className="text-gray-700 leading-relaxed my-2">
            {formatInlineText(line)}
          </p>,
        )
      } else {
        // Empty line - add spacing
        elements.push(<div key={currentIndex++} className="h-2" />)
      }
    }

    return elements
  }

  const formatInlineText = (text: string) => {
    const parts = []
    let currentText = text
    let key = 0

    // Handle bold text **text**
    currentText = currentText.replace(/\*\*(.*?)\*\*/g, (match, content) => {
      const placeholder = `__BOLD_${key}__`
      parts.push({ type: "bold", content, key: key++ })
      return placeholder
    })

    // Handle italic text *text*
    currentText = currentText.replace(/\*(.*?)\*/g, (match, content) => {
      const placeholder = `__ITALIC_${key}__`
      parts.push({ type: "italic", content, key: key++ })
      return placeholder
    })

    // Split by placeholders and reconstruct
    const segments = currentText.split(/(__(?:BOLD|ITALIC)_\d+__)/)

    return segments.map((segment, index) => {
      const boldMatch = segment.match(/__BOLD_(\d+)__/)
      const italicMatch = segment.match(/__ITALIC_(\d+)__/)

      if (boldMatch) {
        const part = parts.find((p) => p.key === Number.parseInt(boldMatch[1]))
        return (
          <strong key={index} className="font-semibold text-gray-900">
            {part?.content}
          </strong>
        )
      }

      if (italicMatch) {
        const part = parts.find((p) => p.key === Number.parseInt(italicMatch[1]))
        return (
          <em key={index} className="italic text-gray-800">
            {part?.content}
          </em>
        )
      }

      return segment
    })
  }

  return <div className={`prose prose-sm max-w-none ${className}`}>{formatContent(content)}</div>
}
