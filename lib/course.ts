/** Course id from admin login payload (localStorage user). */
export function getCourseIdFromStorage(): number | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("user")
    if (!raw) return null
    const u = JSON.parse(raw) as { course?: { courseId?: string | number } }
    const id = u?.course?.courseId
    if (id === undefined || id === null) return null
    const n = typeof id === "string" ? parseInt(id, 10) : Number(id)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}
