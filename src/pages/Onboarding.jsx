import { useState } from 'react'
import { supabase } from '../SupabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [city, setCity] = useState('')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState([]) // { category, item_id, item_name, cover_image }
  const [activeCategory, setActiveCategory] = useState('movies')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const TMDB_KEY = import.meta.env.VITE_TMDB_KEY
  const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
  const GOOGLE_BOOKS_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY

  async function searchItems(query) {
    if (!query) return
    setLoading(true)
    setResults([])

    try {
      if (activeCategory === 'movies') {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${query}`)
        const data = await res.json()
        setResults(data.results.slice(0, 6).map(m => ({
          item_id: String(m.id),
          item_name: m.title,
          cover_image: m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : null,
          category: 'movies'
        })))
      }

      else if (activeCategory === 'shows') {
        const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_KEY}&query=${query}`)
        const data = await res.json()
        setResults(data.results.slice(0, 6).map(s => ({
          item_id: String(s.id),
          item_name: s.name,
          cover_image: s.poster_path ? `https://image.tmdb.org/t/p/w200${s.poster_path}` : null,
          category: 'shows'
        })))
      }

      else if (activeCategory === 'music') {
        // Get Spotify token
        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
          },
          body: 'grant_type=client_credentials'
        })
        const tokenData = await tokenRes.json()
        const token = tokenData.access_token

        const res = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=artist&limit=6`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        setResults(data.artists.items.map(a => ({
          item_id: a.id,
          item_name: a.name,
          cover_image: a.images?.[0]?.url || null,
          category: 'music'
        })))
      }

      else if (activeCategory === 'books') {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&key=${GOOGLE_BOOKS_KEY}&maxResults=6`)
        const data = await res.json()
        setResults((data.items || []).map(b => ({
          item_id: b.id,
          item_name: b.volumeInfo.title,
          cover_image: b.volumeInfo.imageLinks?.thumbnail || null,
          category: 'books'
        })))
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  function toggleSelect(item) {
    const exists = selected.find(s => s.item_id === item.item_id && s.category === item.category)
    if (exists) {
      setSelected(selected.filter(s => !(s.item_id === item.item_id && s.category === item.category)))
    } else {
      setSelected([...selected, item])
    }
  }

  async function handleFinish() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    // Save city
    await supabase.from('profiles').update({ city }).eq('id', user.id)

    // Save interests
    if (selected.length > 0) {
      await supabase.from('interests').insert(
        selected.map(item => ({ ...item, user_id: user.id }))
      )
    }

    navigate('/dashboard')
  }

  // Step 1 — City
  if (step === 1) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
        <h1>Mello</h1>
        <h2>Where are you based?</h2>
        <p>We'll use this to find people near you</p>
        <input
          placeholder="Your city"
          value={city}
          onChange={e => setCity(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <button
          onClick={() => setStep(2)}
          disabled={!city}
          style={{ width: '100%', padding: '10px' }}
        >
          Continue
        </button>
      </div>
    )
  }

  // Step 2 — Interests
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1>Mello</h1>
      <h2>What are you into?</h2>
      <p>Pick at least 5 things you love — {selected.length} selected so far</p>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['movies', 'shows', 'music', 'books'].map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setResults([]); setSearch('') }}
            style={{
              padding: '8px 16px',
              background: activeCategory === cat ? '#000' : '#eee',
              color: activeCategory === cat ? '#fff' : '#000',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          placeholder={`Search ${activeCategory}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchItems(search)}
          style={{ flex: 1, padding: '8px' }}
        />
        <button onClick={() => searchItems(search)} style={{ padding: '8px 16px' }}>
          Search
        </button>
      </div>

      {/* Results */}
      {loading && <p>Searching...</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        {results.map(item => {
          const isSelected = selected.find(s => s.item_id === item.item_id && s.category === item.category)
          return (
            <div
              key={item.item_id}
              onClick={() => toggleSelect(item)}
              style={{
                width: '100px',
                cursor: 'pointer',
                opacity: isSelected ? 1 : 0.6,
                border: isSelected ? '2px solid black' : '2px solid transparent',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              {item.cover_image && (
                <img src={item.cover_image} alt={item.item_name}
                  style={{ width: '100%', height: '130px', objectFit: 'cover' }} />
              )}
              <p style={{ fontSize: '12px', padding: '4px', margin: 0 }}>{item.item_name}</p>
            </div>
          )
        })}
      </div>

      {/* Selected summary */}
      {selected.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Selected:</strong> {selected.map(s => s.item_name).join(', ')}</p>
        </div>
      )}

      <button
        onClick={handleFinish}
        disabled={selected.length < 5 || loading}
        style={{ width: '100%', padding: '10px' }}
      >
        {loading ? 'Saving...' : `Done — Let's go`}
      </button>
    </div>
  )
}