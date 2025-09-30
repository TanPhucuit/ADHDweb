import type { User } from "./types"

export function getHomeRoute(user: User | null): string {
  if (!user) return "/"

  // Strict role-based routing - no cross-access
  switch (user.role) {
    case "parent":
      return "/parent"
    case "child":
      return "/child"
    default:
      return "/"
  }
}

export function getDashboardRoute(user: User | null): string {
  return getHomeRoute(user)
}

export function getReportsRoute(user: User | null): string {
  if (!user) return "/"

  switch (user.role) {
    case "parent":
      return "/parent/reports"
    case "child":
      return "/child/reports"
    default:
      return "/"
  }
}

export function canAccessRoute(user: User | null, route: string): boolean {
  if (!user) return route === "/" || route === "/register"

  // Parent can ONLY access parent routes
  if (route.startsWith("/parent")) {
    return user.role === "parent"
  }

  // Child can ONLY access child routes
  if (route.startsWith("/child")) {
    return user.role === "child"
  }

  // Remove generic dashboard access - force role-specific routes
  if (route.startsWith("/dashboard")) {
    return false // Force users to use role-specific routes
  }

  // Shared routes (settings, chat, etc.)
  if (route.startsWith("/settings") || route.startsWith("/chat")) {
    return true
  }

  // Public routes
  return route === "/" || route === "/register"
}

export function isValidRouteForUser(user: User | null, currentRoute: string): boolean {
  return canAccessRoute(user, currentRoute)
}

export function getRedirectRoute(user: User | null, attemptedRoute: string): string {
  if (!user) return "/"

  // If trying to access wrong role route, redirect to correct dashboard
  if (attemptedRoute.startsWith("/parent") && user.role !== "parent") {
    return "/child"
  }

  if (attemptedRoute.startsWith("/child") && user.role !== "child") {
    return "/parent"
  }

  // Default to role-appropriate dashboard
  return getDashboardRoute(user)
}
