"use client"

import { AppShell } from "@/components/app-shell"
import { Toaster } from "@/components/ui/sonner"
import { AppProvider } from "@/lib/app-store"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router, pathname])

  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
      <Toaster position="bottom-right" />
    </AppProvider>
  )
}
