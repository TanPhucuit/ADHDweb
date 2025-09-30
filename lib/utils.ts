type ClassValue = string | number | boolean | undefined | null | ClassValue[]

function clsx(...inputs: ClassValue[]): string {
  const classes: string[] = []

  for (const input of inputs) {
    if (!input) continue

    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input))
    } else if (Array.isArray(input)) {
      const result = clsx(...input)
      if (result) classes.push(result)
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key)
      }
    }
  }

  return classes.join(" ")
}

function simpleTwMerge(classNames: string): string {
  // Split classes and remove duplicates, keeping the last occurrence
  const classes = classNames.split(" ").filter(Boolean)
  const classMap = new Map<string, string>()

  for (const cls of classes) {
    // Extract the base class name (before any modifiers like hover:, md:, etc.)
    const baseClass = cls.split(":").pop() || cls
    const prefix = cls.substring(0, cls.length - baseClass.length)

    // For conflicting classes, keep the last one
    classMap.set(prefix + baseClass.split("-")[0], cls)
  }

  return Array.from(classMap.values()).join(" ")
}

export function cn(...inputs: ClassValue[]) {
  return simpleTwMerge(clsx(...inputs))
}
