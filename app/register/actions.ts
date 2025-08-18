'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  
  // Валидация данных
  if (!email || !name || !password || !confirmPassword) {
    return { error: 'Все поля обязательны для заполнения' }
  }
  
  if (password !== confirmPassword) {
    return { error: 'Пароли не совпадают' }
  }
  
  if (password.length < 8) {
    return { error: 'Пароль должен содержать минимум 8 символов' }
  }
  
  if (!/\d/.test(password)) {
    return { error: 'Пароль должен содержать хотя бы одну цифру' }
  }
  
  try {
    // Регистрируем пользователя
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    })
    
    if (error) {
      console.error('Registration error:', error)
      
      // Проверяем, если регистрация отключена в Supabase
      if (error.message.includes('Signups not allowed for otp')) {
        return { error: 'Регистрация временно закрыта. Обратитесь к администратору.' }
      }
      
      return { error: error.message }
    }
    
    // Успешная регистрация - перенаправляем на страницу входа с сообщением
    redirect('/login?message=registered')
  } catch (error: unknown) {
    console.error('Unexpected registration error:', error)
    return { error: 'Произошла непредвиденная ошибка при регистрации' }
  }
}