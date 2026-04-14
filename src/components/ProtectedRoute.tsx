// Reusable auth guard component
import { useEffect, useState, ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ 
  children 
}: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const location = useLocation()

  useEffect(() => {
    let mounted = true

    // Initial check (App handle most of this now, but we double-check here)
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (mounted) {
        setSession(currentSession)
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FAFAF8] z-[5000]">
        <div className="w-10 h-10 border-3 border-[#EBF4EE] border-t-[#4A7C59] rounded-full animate-spin mb-4" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
