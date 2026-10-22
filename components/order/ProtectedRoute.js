"use client"
import { useEffect, useState } from "react"
import { useLocalizedRouter } from "@/components/localizedRouter"
import useUserStore from "@/store/useAuthStore"

export default function ProtectedRoute({ children }) {
  const { localizedPush } = useLocalizedRouter()
  const { token } = useUserStore()
  const [isHydrated, setIsHydrated] = useState(false)


  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !token) {
      localizedPush("/")
    }
  }, [token, isHydrated, localizedPush])

  if (!isHydrated) {
    return <p className="text-center py-10">Loading...</p>
  }

  if (!token) {
    return <p className="text-center py-10">Redirecting ...</p>
  }

  return children
}
