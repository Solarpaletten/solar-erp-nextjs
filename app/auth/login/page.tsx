'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface LoginResponse {
  success: boolean;
  user?: {
    id: number;
    email: string;
    username: string;
  };
  token?: string;
  error?: string;
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('solar@solar.com')
  const [password, setPassword] = useState('pass123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔑 Attempting login with real API:', email)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json() as LoginResponse
        console.log('🔑 Login response:', data)

        if (!data.user) {
          throw new Error('Не удалось получить данные пользователя')
        }

        // Перенаправляем на Dashboard
        router.push('/account/companies')
      } else {
        const errorData = await response.json() as LoginResponse
        throw new Error(errorData.error || 'Login failed')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка входа в систему'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = () => {
    setEmail('solar@solar.com')
    setPassword('pass123')
    // Небольшая задержка для UI
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const form = window.document.querySelector('form') as HTMLFormElement | null
        if (form) {
          form.requestSubmit()
        }
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Navigation */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">SOLAR ERP</div>
        <div className="flex space-x-4">
          <a href="#" className="text-gray-600 hover:text-blue-600">Product</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">Integrations</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">Training</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">Prices</a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">☀️</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Вход в систему</h1>
              <p className="text-gray-600">Real API Connection</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                <strong>Ошибка:</strong> {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* Quick Login Button */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-4">Быстрый вход с тестовыми данными:</p>
              <button
                onClick={quickLogin}
                disabled={loading}
                className="w-full bg-green-100 hover:bg-green-200 text-green-800 py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                🚀 Быстрый логин (solar@solar.com)
              </button>
            </div>

            {/* Test Credentials Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">🔧 Тестовые данные (Real API):</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• Email: <strong>solar@solar.com</strong></p>
                <p>• Password: <strong>pass123</strong></p>
                <p>• Backend: <strong>Next.js API Routes</strong></p>
                <p>• Database: <strong>PostgreSQL</strong></p>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Нет аккаунта?{' '}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white p-4 text-center text-sm text-gray-500">
        <p>&copy; 2025 Solar ERP. Two-Level Multi-Tenant Architecture.</p>
      </div>
    </div>
  )
}