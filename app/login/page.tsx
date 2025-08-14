import LoginForm from '@/components/auth/LoginForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  // Проверяем, авторизован ли пользователь
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // Если пользователь уже авторизован, перенаправляем на главную
  if (session) {
    redirect('/')
  }

  return <LoginForm />
}