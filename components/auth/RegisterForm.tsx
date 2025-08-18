'use client'

import { useForm } from 'react-hook-form'
import { register } from '@/app/register/actions'
import { useRouter } from 'next/navigation'

type RegisterFormInputs = {
  email: string
  name: string
  password: string
  confirmPassword: string
}

export default function RegisterForm() {
  const router = useRouter()
  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<RegisterFormInputs>()

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      // Очищаем предыдущие ошибки
      clearErrors()
      
      // Создаем FormData для серверного action
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('name', data.name)
      formData.append('password', data.password)
      formData.append('confirmPassword', data.confirmPassword)
      
      const result = await register(formData)
      
      if (result?.error) {
        setError('root', {
          message: `Ошибка регистрации: ${result.error}`,
        })
        return
      }
    } catch (error: unknown) {
      console.error('Unexpected error:', error)
      setError('root', {
        message: 'Произошла непредвиденная ошибка при попытке регистрации',
      })
    }
  }

  const password = watch('password', '')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Регистрация
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...registerField('email', {
                  required: 'Email обязателен',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Неверный формат email',
                  },
                })}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="name" className="sr-only">
                Имя
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...registerField('name', {
                  required: 'Имя обязательно',
                  minLength: {
                    value: 2,
                    message: 'Имя должно содержать минимум 2 символа',
                  },
                })}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Имя"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...registerField('password', {
                  required: 'Пароль обязателен',
                  minLength: {
                    value: 8,
                    message: 'Пароль должен содержать минимум 8 символов',
                  },
                  validate: {
                    hasNumber: (value) => 
                      (/\d/.test(value)) || 'Пароль должен содержать хотя бы одну цифру',
                  },
                })}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Подтверждение пароля
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...registerField('confirmPassword', {
                  required: 'Подтверждение пароля обязательно',
                  validate: {
                    matchesPassword: (value) => 
                      value === password || 'Пароли не совпадают',
                  },
                })}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Подтверждение пароля"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {errors.root && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {errors.root.message}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </div>
        </form>
        
        <div className="text-sm text-center mt-4">
          <a
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Уже есть аккаунт? Войти
          </a>
        </div>
      </div>
    </div>
  )
}