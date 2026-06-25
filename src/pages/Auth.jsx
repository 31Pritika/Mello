import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../utils/api'

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

    if (!isLogin) {
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
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, confirmPassword, name)
      }
      navigate('/onboarding')
    } catch(e) {
      setError(e.message)
    }
    setLoading(false)
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

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>mello</div>
        <div style={s.sub}>Taste Collective</div>
        <div style={s.heading}>{isLogin ? 'Welcome back' : 'Join the library'}</div>
        <div style={s.hint}>{isLogin ? 'Your circle is waiting' : 'Find people who just get it'}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {!isLogin && (
            <Field label="Your name" field="name" value={name} onChange={setName} placeholder="How should we call you?" />
          )}

          <Field label="Email" field="email" value={email} onChange={setEmail} placeholder="your@email.com" />

          <div>
            <label style={s.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); if (touched.password) setFieldErrors(prev => ({ ...prev, password: validateField('password', e.target.value) })) }}
              onBlur={() => handleBlur('password', password)}
              style={s.input(touched.password && fieldErrors.password)}
            />
            {!isLogin && password && (
              <>
                <div style={s.strengthBar(strength)} />
                <div style={{ fontSize: '9px', letterSpacing: '0.1em', color: strength === 3 ? '#4A9E6A' : strength === 2 ? '#E0A458' : '#C4547A', marginBottom: '8px' }}>
                  {strengthLabel}
                </div>
              </>
            )}
            {touched.password && fieldErrors.password && <span style={s.fieldError}>{fieldErrors.password}</span>}
          </div>

          {!isLogin && (
            <Field label="Confirm password" field="confirmPassword" value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="••••••••" />
          )}
        </div>

        {error && <div style={{ ...s.error, marginTop: '0.8rem' }}>{error}</div>}

        <button onClick={handleSubmit} disabled={loading} style={s.btn(!loading)}>
          {loading ? 'One moment...' : isLogin ? 'Enter →' : 'Join Mello →'}
        </button>

        <div style={s.toggle}>
          {isLogin ? "New here? " : "Already a member? "}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); setFieldErrors({}); setTouched({}) }} style={s.toggleLink}>
            {isLogin ? 'Create an account' : 'Sign in'}
          </span>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500&family=Inter:wght@300;400;500&display=swap');
        input { cursor: text !important; }
      `}</style>
    </div>
  )
}