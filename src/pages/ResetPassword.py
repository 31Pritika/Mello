import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../utils/api'

const s = {
  page: { minHeight: '100vh', background: '#0A0706', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Inter, sans-serif' },
  card: { width: '100%', maxWidth: '400px', background: '#15100E', border: '1px solid rgba(196,84,122,0.15)', borderRadius: '4px', padding: '3rem' },
  logo: { fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#EFECE6', marginBottom: '0.3rem' },
  sub: { fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '2.5rem' },
  heading: { fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 400, color: '#EFECE6', marginBottom: '0.4rem' },
  hint: { fontSize: '0.82rem', color: '#7D746D', marginBottom: '2rem' },
  label: { display: 'block', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '6px' },
  input: { width: '100%', padding: '12px 14px', background: '#1C1512', border: '1px solid rgba(196,84,122,0.15)', borderRadius: '2px', color: '#EFECE6', fontFamily: 'Inter', fontSize: '0.9rem', outline: 'none', marginBottom: '1rem' },
  btn: (active) => ({ width: '100%', padding: '13px', background: active ? '#C4547A' : 'rgba(196,84,122,0.1)', color: active ? '#0A0706' : '#7D746D', border: 'none', borderRadius: '2px', fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: active ? 'pointer' : 'not-allowed', transition: 'all 0.3s ease', marginBottom: '1.2rem' }),
  error: { fontSize: '0.82rem', color: '#C4547A', background: 'rgba(196,84,122,0.08)', border: '1px solid rgba(196,84,122,0.2)', borderRadius: '2px', padding: '10px 12px', marginBottom: '1rem' },
  success: { fontSize: '0.82rem', color: '#4A9E6A', background: 'rgba(74,158,106,0.08)', border: '1px solid rgba(74,158,106,0.2)', borderRadius: '2px', padding: '10px 12px', marginBottom: '1rem' }
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const token = searchParams.get('token')

  async function handleSubmit() {
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await resetPassword(token, password, confirm)
      setSuccess('Password reset successfully. Redirecting to login...')
      setTimeout(() => navigate('/auth'), 2000)
    } catch(e) {
      setError(e.message)
    }
    setLoading(false)
  }

  if (!token) return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>mello</div>
        <p style={{ color: '#C4547A', marginTop: '1rem' }}>Invalid reset link. Please request a new one.</p>
        <button onClick={() => navigate('/auth')} style={{ ...s.btn(true), marginTop: '1rem' }}>Back to Login</button>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>mello</div>
        <div style={s.sub}>Password Reset</div>
        <div style={s.heading}>Choose a new password</div>
        <div style={s.hint}>Must be at least 8 characters with one uppercase letter and one number.</div>
        <label style={s.label}>New Password</label>
        <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={s.input} />
        <label style={s.label}>Confirm Password</label>
        <input type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} style={s.input} />
        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}
        <button onClick={handleSubmit} disabled={loading || !password || !confirm} style={s.btn(!loading && password && confirm)}>
          {loading ? 'Resetting...' : 'Reset Password →'}
        </button>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Inter:wght@300;400;500&display=swap'); input { cursor: text !important; }`}</style>
    </div>
  )
}