import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../utils/api'
import { loginWithGoogle, requestMagicLink, forgotPassword } from '../utils/api'

const s = {
  page: { minHeight: '100vh', background: '#0A0706', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Inter, sans-serif' },
  card: { width: '100%', maxWidth: '420px', background: '#15100E', border: '1px solid rgba(196,84,122,0.15)', borderRadius: '4px', padding: '3rem' },
  logo: { fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#EFECE6', marginBottom: '0.3rem' },
  sub: { fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '2.5rem' },
  heading: { fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 400, color: '#EFECE6', marginBottom: '0.4rem' },
  hint: { fontSize: '0.82rem', color: '#7D746D', marginBottom: '2rem' },
  label: { display: 'block', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '6px' },
  input: (hasError) => ({ width: '100%', padding: '12px 14px', background: '#1C1512', border: `1px solid ${hasError ? 'rgba(196,84,122,0.6)' : 'rgba(196,84,122,0.15)'}`, borderRadius: '2px', color: '#EFECE6', fontFamily: 'Inter', fontSize: '0.9rem', outline: 'none', marginBottom: '4px' }),
  fieldError: { fontSize: '0.75rem', color: '#C4547A', marginBottom: '10px', display: 'block' },
  btn: (active) => ({ width: '100%', padding: '13px', background: active ? '#C4547A' : 'rgba(196,84,122,0.1)', color: active ? '#0A0706' : '#7D746D', border: 'none', borderRadius: '2px', fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: active ? 'pointer' : 'not-allowed', transition: 'all 0.3s ease', marginBottom: '1.2rem', marginTop: '0.8rem' }),
  toggle: { textAlign: 'center', fontSize: '0.82rem', color: '#7D746D' },
  toggleLink: { color: '#C4547A', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' },
  error: { fontSize: '0.82rem', color: '#C4547A', background: 'rgba(196,84,122,0.08)', border: '1px solid rgba(196,84,122,0.2)', borderRadius: '2px', padding: '10px 12px', marginBottom: '1rem' },
  strengthBar: (strength) => ({
    height: '3px', borderRadius: '2px', marginBottom: '8px',
    background: strength === 0 ? 'rgba(196,84,122,0.1)' : strength === 1 ? '#8C3A57' : strength === 2 ? '#E0A458' : '#4A9E6A',
    width: strength === 0 ? '0%' : strength === 1 ? '33%' : strength === 2 ? '66%' : '100%',
    transition: 'all 0.3s ease'
  })
}

function getPasswordStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  return score
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function Field({ label, field, value, onChange, type = 'text', placeholder }) {
    const hasError = touched[field] && fieldErrors[field]
    return (
      <div style={{ marginBottom: hasError ? '0' : '0' }}>
        <label style={s.label}>{label}</label>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => { onChange(e.target.value); if (touched[field]) setFieldErrors(prev => ({ ...prev, [field]: validateField(field, e.target.value) })) }}
          onBlur={() => handleBlur(field, value)}
          style={s.input(hasError)}
        />
        {hasError && <span style={s.fieldError}>{fieldErrors[field]}</span>}
      </div>
    )
  }


export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'magic' | 'forgot'
  const [magicEmail, setMagicEmail] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const strength = getPasswordStrength(password)
  const strengthLabel = ['', 'Weak', 'Almost there', 'Strong'][strength]

  function validateField(field, value) {
    switch(field) {
      case 'email':
        return validateEmail(value) ? '' : 'Enter a valid email address'
      case 'password':
        if (value.length < 8) return 'At least 8 characters'
        if (!/[A-Z]/.test(value)) return 'Add an uppercase letter'
        if (!/[0-9]/.test(value)) return 'Add a number'
        return ''
      case 'confirmPassword':
        return value === password ? '' : 'Passwords do not match'
      case 'name':
        return value.trim().length >= 2 ? '' : 'Name must be at least 2 characters'
      default:
        return ''
    }
  }

  function handleBlur(field, value) {
    setTouched(prev => ({ ...prev, [field]: true }))
    setFieldErrors(prev => ({ ...prev, [field]: validateField(field, value) }))
  }

  async function handleSubmit() {
  setError('')

  if (mode === 'register') {
    const errors = {
      name: validateField('name', name),
      email: validateField('email', email),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword),
    }
    setFieldErrors(errors)
    setTouched({ name: true, email: true, password: true, confirmPassword: true })
    if (Object.values(errors).some(e => e)) return
  } else {
    if (!validateEmail(email)) {
      setFieldErrors({ email: 'Enter a valid email address' })
      setTouched({ email: true })
      return
    }
  }

  setLoading(true)
  try {
    if (mode === 'login') {
      await login(email, password)
      navigate('/dashboard')
    } else if (mode === 'register') {
      await register(email, password, confirmPassword, name)
      navigate('/onboarding')
    }
  } catch(e) {
    setError(e.message)
  }
  setLoading(false)
}

  async function handleMagicLink() {
  setError(''); setLoading(true)
  try {
    await requestMagicLink(magicEmail)
    setMagicSent(true)
  } catch(e) { setError(e.message) }
  setLoading(false)
}

async function handleForgotPassword() {
  setError(''); setLoading(true)
  try {
    await forgotPassword(forgotEmail)
    setForgotSent(true)
  } catch(e) { setError(e.message) }
  setLoading(false)
}

  return (
  <div style={s.page}>
    <div style={s.card}>
      <div style={s.logo}>mello</div>
      <div style={s.sub}>Taste Collective</div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '2rem' }}>
        {[['login', 'Sign In'], ['register', 'Register'], ['magic', 'Magic Link']].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setError('') }} style={{
            padding: '6px 14px', borderRadius: '100px',
            background: mode === m ? '#C4547A' : 'transparent',
            color: mode === m ? '#0A0706' : '#7D746D',
            border: `1px solid ${mode === m ? '#C4547A' : 'rgba(196,84,122,0.2)'}`,
            fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s ease'
          }}>{label}</button>
        ))}
      </div>

      {/* Google OAuth button — shown on login and register */}
      {(mode === 'login' || mode === 'register') && (
        <>
          <button onClick={loginWithGoogle} style={{
            width: '100%', padding: '12px', marginBottom: '1rem',
            background: 'transparent',
            border: '1px solid rgba(196,84,122,0.2)',
            borderRadius: '2px', color: '#EFECE6',
            fontFamily: 'Inter', fontSize: '0.88rem',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '10px',
            transition: 'border-color 0.2s ease'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(196,84,122,0.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(196,84,122,0.2)'}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.6 26.9 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.6 5C9.5 39.5 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.5 36.1 44 30.5 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            Continue with Google
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(196,84,122,0.1)' }} />
            <span style={{ fontSize: '9px', color: '#5A5450', letterSpacing: '0.15em', textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(196,84,122,0.1)' }} />
          </div>
        </>
      )}

      {/* Login form */}
      {mode === 'login' && (
        <>
          <div style={s.heading}>Welcome back</div>
          <div style={s.hint}>Your circle is waiting</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div>
              <label style={s.label}>Email</label>
              <input type="text" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={s.input(touched.email && fieldErrors.email)} onBlur={() => handleBlur('email', email)} />
              {touched.email && fieldErrors.email && <span style={s.fieldError}>{fieldErrors.email}</span>}
            </div>
            <div>
              <label style={s.label}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={s.input(false)} onBlur={() => handleBlur('password', password)} />
            </div>
          </div>
          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <span onClick={() => setMode('forgot')} style={{ fontSize: '0.8rem', color: '#C4547A', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              Forgot password?
            </span>
          </div>
          {error && <div style={{ ...s.error, marginBottom: '0.8rem' }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={s.btn(!loading)}>
            {loading ? 'One moment...' : 'Enter →'}
          </button>
          <div style={s.toggle}>
            New here?{' '}
            <span onClick={() => setMode('register')} style={s.toggleLink}>Create an account</span>
          </div>
        </>
      )}

      {/* Register form */}
      {mode === 'register' && (
        <>
          <div style={s.heading}>Join the library</div>
          <div style={s.hint}>Find people who just get it</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>
              <label style={s.label}>Your name</label>
              <input type="text" placeholder="How should we call you?" value={name} onChange={e => setName(e.target.value)} style={s.input(touched.name && fieldErrors.name)} onBlur={() => handleBlur('name', name)} />
              {touched.name && fieldErrors.name && <span style={s.fieldError}>{fieldErrors.name}</span>}
            </div>
            <div>
              <label style={s.label}>Email</label>
              <input type="text" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={s.input(touched.email && fieldErrors.email)} onBlur={() => handleBlur('email', email)} />
              {touched.email && fieldErrors.email && <span style={s.fieldError}>{fieldErrors.email}</span>}
            </div>
            <div>
              <label style={s.label}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); if (touched.password) setFieldErrors(prev => ({ ...prev, password: validateField('password', e.target.value) })) }} onBlur={() => handleBlur('password', password)} style={s.input(touched.password && fieldErrors.password)} />
              {password && (
                <>
                  <div style={s.strengthBar(strength)} />
                  <div style={{ fontSize: '9px', letterSpacing: '0.1em', color: strength === 3 ? '#4A9E6A' : strength === 2 ? '#E0A458' : '#C4547A', marginBottom: '8px' }}>{strengthLabel}</div>
                </>
              )}
              {touched.password && fieldErrors.password && <span style={s.fieldError}>{fieldErrors.password}</span>}
            </div>
            <div>
              <label style={s.label}>Confirm Password</label>
              <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); if (touched.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: validateField('confirmPassword', e.target.value) })) }} onBlur={() => handleBlur('confirmPassword', confirmPassword)} style={s.input(touched.confirmPassword && fieldErrors.confirmPassword)} />
              {touched.confirmPassword && fieldErrors.confirmPassword && <span style={s.fieldError}>{fieldErrors.confirmPassword}</span>}
            </div>
          </div>
          {error && <div style={{ ...s.error, marginTop: '0.5rem' }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ ...s.btn(!loading), marginTop: '1rem' }}>
            {loading ? 'One moment...' : 'Join Mello →'}
          </button>
          <div style={s.toggle}>
            Already a member?{' '}
            <span onClick={() => setMode('login')} style={s.toggleLink}>Sign in</span>
          </div>
        </>
      )}

      {/* Magic link */}
      {mode === 'magic' && (
        <>
          <div style={s.heading}>Sign in without a password</div>
          <div style={s.hint}>Enter your email and we'll send you a login link.</div>
          {!magicSent ? (
            <>
              <label style={s.label}>Email</label>
              <input type="text" placeholder="your@email.com" value={magicEmail} onChange={e => setMagicEmail(e.target.value)} style={s.input(false)} />
              {error && <div style={s.error}>{error}</div>}
              <button onClick={handleMagicLink} disabled={loading || !magicEmail} style={s.btn(!loading && !!magicEmail)}>
                {loading ? 'Sending...' : 'Send Login Link →'}
              </button>
            </>
          ) : (
            <div style={{ padding: '1.5rem', background: 'rgba(74,158,106,0.08)', border: '1px solid rgba(74,158,106,0.2)', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.8rem' }}>📬</div>
              <div style={{ color: '#4A9E6A', fontSize: '0.88rem', marginBottom: '0.5rem' }}>Link sent</div>
              <div style={{ color: '#7D746D', fontSize: '0.82rem', lineHeight: 1.6 }}>Check your inbox at {magicEmail}. The link expires in 30 minutes.</div>
            </div>
          )}
          <div style={{ ...s.toggle, marginTop: '1.2rem' }}>
            <span onClick={() => setMode('login')} style={s.toggleLink}>Back to login</span>
          </div>
        </>
      )}

      {/* Forgot password */}
      {mode === 'forgot' && (
        <>
          <div style={s.heading}>Forgot your password?</div>
          <div style={s.hint}>Enter your email and we'll send you a reset link.</div>
          {!forgotSent ? (
            <>
              <label style={s.label}>Email</label>
              <input type="text" placeholder="your@email.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} style={s.input(false)} />
              {error && <div style={s.error}>{error}</div>}
              <button onClick={handleForgotPassword} disabled={loading || !forgotEmail} style={s.btn(!loading && !!forgotEmail)}>
                {loading ? 'Sending...' : 'Send Reset Link →'}
              </button>
            </>
          ) : (
            <div style={{ padding: '1.5rem', background: 'rgba(74,158,106,0.08)', border: '1px solid rgba(74,158,106,0.2)', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.8rem' }}>📬</div>
              <div style={{ color: '#4A9E6A', fontSize: '0.88rem', marginBottom: '0.5rem' }}>Reset link sent</div>
              <div style={{ color: '#7D746D', fontSize: '0.82rem', lineHeight: 1.6 }}>Check your inbox at {forgotEmail}. The link expires in 30 minutes.</div>
            </div>
          )}
          <div style={{ ...s.toggle, marginTop: '1.2rem' }}>
            <span onClick={() => setMode('login')} style={s.toggleLink}>Back to login</span>
          </div>
        </>
      )}
    </div>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500&family=Inter:wght@300;400;500&display=swap');
      input { cursor: text !important; }
    `}</style>
  </div>
)
}