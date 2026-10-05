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

const films = [
  { title: 'Chungking Express', year: '1994', dir: 'Wong Kar-wai', mood: 'Yearning, Neon, Transience', shared: 14 },
  { title: 'Portrait of a Lady on Fire', year: '2019', dir: 'Céline Sciamma', mood: 'Gaze, Silence, Memory', shared: 9 },
  { title: 'Decision to Leave', year: '2022', dir: 'Park Chan-wook', mood: 'Obsession, Blue, Vertigo', shared: 11 },
  { title: 'Aftersun', year: '2022', dir: 'Charlotte Wells', mood: 'Loss, Super-8, Dread', shared: 17 },
  { title: 'In the Mood for Love', year: '2000', dir: 'Wong Kar-wai', mood: 'Longing, Slow Motion, Cheongsam', shared: 21 },
  { title: 'The Zone of Interest', year: '2023', dir: 'Jonathan Glazer', mood: 'Banality, Horror, Quiet', shared: 8 },
]

const circles = [
  { name: 'Slow Cinema & World Film', cat: 'Cinema', members: 12, tags: ['Tarkovsky', 'Kiarostami', 'Akerman'], path: '/auth' },
  { name: 'Midnight Thrillers & Neo-Noir', cat: 'Cinema', members: 19, tags: ['Park Chan-wook', 'Fincher'], path: '/auth' },
  { name: 'Quiet Indie & Coming-of-Age', cat: 'Cinema', members: 15, tags: ['Charlotte Wells', 'Kore-eda'], path: '/auth' },
]

export default function Cinema() {
  const attuneRef = useRef(null)
  const navigate = useNavigate()

  return (
    <div style={{ background: '#0A0706', minHeight: '100vh', color: '#EFECE6', fontFamily: 'Inter, sans-serif', cursor: 'none', overflowX: 'hidden' }}>
      <CustomCursor />

      {/* Fixed ambient */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,84,122,0.05) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0, animation: 'pulse 6s ease-in-out infinite' }} />

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 3rem', borderBottom: '1px solid rgba(196,84,122,0.08)', background: 'rgba(10,7,6,0.9)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'none' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#EFECE6', letterSpacing: '-0.5px' }}>mello</div>
          <div style={{ fontSize: '9px', letterSpacing: '0.25em', color: '#7D746D', textTransform: 'uppercase', marginTop: '4px' }}>Cinema Frequency</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          {Object.entries(NAV_ROUTES).map(([label, path]) => {
            const isActive = label === 'Cinema'
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

      {/* ── EDITORIAL HERO ── full-width with overlaid text, no button row */}
      <div style={{ position: 'relative', height: '85vh', overflow: 'hidden', marginTop: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1400"
          alt="Cinema"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(60%) brightness(0.35)', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,7,6,0.3) 0%, rgba(10,7,6,0.75) 60%, #0A0706 100%)' }} />
        <div style={{ position: 'absolute', bottom: '4rem', left: '3rem', right: '3rem' }}>
          <div style={{ fontSize: '8px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C4547A', marginBottom: '1.2rem' }}>
            Mello Cinema — Hyderabad // 3 circles active
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 400, lineHeight: 1.05, color: '#EFECE6', margin: '0 0 1.5rem', maxWidth: '700px' }}>
            The frames<br />
            that <em style={{ fontStyle: 'italic', color: '#C4547A' }}>haunt</em> you
          </h1>
          <p style={{ fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7D746D', maxWidth: '420px', lineHeight: 1.9 }}>
            World cinema, slow-burn thrillers, and midnight rewatches — shared with people in your city who notice the same shots.
          </p>
        </div>
        {/* film counter */}
        <div style={{ position: 'absolute', top: '50%', right: '3rem', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '4rem', color: 'rgba(196,84,122,0.15)', lineHeight: 1 }}>6</div>
          <div style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7D746D' }}>films in circle</div>
        </div>
      </div>

      {/* ── FILM LOG ── editorial table/list layout, not cards */}
      <div style={{ padding: '5rem 3rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '1px solid rgba(196,84,122,0.12)', paddingBottom: '1rem' }}>
          <div style={{ fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7D746D' }}>
            <span style={{ color: '#C4547A', marginRight: '8px' }}>—</span> Circle film log
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 160px 80px', gap: '0 3rem', width: '65%' }}>
            {['Title & Director', 'Year', 'Circle Mood', 'Watching'].map(h => (
              <div key={h} style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(125,116,109,0.5)', textAlign: h === 'Watching' ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>
        </div>
        {films.map((f, i) => (
          <div key={i}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 0', borderBottom: '1px solid rgba(196,84,122,0.07)', transition: 'background 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(196,84,122,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#EFECE6', letterSpacing: '-0.2px', width: '35%' }}>
              {f.title}
              <span style={{ display: 'block', fontSize: '9px', letterSpacing: '0.1em', color: '#7D746D', fontFamily: 'Inter', marginTop: '3px' }}>{f.dir}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 160px 80px', gap: '0 3rem', width: '65%' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: '#7D746D' }}>{f.year}</div>
              <div style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#B8B0A8' }}>{f.mood}</div>
              <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: '#C4547A', textAlign: 'right' }}>{f.shared} people</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CIRCLES ── horizontal strip, not a 3-column grid */}
      <div style={{ padding: '4rem 3rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '2rem' }}>
          <span style={{ color: '#C4547A', marginRight: '8px' }}>—</span> Film circles near you
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid rgba(196,84,122,0.12)', borderRadius: '4px', overflow: 'hidden' }}>
          {circles.map((c, i) => (
            <div key={i}
              onClick={() => navigate(c.path)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.4rem 1.8rem', background: '#15100E', transition: 'background 0.3s', cursor: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1C1512'}
              onMouseLeave={e => e.currentTarget.style.background = '#15100E'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.6rem', color: 'rgba(196,84,122,0.3)' }}>0{i + 1}</div>
                <div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: '#EFECE6', marginBottom: '4px' }}>{c.name}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {c.tags.map(t => (
                      <span key={t} style={{ fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7D746D', border: '1px solid rgba(239,236,230,0.1)', padding: '2px 7px', borderRadius: '100px' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: '#C4547A' }}>{c.members} nearby</div>
                <div style={{ fontSize: '8px', letterSpacing: '0.1em', color: 'rgba(125,116,109,0.5)', marginTop: '3px', textTransform: 'uppercase' }}>Join →</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA strip ── */}
      <div style={{ padding: '3rem 3rem 8rem', display: 'flex', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 1 }}>
        <button onClick={() => navigate('/auth')} style={{ padding: '14px 32px', background: '#C4547A', color: '#0A0706', border: 'none', borderRadius: '2px', fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'none' }}>
          Join a Cinema Circle
        </button>
        <span style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7D746D' }}>or</span>
        <span onClick={() => navigate('/')} style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7D746D', cursor: 'none', borderBottom: '1px solid rgba(125,116,109,0.3)' }}
          onMouseEnter={e => e.target.style.color = '#EFECE6'}
          onMouseLeave={e => e.target.style.color = '#7D746D'}
        >← back to discover</span>
      </div>

      {/* Ticker */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '0.6rem 3rem', borderTop: '1px solid rgba(196,84,122,0.1)', background: 'rgba(10,7,6,0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '2.5rem', zIndex: 100 }}>
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#C4547A', flexShrink: 0, animation: 'blink 2s ease-in-out infinite' }} />
        {[['Frequency', 'Cinema'], ['Now discussing', 'Aftersun — the pool scene'], ['Overlap', '91% on Wong Kar-wai'], ['Location', 'Hyderabad']].map(([label, val]) => (
          <span key={label} style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7D746D', whiteSpace: 'nowrap' }}>
            {label}: <span style={{ color: '#C4547A' }}>{val}</span>
          </span>
        ))}
      </div>

      {/* Join button */}
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
