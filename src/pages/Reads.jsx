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

const passages = [
  {
    text: '"Memory, I realize, can be an unreliable thing; often it is heavily coloured by the circumstances in which one remembers."',
    source: 'The Remains of the Day',
    author: 'Kazuo Ishiguro',
    shared: 'meera.v',
  },
  {
    text: '"Does the walker choose the path, or the path the walker?"',
    source: 'The Secret History',
    author: 'Donna Tartt',
    shared: 'ayaan_s',
  },
  {
    text: '"If you only read the books that everyone else is reading, you can only think what everyone else is thinking."',
    source: 'Norwegian Wood',
    author: 'Haruki Murakami',
    shared: 'sana.r',
  },
]

const shelf = [
  { title: 'Never Let Me Go', author: 'Kazuo Ishiguro', year: '2005', readers: 9 },
  { title: 'The Secret History', author: 'Donna Tartt', year: '1992', readers: 14 },
  { title: 'Norwegian Wood', author: 'Haruki Murakami', year: '1987', readers: 11 },
  { title: 'Bluets', author: 'Maggie Nelson', year: '2009', readers: 7 },
  { title: 'Piranesi', author: 'Susanna Clarke', year: '2020', readers: 16 },
  { title: 'The Dispossessed', author: 'Ursula K. Le Guin', year: '1974', readers: 8 },
  { title: 'Giovanni\'s Room', author: 'James Baldwin', year: '1956', readers: 12 },
]

const circles = [
  { name: 'Literary Fiction & Dark Academia', members: 9, tags: ['Ishiguro', 'Donna Tartt', 'Slow reads'] },
  { name: 'Translated Lit & Magical Realism', members: 16, tags: ['Murakami', 'Borges', 'Lispector'] },
  { name: 'Essays, Philosophy & Quiet Non-Fiction', members: 11, tags: ['Joan Didion', 'Maggie Nelson'] },
]

export default function Reads() {
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
          <div style={{ fontSize: '9px', letterSpacing: '0.25em', color: '#7D746D', textTransform: 'uppercase', marginTop: '4px' }}>Literary Frequency</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          {Object.entries(NAV_ROUTES).map(([label, path]) => {
            const isActive = label === 'Reads'
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

      {/* ── OPENING QUOTE HERO ── not a full-bleed image, just text + texture */}
      <section style={{ padding: '11rem 3rem 5rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '6rem', alignItems: 'start', position: 'relative', zIndex: 1 }}>
        {/* Left: featured passage */}
        <div>
          <div style={{ fontSize: '8px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C4547A', marginBottom: '2rem' }}>
            Mello Reads — Hyderabad // 3 literary circles active
          </div>
          <blockquote style={{ margin: 0, borderLeft: '2px solid rgba(196,84,122,0.35)', paddingLeft: '2rem', marginBottom: '2rem' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 400, lineHeight: 1.55, color: '#EFECE6', fontStyle: 'italic', margin: 0 }}>
              "The slowly dying books we love, the underlined sentences, the dog-eared corners — these are not
              {' '}<span style={{ color: '#C4547A' }}>relics</span>. They are evidence."
            </p>
            <footer style={{ marginTop: '1.2rem', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7D746D' }}>
              — mello reads, 2024
            </footer>
          </blockquote>
          <p style={{ fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7D746D', lineHeight: 1.9, maxWidth: '480px' }}>
            Literary fiction, dark academia, and annotated paperbacks. Find the readers in your city who pause at the same sentences you do.
          </p>
        </div>
        {/* Right: reading stats block */}
        <div style={{ border: '1px solid rgba(196,84,122,0.12)', borderRadius: '4px', padding: '2rem', background: '#15100E' }}>
          <div style={{ fontSize: '8px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '1.5rem' }}>Currently circling</div>
          {[
            ['Books in circulation', '7'],
            ['Active readers nearby', '36'],
            ['Passages shared this week', '14'],
            ['Circles', '3'],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.7rem 0', borderBottom: '1px solid rgba(196,84,122,0.07)' }}>
              <span style={{ fontSize: '9px', letterSpacing: '0.08em', color: '#7D746D' }}>{label}</span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#C4547A' }}>{val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PASSAGES — shared excerpts from circle members */}
      <div style={{ padding: '0 3rem 3rem', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '2rem' }}>
          <span style={{ color: '#C4547A', marginRight: '8px' }}>—</span> Passages circling this week
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {passages.map((p, i) => (
            <div key={i} style={{ padding: '2rem 0', borderBottom: '1px solid rgba(196,84,122,0.08)', display: 'grid', gridTemplateColumns: '1fr 200px', gap: '3rem', alignItems: 'start' }}>
              <blockquote style={{ margin: 0 }}>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', lineHeight: 1.7, color: '#EFECE6', fontStyle: 'italic', margin: 0 }}>{p.text}</p>
              </blockquote>
              <div style={{ paddingTop: '4px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#C4547A', marginBottom: '4px' }}>{p.source}</div>
                <div style={{ fontSize: '9px', letterSpacing: '0.08em', color: '#7D746D', marginBottom: '8px' }}>{p.author}</div>
                <div style={{ fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(125,116,109,0.5)' }}>shared by {p.shared}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOOKSHELF — horizontal scroll of titles */}
      <div style={{ padding: '2rem 3rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '1.5rem' }}>
          <span style={{ color: '#C4547A', marginRight: '8px' }}>—</span> On the shelf
        </div>
        <div style={{ display: 'flex', gap: '1px', border: '1px solid rgba(196,84,122,0.12)', borderRadius: '4px', overflow: 'hidden' }}>
          {shelf.map((b, i) => (
            <div key={i}
              style={{ flex: 1, background: i % 2 === 0 ? '#15100E' : '#120D0B', padding: '1.5rem 1rem', minWidth: 0, transition: 'background 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1C1512'}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#15100E' : '#120D0B'}
            >
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.85rem', color: '#EFECE6', lineHeight: 1.35, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
              <div style={{ fontSize: '8px', letterSpacing: '0.08em', color: '#7D746D', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.author}</div>
              <div style={{ fontSize: '8px', letterSpacing: '0.12em', color: 'rgba(196,84,122,0.6)' }}>{b.year}</div>
              <div style={{ marginTop: '12px', fontSize: '8px', letterSpacing: '0.1em', color: '#C4547A' }}>{b.readers} reading</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CIRCLES ── stacked rows like a reading list, not tiles */}
      <div style={{ padding: '3rem 3rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '1.5rem' }}>
          <span style={{ color: '#C4547A', marginRight: '8px' }}>—</span> Reading circles near you
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {circles.map((c, i) => (
            <div key={i}
              onClick={() => navigate('/auth')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.6rem 2rem', background: '#15100E', border: '1px solid rgba(196,84,122,0.1)', borderRadius: i === 0 ? '4px 4px 0 0' : i === circles.length - 1 ? '0 0 4px 4px' : 0, cursor: 'none', transition: 'background 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1C1512'}
              onMouseLeave={e => e.currentTarget.style.background = '#15100E'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.6rem', color: 'rgba(196,84,122,0.3)', minWidth: '20px' }}>0{i + 1}</div>
                <div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: '#EFECE6', marginBottom: '4px' }}>{c.name}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {c.tags.map(t => (
                      <span key={t} style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7D746D', border: '1px solid rgba(239,236,230,0.1)', padding: '2px 7px', borderRadius: '100px' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '9px', color: '#C4547A', marginBottom: '3px' }}>{c.members} nearby</div>
                <div style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(125,116,109,0.4)' }}>Join →</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '3rem 3rem 8rem', display: 'flex', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 1 }}>
        <button onClick={() => navigate('/auth')} style={{ padding: '14px 32px', background: '#C4547A', color: '#0A0706', border: 'none', borderRadius: '2px', fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'none' }}>
          Join a Reading Circle
        </button>
        <span onClick={() => navigate('/')} style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7D746D', cursor: 'none', borderBottom: '1px solid rgba(125,116,109,0.3)' }}
          onMouseEnter={e => e.target.style.color = '#EFECE6'}
          onMouseLeave={e => e.target.style.color = '#7D746D'}
        >← back to discover</span>
      </div>

      {/* Ticker */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '0.6rem 3rem', borderTop: '1px solid rgba(196,84,122,0.1)', background: 'rgba(10,7,6,0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '2.5rem', zIndex: 100 }}>
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#C4547A', flexShrink: 0, animation: 'blink 2s ease-in-out infinite' }} />
        {[['Now reading', 'meera.v — Never Let Me Go'], ['Match', '93% on Ishiguro & Tartt'], ['Location', 'Hyderabad'], ['Status', 'Annotating']].map(([label, val]) => (
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
