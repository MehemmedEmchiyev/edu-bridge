"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import service from "@/lib/api"
import { zodResolver } from '@hookform/resolvers/zod'
import { BarChart3, BookOpen, GraduationCap, LoaderCircle, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
export function LoginScreen() {
  const router = useRouter()
  const loginSchema = z.object({
    email: z.string().email("Email yanlışdır"),
    password: z.string().min(3, "Ən az 3 xarakter olmalıdır").max(15, "Ən çox 15 xarakter olmalıdır")
  })
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const res = await service.login({ email: values.email, password: values.password })
      localStorage.setItem("token", res.data.access_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push("/dashboard")
    } catch (error) {
      toast.error("İstifadəçi adı və ya şifrə yanlışdır !")
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background">

      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50 p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">EduBridge</h1>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-balance">
            Kurslarınızı asanlıqla idarə edin
          </h2>
          <p className="text-lg text-white/80 max-w-md mb-12">
            Kurs idarəçiliyini, müəllim koordinasiyasını və tələbə qəbulunu sadələşdirmək üçün hazırlanmış güclü bir admin paneli.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm flex-shrink-0 mt-1">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Kursları İdarə Edin</h3>
                <p className="text-white/70 text-sm">Cədvəllər və tutum izləmə ilə birdən çox kurs yaradın və təşkil edin</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm flex-shrink-0 mt-1">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Müəllim və Tələbə Mərkəzi</h3>
                <p className="text-white/70 text-sm">Müəllimləri dərslərə təyin edin və tələbə qeydiyyatlarını problemsiz idarə edin</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm flex-shrink-0 mt-1">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Faktura və Analitika</h3>
                <p className="text-white/70 text-sm">Fakturaları, ödənişləri və hərtərəfli kurs məlumatlarını izləyin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-4 shadow-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">EduBridge</h1>
            <p className="mt-2 text-sm text-muted-foreground">Kurslarınızı, müəllimlərinizi və tələbələrinizi idarə edin</p>
          </div>

          <Card className="rounded-3xl shadow-2xl border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6 pt-8 px-8">
              <CardTitle className="text-2xl font-bold">Xoş gəlmisiniz</CardTitle>
              <CardDescription className="text-base mt-2">
                Admin panelinizə daxil olun
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="admin@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifrə</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="mt-3 h-11 w-full text-base font-semibold bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-xl transition-all rounded-xl"
                    disabled={loading}
                  // onClick={handleSubmit}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <LoaderCircle className="animate-spin" />
                        Daxil olunur...
                      </span>
                    ) : (
                      "Daxil ol"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
