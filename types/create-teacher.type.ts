export interface CreateTeacher {
    fullName: string,
    phone: string,
    email: string,
    password: string,
    specialty: string,
    photoUrl: string,
    status: string
}

/** GET /admin/teachers sətri */
export type TeacherListItem = {
    id: number
    fullName: string
    email: string
    phone?: string | null
    specialty?: string | null
    photoUrl?: string | null
    status?: string
}

/** PATCH /admin/teachers/:id — bütün sahələr opsionaldır */
export type UpdateTeacherPayload = {
    fullName?: string
    phone?: string
    email?: string
    password?: string
    specialty?: string
    photoUrl?: string
    status?: "ACTIVE" | "INACTIVE"
}