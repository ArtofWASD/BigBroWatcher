import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET() {
  const supabase = await createClient()
  
  // Выходим из аккаунта
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Server logout error:', error)
    // Даже если произошла ошибка, перенаправляем на страницу входа
  }
  
  // Перенаправляем на страницу входа
  redirect('/login')
}