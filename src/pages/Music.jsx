import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CustomCursor } from '../ui/CustomCursor.jsx'

const NAV_ROUTES = {
  'Discover': '/',
  'Cinema': '/cinema',
  'Music': '/music',
  'Reads': '/reads',
  'My Circle': '/auth',
  'Profile': '/auth',
}

const tracks = [
  { n: '01', artist: 'Frank Ocean', title: 'Nights', album: 'Blonde', time: '5:07', genre: 'Alt R&B', shared: 'prish.a' },
  { n: '02', artist: 'Phoebe Bridgers', title: 'Savior Complex', album: 'Punisher', time: '3:54', genre: 'Indie Folk', shared: 'tara_v' },
  { n: '03', artist: 'Cigarettes After Sex', title: 'Apocalypse', album: 'Cigarettes After Sex', time: '4:52', genre: 'Dream Pop', shared: 'naina_m' },
  { n: '04', artist: 'Sufjan Stevens', title: 'Death With Dignity', album: 'Carrie & Lowell', time: '3:22', genre: 'Folk', shared: 'ira_d' },
  { n: '05', artist: 'Rex Orange County', title: 'Never Had the Balls', album: 'Who Cares?', time: '2:58', genre: 'Bedroom Pop', shared: 'rohan.k' },
  { n: '06', artist: 'SZA', title: 'Garden (Say It Like Dat)', album: 'SOS', time: '3:30', genre: 'Neo Soul', shared: 'meera.v' },
]

const genres = [
  { label: 'Bedroom Pop', count: 34 },
  { label: 'Indie Folk', count: 28 },
  { label: 'Alt R&B', count: 51 },
  { label: 'Dream Pop', count: 22 },
  { label: 'Neo Soul', count: 43 },
  { label: 'Shoegaze', count: 19 },
  { label: 'Ambient', count: 15 },
  { label: 'Soft Rock', count: 11 },
]

const circles = [
  { name: 'Indie Folk & Bedroom Pop', members: 18, tags: ['Phoebe Bridgers', 'Clairo', 'Rex Orange County'] },
  { name: 'Late-Night R&B & Alt Soul', members: 24, tags: ['Frank Ocean', 'Daniel Caesar', 'SZA'] },
  { name: 'Shoegaze, Synth & Vinyl Cuts', members: 14, tags: ['Beach House', 'Tame Impala', 'Cocteau Twins'] },
]

export default function Music() {
  const attuneRef = useRef(null)
  const navigate = useNavigate()

  return (
    <div style={{ background: '#0A0706', minHeight: '100vh', color: '#EFECE6', fontFamily: 'Inter, sans-serif', cursor: 'none', overflowX: 'hidden' }}>
      <CustomCursor />

      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,84,122,0.05) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0, animation: 'pulse 6s ease-in-out infinite' }} />

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 3rem', borderBottom: '1px solid rgba(196,84,122,0.08)', background: 'rgba(10,7,6,0.9)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'none' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#EFECE6', letterSpacing: '-0.5px' }}>mello</div>
          <div style={{ fontSize: '9px', letterSpacing: '0.25em', color: '#7D746D', textTransform: 'uppercase', marginTop: '4px' }}>Sonic Frequency</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          {Object.entries(NAV_ROUTES).map(([label, path]) => {
            const isActive = label === 'Music'
            return (
              <span key={label} onClick={() => navigate(path)}
                style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'none', color: isActive ? '#C4547A' : '#7D746D', transition: 'color 0.3s' }}
                onMouseEnter={e => e.target.style.color = '#EFECE6'}
                onMouseLeave={e => e.target.style.color = isActive ? '#C4547A' : '#7D746D'}
              >{label}</span>
            )
          })}
        </div>
      </nav>

      {/* ── HERO — split layout: left text, right large number */}
      <section style={{ padding: '10rem 3rem 5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'end', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ fontSize: '8px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C4547A', marginBottom: '1.5rem' }}>
            Mello Music — Hyderabad // 3 circles active
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 400, lineHeight: 1.2, color: '#EFECE6', margin: '0 0 1.5rem' }}>
            Songs you play when<br />
            no one is <em style={{ fontStyle: 'italic', color: '#C4547A' }}>watching</em>
          </h1>
          <p style={{ fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7D746D', lineHeight: 1.9, maxWidth: '380px' }}>
            Late-night records, B-sides, and bedroom pop. Match with listeners in your city who live inside the same 3am playlist.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(5rem, 12vw, 10rem)', lineHeight: 1, color: 'rgba(196,84,122,0.08)', letterSpacing: '-4px' }}>♪</div>
          <div style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7D746D', marginTop: '-1rem' }}>currently playing in circles</div>
        </div>
      </section>

      {/* ── TRACKLIST — numbered list, not cards */}
      <div style={{ padding: '0 3rem 1rem', position: 'relative', zIndex: 1 }}>
        {/* header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 120px 100px 80px 80px', gap: '0 1.5rem', padding: '0 0 0.8rem', borderBottom: '1px solid rgba(196,84,122,0.12)', marginBottom: '0.5rem' }}>
          {['#', 'Track', 'Album', 'Genre', 'Length', 'From'].map((h, i) => (
            <div key={h} style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(125,116,109,0.5)', textAlign: i > 3 ? 'right' : 'left' }}>{h}</div>
          ))}
        </div>
        {tracks.map((t, i) => (
          <div key={i}
            style={{ display: 'grid', gridTemplateColumns: '32px 1fr 120px 100px 80px 80px', gap: '0 1.5rem', padding: '1rem 0', borderBottom: '1px solid rgba(196,84,122,0.06)', alignItems: 'center', transition: 'background 0.25s', borderRadius: '2px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(196,84,122,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.75rem', color: 'rgba(196,84,122,0.35)' }}>{t.n}</div>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: '#EFECE6', lineHeight: 1.3 }}>{t.title}</div>
              <div style={{ fontSize: '9px', letterSpacing: '0.08em', color: '#7D746D', marginTop: '2px' }}>{t.artist}</div>
            </div>
            <div style={{ fontSize: '9px', letterSpacing: '0.08em', color: '#7D746D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.album}</div>
            <div style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B8B0A8', border: '1px solid rgba(239,236,230,0.1)', padding: '2px 7px', borderRadius: '100px', width: 'fit-content' }}>{t.genre}</div>
            <div style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#7D746D', textAlign: 'right' }}>{t.time}</div>
            <div style={{ fontSize: '9px', letterSpacing: '0.08em', color: '#C4547A', textAlign: 'right' }}>{t.shared}</div>
          </div>
        ))}
      </div>

      {/* ── GENRE FREQUENCY ── pill cloud weighted by count */}
      <div style={{ padding: '4rem 3rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '1.5rem' }}>
          <span style={{ color: '#C4547A', marginRight: '8px' }}>—</span> Genre frequency in your city
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {genres.map(g => {
            const size = 0.7 + (g.count / 51) * 0.5
            return (
              <span key={g.label} style={{
                fontSize: `${size * 0.75}rem`, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: g.count > 35 ? '#C4547A' : g.count > 20 ? '#B8B0A8' : '#7D746D',
                border: `1px solid ${g.count > 35 ? 'rgba(196,84,122,0.35)' : 'rgba(239,236,230,0.1)'}`,
                padding: '5px 14px', borderRadius: '100px', transition: 'all 0.3s'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,84,122,0.08)'; e.currentTarget.style.color = '#EFECE6' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = g.count > 35 ? '#C4547A' : g.count > 20 ? '#B8B0A8' : '#7D746D' }}
              >
                {g.label} <span style={{ opacity: 0.5 }}>{g.count}</span>
              </span>
            )
          })}
        </div>
      </div>

      {/* ── CIRCLES ── two-column with a large accent bar */}
      <div style={{ padding: '3rem 3rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '1.5rem' }}>
          <span style={{ color: '#C4547A', marginRight: '8px' }}>—</span> Music circles near you
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {circles.map((c, i) => (
            <div key={i}
              onClick={() => navigate('/auth')}
              style={{ background: '#15100E', border: '1px solid rgba(196,84,122,0.12)', borderRadius: '4px', padding: '1.8rem 1.5rem', cursor: 'none', transition: 'border-color 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(196,84,122,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(196,84,122,0.12)'}
            >
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: 'rgba(196,84,122,0.12)', lineHeight: 1, marginBottom: '1rem' }}>0{i + 1}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: '#EFECE6', lineHeight: 1.35, marginBottom: '0.8rem' }}>{c.name}</div>
              <div style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#C4547A', marginBottom: '0.8rem' }}>{c.members} members nearby</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {c.tags.map(t => (
                  <span key={t} style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7D746D', border: '1px solid rgba(239,236,230,0.1)', padding: '2px 7px', borderRadius: '100px' }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '3rem 3rem 8rem', display: 'flex', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 1 }}>
        <button onClick={() => navigate('/auth')} style={{ padding: '14px 32px', background: '#C4547A', color: '#0A0706', border: 'none', borderRadius: '2px', fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'none' }}>
          Join a Music Circle
        </button>
        <span onClick={() => navigate('/')} style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7D746D', cursor: 'none', borderBottom: '1px solid rgba(125,116,109,0.3)' }}
          onMouseEnter={e => e.target.style.color = '#EFECE6'}
          onMouseLeave={e => e.target.style.color = '#7D746D'}
        >← back to discover</span>
      </div>

      {/* Ticker */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '0.6rem 3rem', borderTop: '1px solid rgba(196,84,122,0.1)', background: 'rgba(10,7,6,0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '2.5rem', zIndex: 100 }}>
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#C4547A', flexShrink: 0, animation: 'blink 2s ease-in-out infinite' }} />
        {[['Now spinning', 'Frank Ocean — Nights'], ['Overlap', '89% on Indie & R&B'], ['Location', 'Hyderabad'], ['Status', 'Listening']].map(([label, val]) => (
          <span key={label} style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7D746D', whiteSpace: 'nowrap' }}>
            {label}: <span style={{ color: '#C4547A' }}>{val}</span>
          </span>
        ))}
      </div>

      <div ref={attuneRef} onClick={() => navigate('/auth')}
        onMouseEnter={e => { e.currentTarget.style.background = '#C4547A'; e.currentTarget.style.borderColor = '#C4547A'; e.currentTarget.querySelector('span').style.color = '#0A0706' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(196,84,122,0.4)'; e.currentTarget.querySelector('span').style.color = '#C4547A' }}
        style={{ position: 'fixed', bottom: '3.5rem', right: '3rem', width: '64px', height: '64px', borderRadius: '50%', border: '1px solid rgba(196,84,122,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none', zIndex: 200, transition: 'all 0.4s ease', background: 'transparent' }}>
        <span style={{ fontSize: '7px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4547A', transition: 'color 0.4s ease', textAlign: 'center', lineHeight: 1.4 }}>Join<br />Mello</span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500&display=swap');
        @keyframes pulse { 0%,100% { opacity:0.5; transform:translate(-50%,-50%) scale(1); } 50% { opacity:1; transform:translate(-50%,-50%) scale(1.1); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.2; } }
        body { cursor: none !important; }
      `}</style>
    </div>
  )
}
