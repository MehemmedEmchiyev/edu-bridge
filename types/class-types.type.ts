export interface ClassTeacherRow {
    id: number
    full_name: string
    phone?: string | null
    email?: string | null
    specialty?: string | null
}

export interface Class {
    id: number
    name: string
    number?: string | null
    specialization?: string | null
    courseId: number
    courseName?: string
    teacherUserId?: number[]
    teacher?: Teacher
    classTeachers: ClassTeacherRow[]
    schedules: Schedule[]
    studentCount: number
    createdAt: string
    students: { id: number; full_name: string; email?: string | null; phone?: string | null }[]
}

export interface Teacher {
    id: string
    name: string
    email: string
    phone: string
    specialty: string
    courseId: string
    status?: "active" | "inactive"
    avatarUrl?: string
}

export interface Schedule {
    id: number;
    class_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
}

export interface ClassDetailProps {
    detailClass: Class | null
    setDetailClass: (value: Class | null) => void
}
