'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()

  const handleReset = async () => {
    setError('')
    if (!password || !confirm) { setError('Fill in both fields'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">New Password</h1>
        <p className="text-gray-400 text-sm mb-6">Choose a strong password for your account</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {done ? (
          <div className="text-center py-4">
            <p className="text-green-600 text-sm font-medium mb-1">Password updated</p>
            <p className="text-gray-400 text-xs">Redirecting to dashboard...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { label: 'New Password', value: password, onChange: setPassword },
              { label: 'Confirm Password', value: confirm, onChange: setConfirm },
            ].map(({ label, value, onChange }) => (
              <div key={label}>
                <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            ))}

            <button onClick={handleReset} disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 mt-2">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}