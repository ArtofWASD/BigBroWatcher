import LoginForm from '@/components/auth/LoginForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // Проверяем, авторизован ли пользователь
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // Если пользователь уже авторизован, перенаправляем на главную
  if (session) {
    redirect('/')
  }

  const searchParams = await props.searchParams
  const message = searchParams.message as string | undefined

  return (
    <div>
      {message === 'registered' && (
        <div className="rounded-md bg-green-50 p-4 mb-4 max-w-md mx-auto mt-4">
          <div className="text-sm text-green-700">
            Регистрация прошла успешно! Теперь вы можете войти в систему.
          </div>
        </div>
      )}
      <LoginForm />
    </div>
  )
}