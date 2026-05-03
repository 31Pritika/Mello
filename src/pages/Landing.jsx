import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const cursorRef = useRef(null)
  const attuneRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const cursor = cursorRef.current
    const handleMove = e => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top = e.clientY + 'px'
    }
    document.addEventListener('mousemove', handleMove)
    return () => document.removeEventListener('mousemove', handleMove)
  }, [])

  const frames = [
    { image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800', emoji: '🎬', cat: 'Cinema', title: 'Chungking Express', user: 'anika_s', tags: ['Melancholy', '1994', 'Rewatching'] },
    { image: "src/519058854.jpg", cat: 'Music', title: 'Justin Beiber — Company', user: 'prish.a', tags: ['Contemporary', 'R&B', 'Late Night'] },
    { image: "src/a97d6f2b32664f3b6d641a30eda9590a.jpg", emoji: '📚', cat: 'Reads', title: 'Never Let Me Go', user: 'meera.v', tags: ['Dark Academia', 'Quiet Dread'] },
    { image: "src/539d62f4f992649446ec8b5fe0e67944.jpg", emoji: '📺', cat: 'Shows', title: 'Dark — Season 3', user: 'arjun.t', tags: ['Anxiety', 'Obsession', 'Just started'] },
  ]

  const circles = [
    { cat: 'Cinema', name: 'Slow Cinema & World Film', members: 12, tags: ['Tarkovsky', 'Wong Kar-wai', 'Reygadas'] },
    { cat: 'Music', name: 'Indie Folk & Bedroom Pop', members: 18, tags: ['Phoebe Bridgers', 'Rex Orange County'] },
    { cat: 'Reads', name: 'Literary Fiction & Dark Academia', members: 9, tags: ['Ishiguro', 'Donna Tartt', 'Slow reads'] },
  ]

  const steps = [
    { n: '01', title: 'Build your taste profile', desc: 'Pick the movies, music, shows and books that define you. Not what\'s popular — what\'s yours.' },
    { n: '02', title: 'Get matched nearby', desc: 'We find people near you with genuine taste overlap. You see exactly why you matched.' },
    { n: '03', title: 'Join your circle', desc: 'Enter a small curated space with people who just get it. 20–40 people. No noise.' },
    { n: '04', title: 'Drop in, drift freely', desc: 'Share what you\'re watching, reading or listening to. No pressure. No real-time urgency.' },
  ]

  return (
    <div style={{ background: '#0A0706', minHeight: '100vh', color: '#EFECE6', fontFamily: 'Inter, sans-serif', cursor: 'none', overflowX: 'hidden', position: 'relative' }}>

      {/* Custom cursor */}
      <div ref={cursorRef} style={{
        position: 'fixed', width: '20px', height: '20px',
        background: '#C4547A', borderRadius: '50%',
        pointerEvents: 'none', zIndex: 9999,
        filter: 'blur(3px)', mixBlendMode: 'screen',
        transform: 'translate(-50%, -50%)',
        transition: 'width 0.3s ease, height 0.3s ease',
      }} />

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px', height: '800px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,84,122,0.06) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
        animation: 'pulse 6s ease-in-out infinite'
      }} />

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.5rem 3rem',
        borderBottom: '1px solid rgba(196,84,122,0.08)',
        background: 'rgba(10,7,6,0.85)',
        backdropFilter: 'blur(12px)', zIndex: 100
      }}>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#EFECE6', letterSpacing: '-0.5px' }}>mello</div>
          <div style={{ fontSize: '9px', letterSpacing: '0.25em', color: '#7D746D', textTransform: 'uppercase', marginTop: '4px' }}>
            Taste Collective // 17.3850° N, 78.4867° E
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          {['Discover', 'Cinema', 'Music', 'Reads', 'My Circle', 'Profile'].map((item, i) => (
            <span key={item} onClick={() => item === 'My Circle' || item === 'Profile' ? navigate('/auth') : null}
              style={{
                fontSize: '9px', letterSpacing: '0.2em',
                textTransform: 'uppercase', cursor: 'none',
                color: i === 0 ? '#C4547A' : '#7D746D',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={e => e.target.style.color = '#EFECE6'}
              onMouseLeave={e => e.target.style.color = i === 0 ? '#C4547A' : '#7D746D'}
            >{item}</span>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '10rem 3rem 4rem', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7D746D', marginBottom: '2rem' }}>
          Mello — Personal Taste Collective // <span style={{ color: '#C4547A' }}>3 circles active near you</span>
        </div>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
          fontWeight: 400, lineHeight: 1.15,
          color: '#EFECE6', marginBottom: '2rem'
        }}>
          Find people who inhabit the same{' '}
          <em style={{ fontStyle: 'italic', color: '#C4547A' }}>frequencies</em>{' '}
          as you
        </h1>
        <p style={{
          fontSize: '0.82rem', letterSpacing: '0.08em',
          color: '#7D746D', textTransform: 'uppercase',
          maxWidth: '500px', lineHeight: 1.8, marginBottom: '2.5rem'
        }}>
          A quiet corner for niche taste. No algorithms. No noise. Just your people.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/auth')} style={{
            padding: '12px 28px', background: '#C4547A', color: '#0A0706',
            border: 'none', borderRadius: '2px', fontFamily: 'Inter',
            fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'none'
          }}>Join Mello</button>
          <button style={{
            padding: '12px 28px', background: 'transparent', color: '#7D746D',
            border: '1px solid rgba(196,84,122,0.25)', borderRadius: '2px',
            fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.2em',
            textTransform: 'uppercase', cursor: 'none'
          }}>Explore Circles</button>
        </div>
      </section>

      {/* Section label */}
      <div style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7D746D', padding: '0 3rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
        <span style={{ color: '#C4547A', marginRight: '8px' }}>—</span> Recently shared in your circles
      </div>

      {/* Frames grid */}
      <div style={{
        padding: '0 3rem 6rem',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.5rem', position: 'relative', zIndex: 1
      }}>
        {frames.map((f, i) => (
          <div key={i} className={`frame reveal-${i}`} style={{
            borderRadius: '4px', overflow: 'hidden',
            border: '1px solid rgba(196,84,122,0.15)',
            background: '#15100E', position: 'relative',
            marginTop: [0, 100, -40, 60][i] + 'px'
          }}
            onMouseEnter={e => {
              e.currentTarget.querySelector('.fimg').style.cssText += 'filter:grayscale(0%) brightness(0.9) blur(0px);transform:scale(1);'
              e.currentTarget.querySelector('.foverlay').style.cssText += 'opacity:1;transform:translateY(0);'
            }}
            onMouseLeave={e => {
              e.currentTarget.querySelector('.fimg').style.cssText += 'filter:grayscale(50%) brightness(0.6) blur(2px);transform:scale(1.08);'
              e.currentTarget.querySelector('.foverlay').style.cssText += 'opacity:0;transform:translateY(10px);'
            }}
          >
            <div className="fimg" style={{
              width: '100%',
              height: '260px',
              overflow: 'hidden',
              background: '#1C1512',
              filter: 'grayscale(50%) brightness(0.6) blur(2px)',
              transform: 'scale(1.08)',
              transition: 'all 1.2s cubic-bezier(0.25,0.46,0.45,0.94)'
            }}>
              <img
                src={f.image}
                alt={f.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div className="foverlay" style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(10,7,6,0.97) 0%, transparent 100%)',
              padding: '1.5rem 1rem 1rem',
              transform: 'translateY(10px)', opacity: 0,
              transition: 'all 1.2s cubic-bezier(0.25,0.46,0.45,0.94)'
            }}>
              <div style={{ fontSize: '8px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C4547A', marginBottom: '6px' }}>{f.cat}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: '#EFECE6', marginBottom: '6px', lineHeight: 1.4 }}>{f.title}</div>
              <div style={{ fontSize: '8px', letterSpacing: '0.1em', color: '#7D746D', marginBottom: '8px' }}>
                shared by <span style={{ color: '#B8B0A8' }}>{f.user}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {f.tags.map(t => (
                  <span key={t} style={{
                    fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: '#B8B0A8', border: '1px solid rgba(239,236,230,0.15)',
                    padding: '3px 8px', borderRadius: '100px'
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Circles section */}
      <div style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7D746D', padding: '0 3rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
        <span style={{ color: '#C4547A', marginRight: '8px' }}>—</span> Circles near you in Hyderabad
      </div>
      <div style={{ padding: '0 3rem 6rem', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px', border: '1px solid rgba(196,84,122,0.15)',
          borderRadius: '4px', overflow: 'hidden'
        }}>
          {circles.map((c, i) => (
            <div key={i} style={{ background: '#15100E', padding: '1.8rem 1.5rem', transition: 'background 0.4s ease' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1C1512'}
              onMouseLeave={e => e.currentTarget.style.background = '#15100E'}
            >
              <div style={{ width: '32px', height: '2px', background: '#C4547A', marginBottom: '1.2rem' }} />
              <div style={{ fontSize: '8px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C4547A', marginBottom: '8px' }}>{c.cat}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#EFECE6', marginBottom: '8px', lineHeight: 1.3 }}>{c.name}</div>
              <div style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#7D746D' }}>
                <span style={{ color: '#C4547A' }}>{c.members}</span> members nearby
              </div>
              <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {c.tags.map(t => (
                  <span key={t} style={{
                    fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: '#B8B0A8', border: '1px solid rgba(239,236,230,0.15)',
                    padding: '3px 8px', borderRadius: '100px'
                  }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7D746D', padding: '0 3rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
        <span style={{ color: '#C4547A', marginRight: '8px' }}>—</span> How it works
      </div>
      <div style={{ padding: '0 3rem 8rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ padding: '1.5rem 0' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '3rem', fontWeight: 400, color: 'rgba(196,84,122,0.2)', lineHeight: 1, marginBottom: '1rem' }}>{s.n}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: '#EFECE6', marginBottom: '8px' }}>{s.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#7D746D', lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticker */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '0.6rem 3rem',
        borderTop: '1px solid rgba(196,84,122,0.1)',
        background: 'rgba(10,7,6,0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center',
        gap: '2.5rem', zIndex: 100
      }}>
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#C4547A', flexShrink: 0, animation: 'blink 2s ease-in-out infinite' }} />
        {[
          ['Circles active', '3 near you'],
          ['Latest drop', 'anika_s shared Chungking Express'],
          ['Taste match', '87% with dhruvnnd'],
          ['Location', 'Hyderabad'],
          ['Status', 'Drifting'],
        ].map(([label, val]) => (
          <span key={label} style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7D746D', whiteSpace: 'nowrap' }}>
            {label}: <span style={{ color: '#C4547A' }}>{val}</span>
          </span>
        ))}
      </div>

      {/* Join Mello button */}
      <div ref={attuneRef}
        onClick={() => navigate('/auth')}
        onMouseEnter={e => { e.currentTarget.style.background = '#C4547A'; e.currentTarget.style.borderColor = '#C4547A'; e.currentTarget.querySelector('span').style.color = '#0A0706' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(196,84,122,0.4)'; e.currentTarget.querySelector('span').style.color = '#C4547A' }}
        style={{
          position: 'fixed', bottom: '3.5rem', right: '3rem',
          width: '64px', height: '64px', borderRadius: '50%',
          border: '1px solid rgba(196,84,122,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'none', zIndex: 200, transition: 'all 0.4s ease', background: 'transparent'
        }}>
        <span style={{ fontSize: '7px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4547A', transition: 'color 0.4s ease', textAlign: 'center', lineHeight: 1.4 }}>Join<br />Mello</span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500&display=swap');
        @keyframes pulse {
          0%,100% { opacity:0.5; transform:translate(-50%,-50%) scale(1); }
          50% { opacity:1; transform:translate(-50%,-50%) scale(1.1); }
        }
        @keyframes blink {
          0%,100% { opacity:1; } 50% { opacity:0.2; }
        }
        body { cursor: none !important; }
      `}</style>
    </div>
  )
}