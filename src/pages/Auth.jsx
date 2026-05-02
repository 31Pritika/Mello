import { useState } from 'react'
import { supabase } from '../SupabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit() {
    setError('')
    setLoading(true)
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else navigate('/dashboard')
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      await supabase.from('profiles').insert({ id: data.user.id, name, city: '' })
      navigate('/onboarding')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Ambient glow blobs */}
      <div style={{
        position: 'absolute', top: '-120px', right: '-120px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(138,123,174,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-80px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(224,164,88,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Left panel — brand */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '4rem',
        display: window.innerWidth < 768 ? 'none' : 'flex'
      }}>
        <div style={{ maxWidth: '380px' }}>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '3.5rem', fontWeight: '600',
            color: 'var(--parchment)', letterSpacing: '-1px',
            marginBottom: '1rem', lineHeight: 1.1
          }}>mello</h1>
          <p style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.1rem', fontWeight: '300',
            color: 'var(--lavender)', lineHeight: 1.7,
            marginBottom: '3rem'
          }}>
            A quiet corner of the internet for people with taste.
            Find your people. Geek out together.
          </p>

          {/* Decorative tags */}
          {['niche cinema', 'deep cuts', 'slow reads', 'late night albums'].map((tag, i) => (
            <span key={tag} style={{
              display: 'inline-block',
              padding: '5px 14px',
              borderRadius: '100px',
              border: '1px solid rgba(154,140,152,0.25)',
              fontFamily: 'Outfit', fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginRight: '8px', marginBottom: '8px',
              opacity: 0.6 + i * 0.1
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: '100%', maxWidth: '460px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '2rem',
        borderLeft: '1px solid rgba(154,140,152,0.1)'
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Mobile logo */}
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '2rem', color: 'var(--parchment)',
            marginBottom: '2.5rem', display: 'block'
          }}>mello</h1>

          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.5rem', fontWeight: '500',
            color: 'var(--parchment)', marginBottom: '0.5rem'
          }}>
            {isLogin ? 'Welcome back' : 'Join the library'}
          </h2>
          <p style={{
            fontFamily: 'Outfit', fontSize: '0.88rem',
            color: 'var(--text-secondary)', marginBottom: '2rem'
          }}>
            {isLogin
              ? 'Your circle is waiting for you'
              : 'Find people who just get it'}
          </p>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
            {!isLogin && (
              <div>
                <label style={labelStyle}>Your name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="How should we call you?" style={inputStyle} />
              </div>
            )}
            <div>
              <label style={labelStyle}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" type="password" style={inputStyle} />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(196,147,122,0.1)',
              border: '1px solid rgba(196,147,122,0.25)',
              marginBottom: '1rem'
            }}>
              <p style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: 'var(--accent-books)' }}>
                {error}
              </p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
            color: 'var(--navy)', border: 'none', borderRadius: '12px',
            fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s ease',
            marginBottom: '1.2rem',
            letterSpacing: '0.02em'
          }}>
            {loading ? 'One moment...' : isLogin ? 'Enter →' : 'Join Mello →'}
          </button>

          <p style={{
            textAlign: 'center', fontFamily: 'Outfit',
            fontSize: '0.85rem', color: 'var(--text-muted)'
          }}>
            {isLogin ? "New here? " : "Already a member? "}
            <span onClick={() => { setIsLogin(!isLogin); setError('') }} style={{
              color: 'var(--gold)', cursor: 'pointer',
              textDecoration: 'underline', textUnderlineOffset: '3px'
            }}>
              {isLogin ? 'Create an account' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontFamily: 'Outfit', fontSize: '0.78rem',
  color: 'var(--text-secondary)',
  marginBottom: '6px', letterSpacing: '0.05em',
  textTransform: 'uppercase'
}

const inputStyle = {
  width: '100%', padding: '13px 16px',
  background: 'var(--navy-light)',
  border: '1px solid rgba(154,140,152,0.2)',
  borderRadius: '10px',
  fontFamily: 'Outfit', fontSize: '0.93rem',
  color: 'var(--parchment)', outline: 'none',
  transition: 'border-color 0.2s ease'
}