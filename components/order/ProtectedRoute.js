"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useUserStore from "@/store/useAuthStore"

export default function ProtectedRoute({ children }) {
  const router = useRouter()
  const { token } = useUserStore()
  const [isHydrated, setIsHydrated] = useState(false)


  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !token) {
      router.push("/")
    }
  }, [token, isHydrated, router])

  if (!isHydrated) {
    return <p className="text-center py-10">Loading...</p>
  }

  if (!token) {
    return <p className="text-center py-10">Redirecting ...</p>
  }

  return children
}
