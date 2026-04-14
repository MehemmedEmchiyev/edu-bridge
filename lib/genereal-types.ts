export interface Course {
  id: string
  name: string
  description: string
}

export interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  specialty: string
  courseId: string
  status: "active" | "inactive"
  avatarUrl: string
}

export interface ClassSchedule {
  days: string[]
  startTime: string
  endTime: string
}

export interface Class {
  id: string
  name: string
  teacherIds: string[]
  courseId: string
  schedule: ClassSchedule
  startDate: string
  endDate: string
  capacity: number
  enrolled: number
  status: "active" | "upcoming" | "completed"
}

export interface Student {
  id: string
  name: string
  email: string
  phone: string
  parentContact: string
  notes: string
  classIds: string[]
  courseIds: string[]
  createdAt: string
}

export interface Invoice {
  id: string
  studentId: string
  amount: number
  status: "paid" | "unpaid" | "overdue"
  dueDate: string
  createdAt: string
  description: string
}

export const initialCourses: Course[] = [
  { id: "c1", name: "Piano Mastery", description: "Comprehensive piano program for all levels" },
  { id: "c2", name: "Guitar Academy", description: "Acoustic and electric guitar training" },
]

export const initialTeachers: Teacher[] = [
  { id: "t1", name: "Sarah Mitchell", email: "sarah@pianomastery.com", phone: "+1 555-0101", specialty: "Classical Piano", courseId: "c1", status: "active", avatarUrl: "" },
  { id: "t2", name: "David Chen", email: "david@pianomastery.com", phone: "+1 555-0102", specialty: "Jazz Piano", courseId: "c1", status: "active", avatarUrl: "" },
  { id: "t3", name: "Elena Rodriguez", email: "elena@guitaracademy.com", phone: "+1 555-0103", specialty: "Acoustic Guitar", courseId: "c2", status: "active", avatarUrl: "" },
  { id: "t4", name: "Marcus Johnson", email: "marcus@guitaracademy.com", phone: "+1 555-0104", specialty: "Electric Guitar", courseId: "c2", status: "active", avatarUrl: "" },
  { id: "t5", name: "Yuki Tanaka", email: "yuki@pianomastery.com", phone: "+1 555-0105", specialty: "Music Theory", courseId: "c1", status: "inactive", avatarUrl: "" },
  { id: "t6", name: "James O'Brien", email: "james@guitaracademy.com", phone: "+1 555-0106", specialty: "Fingerstyle Guitar", courseId: "c2", status: "active", avatarUrl: "" },
]

export const initialClasses: Class[] = [
  { id: "cl1", name: "Beginner Piano A", teacherIds: ["t1"], courseId: "c1", schedule: { days: ["Mon", "Wed"], startTime: "09:00", endTime: "10:30" }, startDate: "2026-01-15", endDate: "2026-06-15", capacity: 12, enrolled: 10, status: "active" },
  { id: "cl2", name: "Intermediate Piano B", teacherIds: ["t1", "t2"], courseId: "c1", schedule: { days: ["Tue", "Thu"], startTime: "11:00", endTime: "12:30" }, startDate: "2026-01-15", endDate: "2026-06-15", capacity: 10, enrolled: 8, status: "active" },
  { id: "cl3", name: "Jazz Improvisation", teacherIds: ["t2"], courseId: "c1", schedule: { days: ["Wed", "Fri"], startTime: "14:00", endTime: "15:30" }, startDate: "2026-01-15", endDate: "2026-06-15", capacity: 8, enrolled: 6, status: "active" },
  { id: "cl4", name: "Advanced Piano Recital", teacherIds: ["t1", "t2"], courseId: "c1", schedule: { days: ["Sat"], startTime: "10:00", endTime: "12:00" }, startDate: "2026-03-01", endDate: "2026-07-01", capacity: 6, enrolled: 0, status: "upcoming" },
  { id: "cl5", name: "Acoustic Guitar Basics", teacherIds: ["t3"], courseId: "c2", schedule: { days: ["Mon", "Wed"], startTime: "10:00", endTime: "11:30" }, startDate: "2026-01-15", endDate: "2026-06-15", capacity: 15, enrolled: 13, status: "active" },
  { id: "cl6", name: "Electric Guitar Workshop", teacherIds: ["t4", "t3"], courseId: "c2", schedule: { days: ["Tue", "Thu"], startTime: "16:00", endTime: "17:30" }, startDate: "2026-01-15", endDate: "2026-06-15", capacity: 10, enrolled: 9, status: "active" },
  { id: "cl7", name: "Fingerstyle Techniques", teacherIds: ["t6"], courseId: "c2", schedule: { days: ["Fri"], startTime: "13:00", endTime: "14:30" }, startDate: "2026-01-15", endDate: "2026-06-15", capacity: 8, enrolled: 5, status: "active" },
  { id: "cl8", name: "Music Theory for Guitar", teacherIds: ["t3", "t6"], courseId: "c2", schedule: { days: ["Sat"], startTime: "09:00", endTime: "10:30" }, startDate: "2026-02-01", endDate: "2026-05-01", capacity: 20, enrolled: 20, status: "active" },
]

const studentNames = [
  "Alice Walker", "Ben Thompson", "Clara Diaz", "Daniel Kim", "Emily Foster",
  "Frank Martinez", "Grace Liu", "Henry Wilson", "Isabella Rossi", "Jack Murphy",
  "Katherine Brown", "Liam O'Connor", "Mia Patel", "Nathan Scott", "Olivia Nguyen",
  "Patrick Evans", "Quinn Adams", "Rachel Turner", "Samuel Lee", "Tara Hernandez",
]

export const initialStudents: Student[] = studentNames.map((name, i) => {
  const id = `s${i + 1}`
  const classAssignments = i < 10
    ? [initialClasses[i % 4].id]
    : [initialClasses[(i + 4) % 8].id]
  const courseAssignments = classAssignments.map(
    (cid) => initialClasses.find((cl) => cl.id === cid)!.courseId
  )
  return {
    id,
    name,
    email: `${name.split(" ")[0].toLowerCase()}@email.com`,
    phone: `+1 555-${String(1000 + i).slice(1)}`,
    parentContact: i < 15 ? `Parent of ${name.split(" ")[0]}: +1 555-${String(2000 + i).slice(1)}` : "",
    notes: i % 5 === 0 ? "Needs extra practice time" : "",
    classIds: classAssignments,
    courseIds: [...new Set(courseAssignments)],
    createdAt: `2025-${String(1 + (i % 12)).padStart(2, "0")}-${String(10 + (i % 15)).padStart(2, "0")}`,
  }
})

const invoiceStatuses: Invoice["status"][] = ["paid", "unpaid", "overdue", "paid", "paid", "unpaid", "overdue", "paid", "unpaid", "paid"]

export const initialInvoices: Invoice[] = initialStudents.flatMap((student, si) => {
  return Array.from({ length: 3 }, (_, ii) => {
    const statusIndex = (si * 3 + ii) % invoiceStatuses.length
    const month = ii + 1
    return {
      id: `inv-${student.id}-${ii + 1}`,
      studentId: student.id,
      amount: 150 + (si % 3) * 25,
      status: invoiceStatuses[statusIndex],
      dueDate: `2026-${String(month).padStart(2, "0")}-15`,
      createdAt: `2026-${String(month).padStart(2, "0")}-01`,
      description: `Tuition - ${new Date(2026, month - 1).toLocaleString("en", { month: "long" })} 2026`,
    }
  })
})
