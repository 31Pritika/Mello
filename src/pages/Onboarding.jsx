import { useState } from 'react'
import { supabase } from '../SupabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [city, setCity] = useState('')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState([])
  const [activeCategory, setActiveCategory] = useState('movies')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const TMDB_KEY = import.meta.env.VITE_TMDB_KEY
  const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
  const GOOGLE_BOOKS_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY

  const categories = [
    { id: 'movies', label: 'Movies', emoji: '🎬', accent: 'var(--accent-movies)' },
    { id: 'shows', label: 'Shows', emoji: '📺', accent: 'var(--accent-shows)' },
    { id: 'music', label: 'Music', emoji: '🎵', accent: 'var(--accent-music)' },
    { id: 'books', label: 'Books', emoji: '📚', accent: 'var(--accent-books)' },
  ]

  const activeAccent = categories.find(c => c.id === activeCategory)?.accent

  async function searchItems(query) {
    if (!query) return
    setLoading(true)
    setResults([])
    try {
      if (activeCategory === 'movies') {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${query}`)
        const data = await res.json()
        setResults(data.results.slice(0, 8).map(m => ({
          item_id: String(m.id), item_name: m.title, category: 'movies',
          cover_image: m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : null
        })))
      } else if (activeCategory === 'shows') {
        const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_KEY}&query=${query}`)
        const data = await res.json()
        setResults(data.results.slice(0, 8).map(s => ({
          item_id: String(s.id), item_name: s.name, category: 'shows',
          cover_image: s.poster_path ? `https://image.tmdb.org/t/p/w200${s.poster_path}` : null
        })))
      } else if (activeCategory === 'music') {
        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
          },
          body: 'grant_type=client_credentials'
        })
        const tokenData = await tokenRes.json()
        const res = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=artist&limit=8`, {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        })
        const data = await res.json()
        setResults(data.artists.items.map(a => ({
          item_id: a.id, item_name: a.name, category: 'music',
          cover_image: a.images?.[0]?.url || null
        })))
      } else if (activeCategory === 'books') {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&key=${GOOGLE_BOOKS_KEY}&maxResults=8`)
        const data = await res.json()
        setResults((data.items || []).map(b => ({
          item_id: b.id, item_name: b.volumeInfo.title, category: 'books',
          cover_image: b.volumeInfo.imageLinks?.thumbnail || null
        })))
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  function toggleSelect(item) {
    const exists = selected.find(s => s.item_id === item.item_id && s.category === item.category)
    if (exists) setSelected(selected.filter(s => !(s.item_id === item.item_id && s.category === item.category)))
    else setSelected([...selected, item])
  }

  async function handleFinish() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ city }).eq('id', user.id)
    if (selected.length > 0) {
      await supabase.from('interests').insert(selected.map(item => ({ ...item, user_id: user.id })))
    }
    navigate('/dashboard')
  }

  if (step === 1) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--navy)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '2rem',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224,164,88,0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          width: '100%', maxWidth: '420px',
          background: 'var(--navy-light)',
          borderRadius: '20px', padding: '3rem',
          border: '1px solid rgba(154,140,152,0.15)'
        }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.8rem', color: 'var(--parchment)',
              marginBottom: '0.3rem'
            }}>mello</h1>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {[1, 2].map(i => (
                <div key={i} style={{
                  height: '3px', width: i === 1 ? '24px' : '16px',
                  borderRadius: '4px',
                  background: i === step ? 'var(--gold)' : 'rgba(154,140,152,0.3)'
                }} />
              ))}
              <span style={{
                fontFamily: 'Outfit', fontSize: '0.78rem',
                color: 'var(--text-muted)', marginLeft: '4px'
              }}>step 1 of 2</span>
            </div>
          </div>

          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.5rem', fontWeight: '500',
            color: 'var(--parchment)', marginBottom: '0.5rem'
          }}>Where are you?</h2>
          <p style={{
            fontFamily: 'Outfit', fontSize: '0.88rem',
            color: 'var(--text-secondary)', marginBottom: '1.8rem',
            lineHeight: 1.6
          }}>
            We'll find people with your taste nearby — city level, nothing more precise.
          </p>

          <input
            placeholder="Your city"
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && city && setStep(2)}
            style={{
              width: '100%', padding: '13px 16px',
              background: 'var(--navy-mid)',
              border: '1px solid rgba(154,140,152,0.2)',
              borderRadius: '10px', fontFamily: 'Outfit',
              fontSize: '0.95rem', color: 'var(--parchment)',
              outline: 'none', marginBottom: '1rem'
            }}
          />

          <button
            onClick={() => setStep(2)}
            disabled={!city}
            style={{
              width: '100%', padding: '14px',
              background: city
                ? 'linear-gradient(135deg, var(--gold-dim), var(--gold))'
                : 'rgba(154,140,152,0.15)',
              color: city ? 'var(--navy)' : 'var(--text-muted)',
              border: 'none', borderRadius: '12px',
              fontFamily: 'Outfit', fontSize: '0.95rem',
              fontWeight: '500', cursor: city ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease'
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--navy)',
      padding: '2rem', position: 'relative', overflow: 'hidden'
    }}>

      {/* Ambient glow that shifts per category */}
      <div style={{
        position: 'fixed', top: '-150px', right: '-150px',
        width: '600px', height: '600px', borderRadius: '50%',
        background: `radial-gradient(circle, ${activeAccent}18 0%, transparent 70%)`,
        transition: 'background 0.8s ease',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '2rem'
        }}>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.6rem', color: 'var(--parchment)'
          }}>mello</h1>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                height: '3px', width: i === 2 ? '24px' : '16px',
                borderRadius: '4px',
                background: i === step ? 'var(--gold)' : 'rgba(154,140,152,0.3)'
              }} />
            ))}
            <span style={{
              fontFamily: 'Outfit', fontSize: '0.78rem',
              color: 'var(--text-muted)', marginLeft: '4px'
            }}>step 2 of 2</span>
          </div>
        </div>

        <div style={{
          background: 'var(--navy-light)', borderRadius: '20px',
          padding: '2.5rem', border: '1px solid rgba(154,140,152,0.15)'
        }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.5rem', fontWeight: '500',
            color: 'var(--parchment)', marginBottom: '0.4rem'
          }}>What moves you?</h2>
          <p style={{
            fontFamily: 'Outfit', fontSize: '0.88rem',
            color: 'var(--text-secondary)', marginBottom: '2rem'
          }}>
            Pick at least 5 things you love —{' '}
            <span style={{ color: activeAccent, fontWeight: '500', transition: 'color 0.4s ease' }}>
              {selected.length} selected
            </span>
          </p>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {categories.map(cat => {
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setResults([]); setSearch('') }}
                  style={{
                    padding: '8px 18px',
                    background: isActive ? `${cat.accent}22` : 'transparent',
                    color: isActive ? cat.accent : 'var(--text-secondary)',
                    border: `1px solid ${isActive ? cat.accent + '55' : 'rgba(154,140,152,0.2)'}`,
                    borderRadius: '100px',
                    fontFamily: 'Outfit', fontSize: '0.88rem',
                    fontWeight: isActive ? '500' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat.emoji} {cat.label}
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
            <input
              placeholder={`Search ${activeCategory}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchItems(search)}
              style={{
                flex: 1, padding: '12px 16px',
                background: 'var(--navy-mid)',
                border: '1px solid rgba(154,140,152,0.2)',
                borderRadius: '10px', fontFamily: 'Outfit',
                fontSize: '0.92rem', color: 'var(--parchment)', outline: 'none'
              }}
            />
            <button
              onClick={() => searchItems(search)}
              style={{
                padding: '12px 20px',
                background: `${activeAccent}22`,
                color: activeAccent,
                border: `1px solid ${activeAccent}44`,
                borderRadius: '10px', fontFamily: 'Outfit',
                fontSize: '0.92rem', fontWeight: '500',
                cursor: 'pointer', transition: 'all 0.3s ease'
              }}
            >
              Search
            </button>
          </div>

          {loading && (
            <p style={{
              fontFamily: 'Outfit', fontSize: '0.88rem',
              color: 'var(--text-muted)', marginBottom: '1rem',
              fontStyle: 'italic'
            }}>Searching the archives...</p>
          )}

          {/* Results */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: '12px', marginBottom: '1.5rem'
          }}>
            {results.map(item => {
              const isSelected = selected.find(s => s.item_id === item.item_id && s.category === item.category)
              return (
                <div
                  key={item.item_id}
                  onClick={() => toggleSelect(item)}
                  style={{
                    cursor: 'pointer', borderRadius: '10px',
                    overflow: 'hidden',
                    border: isSelected ? `1.5px solid ${activeAccent}` : '1.5px solid rgba(154,140,152,0.1)',
                    background: isSelected ? `${activeAccent}15` : 'var(--navy-mid)',
                    transition: 'all 0.2s ease',
                    transform: isSelected ? 'scale(1.03)' : 'scale(1)'
                  }}
                >
                  {item.cover_image ? (
                    <img
                      src={item.cover_image} alt={item.item_name}
                      style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '140px',
                      background: 'var(--navy)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '2rem'
                    }}>
                      {categories.find(c => c.id === item.category)?.emoji}
                    </div>
                  )}
                  <p style={{
                    fontFamily: 'Outfit', fontSize: '0.75rem',
                    color: 'var(--text-secondary)', padding: '6px 8px',
                    lineHeight: 1.3,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {item.item_name}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Selected pills */}
          {selected.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{
                fontFamily: 'Outfit', fontSize: '0.78rem',
                color: 'var(--text-muted)', marginBottom: '8px',
                letterSpacing: '0.05em', textTransform: 'uppercase'
              }}>Your picks</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selected.map(item => {
                  const cat = categories.find(c => c.id === item.category)
                  return (
                    <span
                      key={`${item.category}-${item.item_id}`}
                      onClick={() => toggleSelect(item)}
                      style={{
                        padding: '4px 12px',
                        background: `${cat?.accent}18`,
                        border: `1px solid ${cat?.accent}33`,
                        borderRadius: '100px',
                        fontFamily: 'Outfit', fontSize: '0.8rem',
                        color: cat?.accent, cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {item.item_name} ✕
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Finish */}
          <button
            onClick={handleFinish}
            disabled={selected.length < 5 || loading}
            style={{
              width: '100%', padding: '14px',
              background: selected.length >= 5
                ? 'linear-gradient(135deg, var(--gold-dim), var(--gold))'
                : 'rgba(154,140,152,0.1)',
              color: selected.length >= 5 ? 'var(--navy)' : 'var(--text-muted)',
              border: 'none', borderRadius: '12px',
              fontFamily: 'Outfit', fontSize: '0.95rem',
              fontWeight: '500',
              cursor: selected.length >= 5 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease'
            }}
          >
            {loading
              ? 'Setting up your profile...'
              : selected.length >= 5
                ? 'Enter Mello →'
                : `${5 - selected.length} more to go`}
          </button>
        </div>
      </div>
    </div>
  )
}