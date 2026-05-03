import { useState } from 'react'
import { supabase } from '../SupabaseClient'
import { useNavigate } from 'react-router-dom'

const s = {
  page: { minHeight: '100vh', background: '#0A0706', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Inter, sans-serif' },
  card: { width: '100%', maxWidth: '400px', background: '#15100E', border: '1px solid rgba(196,84,122,0.15)', borderRadius: '4px', padding: '3rem' },
  logo: { fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#EFECE6', marginBottom: '0.3rem' },
  sub: { fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '2.5rem' },
  heading: { fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 400, color: '#EFECE6', marginBottom: '0.4rem' },
  hint: { fontSize: '0.82rem', color: '#7D746D', marginBottom: '2rem' },
  label: { display: 'block', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '6px' },
  input: { width: '100%', padding: '12px 14px', background: '#1C1512', border: '1px solid rgba(196,84,122,0.15)', borderRadius: '2px', color: '#EFECE6', fontFamily: 'Inter', fontSize: '0.9rem', outline: 'none', marginBottom: '1rem' },
  btn: { width: '100%', padding: '13px', background: '#C4547A', color: '#0A0706', border: 'none', borderRadius: '2px', fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '1.2rem' },
  toggle: { textAlign: 'center', fontSize: '0.82rem', color: '#7D746D' },
  toggleLink: { color: '#C4547A', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' },
  error: { fontSize: '0.82rem', color: '#C4547A', background: 'rgba(196,84,122,0.08)', border: '1px solid rgba(196,84,122,0.2)', borderRadius: '2px', padding: '10px 12px', marginBottom: '1rem' }
}

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit() {
    setError(''); setLoading(true)
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
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>mello</div>
        <div style={s.sub}>Taste Collective</div>
        <div style={s.heading}>{isLogin ? 'Welcome back' : 'Join the library'}</div>
        <div style={s.hint}>{isLogin ? 'Your circle is waiting' : 'Find people who just get it'}</div>
        {!isLogin && <><label style={s.label}>Your name</label><input placeholder="How should we call you?" value={name} onChange={e => setName(e.target.value)} style={s.input} /></>}
        <label style={s.label}>Email</label>
        <input placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={s.input} />
        <label style={s.label}>Password</label>
        <input placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} style={s.input} />
        {error && <div style={s.error}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'One moment...' : isLogin ? 'Enter →' : 'Join Mello →'}
        </button>
        <div style={s.toggle}>
          {isLogin ? "New here? " : "Already a member? "}
          <span onClick={() => { setIsLogin(!isLogin); setError('') }} style={s.toggleLink}>
            {isLogin ? 'Create an account' : 'Sign in'}
          </span>
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500&family=Inter:wght@300;400;500&display=swap'); * { cursor: default; } input { cursor: text !important; }`}</style>
    </div>
  )
}