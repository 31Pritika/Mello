import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Cinema from './pages/Cinema'
import Music from './pages/Music'
import Reads from './pages/Reads'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import AuthCallback from './pages/AuthCallback.jsx'
import ResetPassword from './pages/ResetPassword.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/cinema" element={<Cinema />} />
        <Route path="/music" element={<Music />} />
        <Route path="/reads" element={<Reads />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/verify" element={<AuthCallback />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App