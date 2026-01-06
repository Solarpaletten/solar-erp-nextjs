'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface RegisterFormData {
  email: string
  phone: string
  name: string
  surname: string
  password: string
  username: string
}

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    phone: '',
    name: '',
    surname: '',
    password: '',
    username: '',
  })
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Автозаполнение формы в режиме разработки
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setFormData({
        email: 'test@example.com',
        phone: '+49123456789',
        name: 'Test',
        surname: 'User',
        password: 'test1234',
        username: 'testuser',
      })
      setAgree(true)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agree) {
      setError('Please agree to SOLAR ERP terms')
      return
    }
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username || formData.name,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Registration response:', data)

        setSuccessMessage(
          `Registration successful! Your login: ${formData.email}. You can now login.`
        )

        // Перенаправляем на логин с небольшой задержкой
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to register')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigation bar */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">SOLAR ERP</div>
        <div className="flex space-x-4">
          <a href="#" className="text-gray-600 hover:text-blue-600">
            Product
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600">
            Integrations
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600">
            Training
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600">
            Prices
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600">
            Accounting Companies
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <Link
              href="/login"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Registration form */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">📝</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Create Account
              </h1>
              <p className="text-gray-600">Join Solar ERP Today</p>
            </div>

            {/* Social Login */}
            <div className="flex justify-center space-x-2 mb-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Facebook
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                Google
              </button>
            </div>
            <p className="text-center text-gray-600 mb-4">
              Or fill out the registration form
            </p>

            {successMessage && (
              <div className="p-4 text-sm text-green-700 bg-green-100 border border-green-300 rounded-lg mb-4">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mr-2"
                />
                <label className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-blue-500 hover:underline">
                    terms and conditions
                  </a>
                </label>
              </div>

              {/* Development autofill button (hidden) */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  type="button"
                  hidden
                  onClick={() =>
                    setFormData({
                      email: 'test@example.com',
                      phone: '+49123456789',
                      name: 'Test',
                      surname: 'User',
                      password: 'test1234',
                      username: 'testuser',
                    })
                  }
                >
                  Autofill
                </button>
              )}

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Create Account
              </button>
            </form>

            {/* Development Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">🔧 Development Mode:</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• Form is auto-filled for testing</p>
                  <p>• Terms checkbox is pre-checked</p>
                  <p>• After registration, you'll be redirected to login</p>
                </div>
              </div>
            )}
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white p-4 text-center text-sm text-gray-500">
        <p>&copy; 2025 Solar ERP. Advanced Enterprise Resource Planning.</p>
      </div>
    </div>
  )
}