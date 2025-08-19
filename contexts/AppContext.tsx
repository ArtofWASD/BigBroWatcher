'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { DateRange } from '@/lib/timeUtils'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AppContextType {
  highlightEnabled: boolean
  toggleHighlight: () => void
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  showAnalytics: boolean
  toggleAnalytics: () => void
  selectedDepartment: string | null
  setSelectedDepartment: (department: string | null) => void
  user: User | null
  setUser: (user: User | null) => void
  loading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [highlightEnabled, setHighlightEnabled] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [showAnalytics, setShowAnalytics] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const toggleHighlight = () => setHighlightEnabled(!highlightEnabled)
  const toggleAnalytics = () => setShowAnalytics(!showAnalytics)
  
  // Загружаем информацию о пользователе при инициализации
  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
    
    // Подписываемся на изменения состояния аутентификации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null
      setUser(newUser)
      
      // Обрабатываем события аутентификации
      if (event === 'SIGNED_OUT') {
        // Пользователь вышел из аккаунта
        setUser(null)
        if (window.location.pathname !== '/login') {
          router.push('/login')
        }
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <AppContext.Provider
      value={{
        highlightEnabled,
        toggleHighlight,
        dateRange,
        setDateRange,
        showAnalytics,
        toggleAnalytics,
        selectedDepartment,
        setSelectedDepartment,
        user,
        setUser,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}