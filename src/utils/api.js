const BASE = 'http://localhost:8000'
// backend server address

function getToken() {
  return localStorage.getItem('mello_token')
}
// gets the users JWT authetication token from local storage

function headers() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

async function request(method, path, body = null) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    ...(body && { body: JSON.stringify(body) })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

// Auth
export async function register(email, password, confirmPassword, name) {
  const data = await request('POST', '/auth/register', {
    email,
    password,
    confirm_password: confirmPassword,
    name
  })
  localStorage.setItem('mello_token', data.access_token)
  localStorage.setItem('mello_user', JSON.stringify({
    id: data.user_id,
    name: data.name,
    email: data.email
  }))
  return data
}

export async function login(email, password) {
  const data = await request('POST', '/auth/login', { email, password })
  localStorage.setItem('mello_token', data.access_token)
  localStorage.setItem('mello_user', JSON.stringify({ id: data.user_id, name: data.name, email: data.email }))
  return data
}

export function logout() {
  localStorage.removeItem('mello_token')
  localStorage.removeItem('mello_user')
}

export function getStoredUser() {
  const u = localStorage.getItem('mello_user')
  return u ? JSON.parse(u) : null
}

//removes mello_token and mello_user from local storage
export function isLoggedIn() {
  return !!getToken()
}

// Content search
export async function searchMovies(q) {
  return request('GET', `/content/search/movies?q=${encodeURIComponent(q)}`)
}

export async function searchShows(q) {
  return request('GET', `/content/search/shows?q=${encodeURIComponent(q)}`)
}

export async function searchMusic(q) {
  return request('GET', `/content/search/music?q=${encodeURIComponent(q)}`)
}

export async function searchBooks(q) {
  return request('GET', `/content/search/books?q=${encodeURIComponent(q)}`)
}

// Saves Interests
export async function saveInterests(items, city, state, country) {
  return request('POST', '/content/interests', { items, city, state, country })
}

//gets interests
export async function getInterests() {
  return request('GET', '/content/interests')
}

// Matching
export async function runMatching() {
  return request('POST', '/match/run')
}

// Circles
export async function getMyCircles() {
  return request('GET', '/circles/mine')
}

export async function getCirclePosts(circleId) {
  return request('GET', `/circles/${circleId}/posts`)
}

export async function createPost(circleId, content, postType = 'thought') {
  return request('POST', '/circles/posts', { circle_id: circleId, content, post_type: postType })
}

export async function reactToPost(postId, reactionType) {
  return request('POST', '/circles/posts/react', { post_id: postId, reaction_type: reactionType })
}

export async function renameCircle(circleId, name) {
  return request('PUT', `/circles/${circleId}/rename`, { name })
}

// Google OAuth
export function loginWithGoogle() {
  window.location.href = 'http://localhost:8000/auth/google'
}

// Magic link
export async function requestMagicLink(email) {
  return request('POST', '/auth/magic-link', { email })
}

export async function verifyToken(token, tokenType) {
  const data = await request('POST', '/auth/verify-token', {
    token,
    token_type: tokenType
  })
  localStorage.setItem('mello_token', data.access_token)
  localStorage.setItem('mello_user', JSON.stringify({
    id: data.user_id,
    name: data.name,
    email: data.email
  }))
  return data
}

// Password reset
export async function forgotPassword(email) {
  return request('POST', '/auth/forgot-password', { email })
}

export async function resetPassword(token, newPassword, confirmPassword) {
  return request('POST', '/auth/reset-password', {
    token,
    new_password: newPassword,
    confirm_password: confirmPassword
  })
}