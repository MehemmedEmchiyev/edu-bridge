"use client"

import { LoginScreen } from "@/components/login-screen"
import { Toaster } from "@/components/ui/sonner"
import { AppProvider } from "@/lib/app-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <AppProvider>
      <LoginScreen />
      <Toaster position="bottom-right" />
    </AppProvider>
  )
}
