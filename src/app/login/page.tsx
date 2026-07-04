'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email first'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">ChurchOS</h1>
        <p className="text-gray-400 text-sm mb-6">
          {mode === 'login' ? 'Sign in to your admin dashboard' : 'Reset your password'}
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {resetSent ? (
          <div className="text-center py-4">
            <p className="text-green-600 text-sm font-medium mb-2">Reset link sent</p>
            <p className="text-gray-400 text-xs mb-4">Check your email for a password reset link</p>
            <button onClick={() => { setMode('login'); setResetSent(false) }}
              className="text-blue-600 text-sm hover:underline">
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email</label>
                <input type="email" placeholder="pastor@church.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500" />
              </div>

              {mode === 'login' && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600">
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {mode === 'login' && (
              <button onClick={() => { setMode('forgot'); setError('') }}
                className="text-xs text-blue-600 hover:underline mt-2 block">
                Forgot password?
              </button>
            )}

            <button
              onClick={mode === 'login' ? handleLogin : handleForgotPassword}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 mt-4">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Send Reset Link'}
            </button>

            {mode === 'forgot' && (
              <button onClick={() => { setMode('login'); setError('') }}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3">
                Back to sign in
              </button>
            )}

            <div className="border-t border-gray-100 mt-6 pt-4 text-center">
              <p className="text-xs text-gray-400">
                No account?{' '}
                <a href="/register" className="text-blue-600 hover:underline font-medium">
                  Register your church
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}