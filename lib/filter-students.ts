import type { StudentRow } from "@/components/students/StudentsTable"

export function filterAndSortStudents(
  students: StudentRow[],
  search: string,
  sortBy: "name" | "classes",
  classFilter: string = "all",
): StudentRow[] {
  let list = [...students]
  const q = search.trim().toLowerCase()
  if (q) {
    list = list.filter((s) => {
      const n = (s.fullName || s.name || "").toLowerCase()
      const em = (s.email ?? "").toLowerCase()
      const ph = (s.phone ?? "").toLowerCase().replace(/\s/g, "")
      const qq = q.replace(/\s/g, "")
      return n.includes(q) || em.includes(q) || ph.includes(qq)
    })
  }
  if (classFilter && classFilter !== "all") {
    const cid = parseInt(classFilter, 10)
    if (!Number.isNaN(cid)) {
      list = list.filter((s) => s.classes?.some((c) => c.classId === cid))
    }
  }
  if (sortBy === "name") {
    list.sort((a, b) => (a.fullName || a.name || "").localeCompare(b.fullName || b.name || ""))
  } else {
    list.sort((a, b) => (b.classes?.length ?? 0) - (a.classes?.length ?? 0))
  }
  return list
}
