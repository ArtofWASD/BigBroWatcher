import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = await createClient()
  
  // Проверяем сессию пользователя
  const { data: { session } } = await supabase.auth.getSession()
  
  // Разрешаем доступ к странице входа без аутентификации
  const isAuthPage = request.nextUrl.pathname === '/login'
  
  // Защищаем все маршруты, кроме страницы входа
  if (!session && !isAuthPage) {
    // Перенаправляем на страницу входа
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  
  // Если пользователь авторизован и пытается зайти на страницу входа, перенаправляем на главную
  if (session && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Сопоставляем все пути запросов, кроме тех, что начинаются с:
     * - api (пути API)
     * - _next/static (статические файлы)
     * - _next/image (файлы оптимизации изображений)
     * - favicon.ico (файл иконки)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}