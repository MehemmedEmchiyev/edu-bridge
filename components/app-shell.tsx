"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Bell,
  BookOpen,
  CircleFadingArrowUpIcon,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Receipt,
  Search,
  Sun,
  Tags,
  UserCheck,
  Users,
  X
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const navItems = [
  { id: "dashboard", label: "Statistika", icon: LayoutDashboard },
  { id: "specializations", label: "İxtisaslar", icon: Tags },
  { id: "teachers", label: "Müəllimlər", icon: UserCheck },
  { id: "classes", label: "Siniflər", icon: BookOpen },
  { id: "students", label: "Tələbələr", icon: Users },
  { id: "billing", label: "Faktura", icon: Receipt },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [dark, setDark] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [collapse, setCollapse] = useState<boolean>(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])
  const currentScreen = pathname?.split("/").filter(Boolean).pop() || "dashboard"
  const [course, setCourse] = useState<{
    course?: { courseName?: string }
    email?: string
  } | null>(null)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user")
      setCourse(raw ? JSON.parse(raw) : null)
    } catch {
      setCourse(null)
    }
  }, [])
  const closeAside = () => {
    setCollapse(!collapse)
  }
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          `fixed inset-y-0 left-0 z-50 duration-300 flex ${collapse ? "w-22" : "w-64"} flex-col border-r border-sidebar-border bg-sidebar shadow-2xl transition-all md:relative md:translate-x-0`,
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="rounded-full  items-center justify-center bg-white border hidden md:flex right-[-20px]  w-max absolute">
            <Button onClick={closeAside} variant="outline" size="icon">
              <CircleFadingArrowUpIcon className={`duration-300 ${collapse ? "rotate-90" : "rotate-270"} `} />
            </Button>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className={`text-lg font-bold ${collapse ? "opacity-0 w-0" : "opacity-100 w-auto"} overflow-hidden transition-all duration-300 tracking-tight text-sidebar-foreground`}>{course?.course?.courseName}</span>

          <button
            className="ml-auto md:hidden text-sidebar-foreground"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-2">
          <ul className="flex flex-col gap-1.5">
            {navItems.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <Link
                  href={`/${id}`}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    `flex ${collapse ? "w-max" : "w-full gap-3"} items-center  rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200`,
                    currentScreen === id
                      ? "bg-gradient-to-r from-sidebar-primary/15 to-sidebar-primary/5 text-sidebar-primary border border-sidebar-primary/20 shadow-sm"
                      : "text-sidebar-foreground/65 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span className={`${collapse ? "opacity-0 w-0" : "opacity-100 w-auto"} overflow-hidden transition-all duration-300`}>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card/50 backdrop-blur-sm px-6 shadow-sm">
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:bg-accent/50 rounded-lg transition-colors"
              onClick={() => setDark(!dark)}
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-accent/50 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"><GraduationCap className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{course?.course?.courseName}</p>
                  <p className="text-xs text-muted-foreground">{course?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  localStorage.clear()
                  router.push("/login")
                }} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıxış edin
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
