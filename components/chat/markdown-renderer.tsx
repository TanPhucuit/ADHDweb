"use client"
import type React from "react"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple markdown parser for basic formatting and tables
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n")
    const elements: React.JSX.Element[] = []
    let currentIndex = 0

    while (currentIndex < lines.length) {
      const line = lines[currentIndex]

      // Headers
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={currentIndex} className="text-lg font-heading font-semibold mt-4 mb-2 text-primary">
            {line.replace("## ", "")}
          </h2>,
        )
        currentIndex++
        continue
      }

      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={currentIndex} className="text-base font-heading font-semibold mt-3 mb-2">
            {line.replace("### ", "")}
          </h3>,
        )
        currentIndex++
        continue
      }

      // Tables
      if (line.includes("|") && lines[currentIndex + 1]?.includes("|")) {
        const tableLines = []
        let tableIndex = currentIndex

        // Collect all table lines
        while (tableIndex < lines.length && lines[tableIndex].includes("|")) {
          tableLines.push(lines[tableIndex])
          tableIndex++
        }

        if (tableLines.length >= 2) {
          const headers = tableLines[0]
            .split("|")
            .map((h) => h.trim())
            .filter((h) => h)
          const rows = tableLines.slice(2).map((row) =>
            row
              .split("|")
              .map((cell) => cell.trim())
              .filter((cell) => cell),
          )

          elements.push(
            <div key={currentIndex} className="my-4 overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted/50">
                    {headers.map((header, i) => (
                      <th key={i} className="border border-border p-3 text-left font-medium text-sm">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      {row.map((cell, j) => (
                        <td key={j} className="border border-border p-3 text-sm">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>,
          )
          currentIndex = tableIndex
          continue
        }
      }

      // Bold text
      if (line.startsWith("**") && line.endsWith("**")) {
        elements.push(
          <p key={currentIndex} className="font-semibold mt-2 mb-1">
            {line.replace(/\*\*/g, "")}
          </p>,
        )
        currentIndex++
        continue
      }

      // Lists
      if (line.startsWith("- ")) {
        const listItems = []
        let listIndex = currentIndex

        while (listIndex < lines.length && lines[listIndex].startsWith("- ")) {
          listItems.push(lines[listIndex].replace("- ", ""))
          listIndex++
        }

        elements.push(
          <ul key={currentIndex} className="list-disc list-inside space-y-1 mt-2 mb-2 ml-4">
            {listItems.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {item}
              </li>
            ))}
          </ul>,
        )
        currentIndex = listIndex
        continue
      }

      // Regular paragraphs
      if (line.trim()) {
        // Handle inline bold
        const processInlineBold = (text: string) => {
          const parts = text.split(/(\*\*.*?\*\*)/g)
          return parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={i}>{part.replace(/\*\*/g, "")}</strong>
            }
            return part
          })
        }

        elements.push(
          <p key={currentIndex} className="text-sm leading-relaxed mt-1 mb-1">
            {processInlineBold(line)}
          </p>,
        )
      } else {
        // Empty line for spacing
        elements.push(<div key={currentIndex} className="h-2" />)
      }

      currentIndex++
    }

    return elements
  }

  return <div className="space-y-1">{parseMarkdown(content)}</div>
}
