import { useState } from 'react'
import { supabase } from '../SupabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else navigate('/dashboard')
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); return }
      // Create profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        city: ''
      })
      navigate('/onboarding')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      {!isLogin && (
        <input placeholder="Name" value={name}
          onChange={e => setName(e.target.value)} />
      )}
      <input placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password}
        onChange={e => setPassword(e.target.value)} />
      {error && <p>{error}</p>}
      <button type="submit">
        {isLogin ? 'Login' : 'Register'}
      </button>
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', color: 'blue' }}>
        {isLogin ? 'No account? Register' : 'Have an account? Login'}
      </p>
    </form>
  )
}