import { LoaderCircle } from "lucide-react"

const loading = () => {
  return (
    <div className="h-screen flex items-center justify-center"><LoaderCircle className="animate-spin" /></div>
  )
}

export default loading