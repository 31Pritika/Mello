import { useState } from 'react'
import { supabase } from '../SupabaseClient'
import { useNavigate } from 'react-router-dom'

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

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [city, setCity] = useState('')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState([])
  const [activeCat, setActiveCat] = useState('movies')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const TMDB = import.meta.env.VITE_TMDB_KEY
  const SP_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  const SP_SEC = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
  const GB = import.meta.env.VITE_GOOGLE_BOOKS_KEY
  const accent = cats.find(c => c.id === activeCat)?.accent

  async function doSearch() {
    if (!search) return
    setLoading(true); setResults([])
    try {
      if (activeCat === 'movies') {
        const d = await (await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB}&query=${search}`)).json()
        setResults(d.results.slice(0,8).map(m => ({ item_id: String(m.id), item_name: m.title, category: 'movies', cover_image: m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : null })))
      } else if (activeCat === 'shows') {
        const d = await (await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB}&query=${search}`)).json()
        setResults(d.results.slice(0,8).map(s => ({ item_id: String(s.id), item_name: s.name, category: 'shows', cover_image: s.poster_path ? `https://image.tmdb.org/t/p/w200${s.poster_path}` : null })))
      } else if (activeCat === 'music') {
        const t = await (await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + btoa(`${SP_ID}:${SP_SEC}`) }, body: 'grant_type=client_credentials' })).json()
        const d = await (await fetch(`https://api.spotify.com/v1/search?q=${search}&type=artist&limit=8`, { headers: { Authorization: `Bearer ${t.access_token}` } })).json()
        setResults(d.artists.items.map(a => ({ item_id: a.id, item_name: a.name, category: 'music', cover_image: a.images?.[0]?.url || null })))
      } else {
        const d = await (await fetch(`https://www.googleapis.com/books/v1/volumes?q=${search}&key=${GB}&maxResults=8`)).json()
        setResults((d.items||[]).map(b => ({ item_id: b.id, item_name: b.volumeInfo.title, category: 'books', cover_image: b.volumeInfo.imageLinks?.thumbnail || null })))
      }
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  function toggle(item) {
    const exists = selected.find(s => s.item_id === item.item_id && s.category === item.category)
    setSelected(exists ? selected.filter(s => !(s.item_id === item.item_id && s.category === item.category)) : [...selected, item])
  }

  async function finish() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ city }).eq('id', user.id)
    if (selected.length > 0) await supabase.from('interests').insert(selected.map(i => ({ ...i, user_id: user.id })))
    navigate('/dashboard')
  }

  if (step === 1) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...s.card, maxWidth: '400px' }}>
        <div style={s.logo}>mello</div>
        <div style={s.step}>Step 1 of 2</div>
        <div style={s.heading}>Where are you based?</div>
        <div style={s.hint}>We'll find people with your taste nearby — city level, nothing more.</div>
        <input placeholder="Your city" value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && city && setStep(2)} style={s.input} />
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
        <div style={s.hint}>
          Pick at least 5 things you love —{' '}
          <span style={{ color: accent }}>{selected.length} selected</span>
        </div>

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
            const isSel = selected.find(s => s.item_id === item.item_id && s.category === item.category)
            return (
              <div key={item.item_id} onClick={() => toggle(item)} style={s.frameCard(isSel, accent)}>
                {item.cover_image
                  ? <img src={item.cover_image} alt={item.item_name} style={s.frameImg} />
                  : <div style={s.framePlaceholder}>{cats.find(c => c.id === item.category)?.emoji}</div>
                }
                <div style={s.frameTitle}>{item.item_name}</div>
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
                return <span key={`${item.category}-${item.item_id}`} onClick={() => toggle(item)} style={s.pill(c.accent)}>{item.item_name} ✕</span>
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