import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { verifyToken } from '../utils/api'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    async function handle() {
      const token = searchParams.get('token')
      const type = searchParams.get('type')
      const userId = searchParams.get('user_id')
      const name = searchParams.get('name')
      const email = searchParams.get('email')
      const isNew = searchParams.get('new')

      // Google OAuth callback
      if (token && userId && name && email) {
        localStorage.setItem('mello_token', token)
        localStorage.setItem('mello_user', JSON.stringify({ id: userId, name, email }))
        navigate(isNew === 'true' ? '/onboarding' : '/dashboard')
        return
      }

      // Magic link callback
      if (token && type === 'magic_link') {
        try {
          await verifyToken(token, 'magic_link')
          navigate('/dashboard')
        } catch(e) {
          setError('This link is invalid or has expired. Please request a new one.')
        }
        return
      }

      navigate('/auth')
    }
    handle()
  }, [])

  if (error) return (
    <div style={{
      minHeight: '100vh', background: '#0A0706',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: '#15100E', border: '1px solid rgba(196,84,122,0.15)',
        borderRadius: '4px', padding: '2.5rem', maxWidth: '400px', textAlign: 'center'
      }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#EFECE6', marginBottom: '1rem' }}>mello</div>
        <p style={{ color: '#C4547A', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</p>
        <button onClick={() => navigate('/auth')} style={{
          padding: '10px 24px', background: '#C4547A', color: '#0A0706',
          border: 'none', borderRadius: '2px', cursor: 'pointer',
          fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase'
        }}>Back to Login</button>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Inter:wght@300;400;500&display=swap');`}</style>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0706',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Playfair Display, serif'
    }}>
      <div style={{ fontSize: '1.3rem', color: '#EFECE6', fontStyle: 'italic', animation: 'pulse 2s ease-in-out infinite' }}>
        Signing you in...
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
      `}</style>
    </div>
  )
}
