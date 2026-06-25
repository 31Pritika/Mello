import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchMovies, searchShows, searchMusic, searchBooks, saveInterests } from '../utils/api'

const s = {
  page: { minHeight: '100vh', background: '#0A0706', padding: '2rem', fontFamily: 'Inter, sans-serif' },
  card: { maxWidth: '660px', margin: '0 auto', background: '#15100E', border: '1px solid rgba(196,84,122,0.15)', borderRadius: '4px', padding: '2.5rem' },
  logo: { fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#EFECE6', marginBottom: '0.3rem' },
  step: { fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '2rem' },
  heading: { fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 400, color: '#EFECE6', marginBottom: '0.4rem' },
  hint: { fontSize: '0.82rem', color: '#7D746D', marginBottom: '1.8rem' },
  input: { width: '100%', padding: '12px 14px', background: '#1C1512', border: '1px solid rgba(196,84,122,0.15)', borderRadius: '2px', color: '#EFECE6', fontFamily: 'Inter', fontSize: '0.9rem', outline: 'none', marginBottom: '1rem' },
  btn: (active) => ({ width: '100%', padding: '13px', background: active ? '#C4547A' : 'rgba(196,84,122,0.1)', color: active ? '#0A0706' : '#7D746D', border: 'none', borderRadius: '2px', fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: active ? 'pointer' : 'not-allowed', transition: 'all 0.3s ease' }),
  tabs: { display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' },
  tab: (active, accent) => ({ padding: '7px 16px', background: active ? `${accent}22` : 'transparent', color: active ? accent : '#7D746D', border: `1px solid ${active ? accent + '55' : 'rgba(196,84,122,0.15)'}`, borderRadius: '100px', fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s ease' }),
  searchRow: { display: 'flex', gap: '8px', marginBottom: '1.5rem' },
  searchBtn: (accent) => ({ padding: '12px 18px', background: `${accent}22`, color: accent, border: `1px solid ${accent}44`, borderRadius: '2px', fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }),
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '10px', marginBottom: '1.5rem' },
  frameCard: (selected, accent) => ({ borderRadius: '2px', overflow: 'hidden', border: `1px solid ${selected ? accent : 'rgba(196,84,122,0.1)'}`, background: selected ? `${accent}12` : '#1C1512', cursor: 'pointer', transition: 'all 0.2s ease', transform: selected ? 'scale(1.02)' : 'scale(1)' }),
  frameImg: { width: '100%', height: '130px', objectFit: 'cover', display: 'block' },
  framePlaceholder: { width: '100%', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', background: '#0A0706' },
  frameTitle: { fontSize: '0.72rem', color: '#B8B0A8', padding: '6px 7px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  pills: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' },
  pill: (accent) => ({ padding: '4px 12px', background: `${accent}18`, border: `1px solid ${accent}33`, borderRadius: '100px', fontSize: '0.78rem', color: accent, cursor: 'pointer' }),
}

const cats = [
  { id: 'movies', label: 'Cinema', emoji: '🎬', accent: '#E0A458' },
  { id: 'shows', label: 'Shows', emoji: '📺', accent: '#7B9E87' },
  { id: 'music', label: 'Music', emoji: '🎵', accent: '#C4547A' },
  { id: 'books', label: 'Books', emoji: '📚', accent: '#9A8C98' },
]

const searchFns = {
  movies: searchMovies,
  shows: searchShows,
  music: searchMusic,
  books: searchBooks
}

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState([])
  const [activeCat, setActiveCat] = useState('movies')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const navigate = useNavigate()
  const GEO = import.meta.env.VITE_GEOAPIFY_KEY
  const accent = cats.find(c => c.id === activeCat)?.accent

  function searchCities(query) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&type=city&limit=6&format=json&apiKey=${GEO}`)
        const data = await res.json()
        const seen = new Set()
        const formatted = []
        for (const item of data.results || []) {
          const cityName = item.city || item.county
          const stateName = item.state
          const countryName = item.country
          if (!cityName) continue
          const label = [cityName, stateName, countryName].filter(Boolean).join(', ')
          if (seen.has(label)) continue
          seen.add(label)
          formatted.push({ label, city: cityName, state: stateName, country: countryName })
        }
        setSuggestions(formatted)
        setShowSuggestions(formatted.length > 0)
      } catch(e) { console.error(e) }
    }, 350)
  }

  async function doSearch() {
    if (!search) return
    setLoading(true); setResults([])
    try {
      const fn = searchFns[activeCat]
      const data = await fn(search)
      setResults(data)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  function toggle(item) {
    const exists = selected.find(s => s.external_id === item.external_id && s.source === item.source)
    setSelected(exists
      ? selected.filter(s => !(s.external_id === item.external_id && s.source === item.source))
      : [...selected, item]
    )
  }

  async function finish() {
    setLoading(true)
    try {
      await saveInterests(selected, city, state, country)
      navigate('/dashboard')
    } catch(e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (step === 1) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...s.card, maxWidth: '400px' }}>
        <div style={s.logo}>mello</div>
        <div style={s.step}>Step 1 of 2</div>
        <div style={s.heading}>Where are you based?</div>
        <div style={s.hint}>We'll find people with your taste nearby.</div>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <input
            placeholder="Start typing your city..."
            value={city}
            onChange={e => { setCity(e.target.value); searchCities(e.target.value) }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            style={{ ...s.input, margin: 0, width: '100%' }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1C1512', border: '1px solid rgba(196,84,122,0.2)', borderTop: 'none', borderRadius: '0 0 2px 2px', zIndex: 50, maxHeight: '220px', overflowY: 'auto' }}>
              {suggestions.map((suggestion, i) => (
                <div key={i}
                  onMouseDown={() => { setCity(suggestion.city); setState(suggestion.state || ''); setCountry(suggestion.country || ''); setSuggestions([]); setShowSuggestions(false) }}
                  style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(196,84,122,0.08)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(196,84,122,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontSize: '0.85rem', color: '#EFECE6' }}>{suggestion.city}</div>
                  <div style={{ fontSize: '0.75rem', color: '#7D746D', marginTop: '2px' }}>{suggestion.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setStep(2)} disabled={!city} style={s.btn(!!city)}>Continue →</button>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500&family=Inter:wght@300;400;500&display=swap'); input { cursor: text !important; }`}</style>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>mello</div>
        <div style={s.step}>Step 2 of 2</div>
        <div style={s.heading}>What moves you?</div>
        <div style={s.hint}>Pick at least 5 things you love — <span style={{ color: accent }}>{selected.length} selected</span></div>

        <div style={s.tabs}>
          {cats.map(c => (
            <button key={c.id} onClick={() => { setActiveCat(c.id); setResults([]); setSearch('') }} style={s.tab(activeCat === c.id, c.accent)}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        <div style={s.searchRow}>
          <input placeholder={`Search ${activeCat}...`} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} style={{ ...s.input, margin: 0, flex: 1 }} />
          <button onClick={doSearch} style={s.searchBtn(accent)}>Search</button>
        </div>

        {loading && <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '1rem' }}>Searching the archives...</div>}

        <div style={s.grid}>
          {results.map(item => {
            const isSel = selected.find(s => s.external_id === item.external_id && s.source === item.source)
            return (
              <div key={`${item.source}-${item.external_id}`} onClick={() => toggle(item)} style={s.frameCard(isSel, accent)}>
                {item.cover_image
                  ? <img src={item.cover_image} alt={item.title} style={s.frameImg} />
                  : <div style={s.framePlaceholder}>{cats.find(c => c.id === activeCat)?.emoji}</div>
                }
                <div style={s.frameTitle}>{item.title}</div>
              </div>
            )
          })}
        </div>

        {selected.length > 0 && (
          <>
            <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '8px' }}>Your picks</div>
            <div style={s.pills}>
              {selected.map(item => {
                const c = cats.find(c => c.id === item.category)
                return <span key={`${item.source}-${item.external_id}`} onClick={() => toggle(item)} style={s.pill(c?.accent || '#C4547A')}>{item.title} ✕</span>
              })}
            </div>
          </>
        )}

        <button onClick={finish} disabled={selected.length < 5 || loading} style={s.btn(selected.length >= 5 && !loading)}>
          {loading ? 'Setting up your profile...' : selected.length >= 5 ? 'Enter Mello →' : `${5 - selected.length} more to go`}
        </button>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500&family=Inter:wght@300;400;500&display=swap'); input { cursor: text !important; }`}</style>
    </div>
  )
}