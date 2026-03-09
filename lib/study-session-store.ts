// Shared study session state via localStorage
// Used to sync active subject across child pages (timer, music, AI chat)

export interface ActiveStudySession {
  activityId: string
  subject: string
  durationMinutes: number  // planned duration set by parent
  startTime: number        // Date.now() — re-adjusted on restore so (now - startTime) == real study time
  accumulatedSeconds?: number // actual seconds studied before last pause/hide (undefined = 0)
  notes?: string
}

const KEY = "adhd-active-session"

export function setActiveSession(session: ActiveStudySession): void {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(session))
  // Notify other components on the same page
  window.dispatchEvent(new CustomEvent("adhd-session-changed", { detail: session }))
}

export function getActiveSession(): ActiveStudySession | null {
  if (typeof localStorage === "undefined") return null
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearActiveSession(): void {
  if (typeof localStorage === "undefined") return
  localStorage.removeItem(KEY)
  window.dispatchEvent(new CustomEvent("adhd-session-changed", { detail: null }))
}

// Hook to listen for session changes within a page
export function onSessionChange(callback: (session: ActiveStudySession | null) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent).detail)
  window.addEventListener("adhd-session-changed", handler)
  return () => window.removeEventListener("adhd-session-changed", handler)
}

// Dispatch an action request (AI → tool widget)
export type ToolAction =
  | { type: "play_music"; track?: string; category?: string }
  | { type: "set_timer"; minutes: number }
  | { type: "stop_music" }
  | { type: "stop_timer" }

export function dispatchToolAction(action: ToolAction): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("adhd-tool-action", { detail: action }))
}

export function onToolAction(callback: (action: ToolAction) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent).detail)
  window.addEventListener("adhd-tool-action", handler)
  return () => window.removeEventListener("adhd-tool-action", handler)
}
