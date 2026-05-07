import { useEffect, useState, useRef } from 'react'
import { supabase } from '../SupabaseClient'
import { assignToCircles, getUserCircles, getCirclePosts, createPost, renameCircle } from '../utils/matching'
import { useNavigate } from 'react-router-dom'

const CATS = {
  movies: { emoji: '🎬', accent: '#E0A458', label: 'Cinema' },
  shows:  { emoji: '📺', accent: '#7B9E87', label: 'Shows'  },
  music:  { emoji: '🎵', accent: '#C4547A', label: 'Music'  },
  books:  { emoji: '📚', accent: '#9A8C98', label: 'Books'  },
}

// ─── tiny helpers ─────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Avatar({ name, accent, size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${accent}25`,
      border: `1px solid ${accent}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, color: accent, fontWeight: 600,
      flexShrink: 0,
    }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

// ─── Sidebar circle item ───────────────────────────────────────────────────────
function CircleItem({ circle, isActive, onClick }) {
  const cat = CATS[circle.category] || { emoji: '✦', accent: '#C4547A', label: circle.category }
  const displayName = circle.name || cat.label
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 14px',
        borderRadius: '3px',
        cursor: 'pointer',
        background: isActive ? `${cat.accent}14` : 'transparent',
        border: `1px solid ${isActive ? cat.accent + '40' : 'transparent'}`,
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(196,84,122,0.05)' }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      {isActive && (
        <div style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: '2px', borderRadius: '1px',
          background: cat.accent,
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1rem' }}>{cat.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.82rem',
            color: isActive ? cat.accent : '#EFECE6',
            fontWeight: isActive ? 500 : 400,
            marginBottom: '2px',
          }}>
            {displayName}
          </div>
          <div style={{
            fontSize: '9px', letterSpacing: '0.08em',
            color: '#7D746D', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span>{circle.city?.split(',')[0]}</span>
            <span style={{ color: `${cat.accent}88` }}>·</span>
            <span style={{ color: isActive ? `${cat.accent}99` : '#5A5450' }}>
              {circle.member_count || 0} members
            </span>
          </div>
        </div>
      </div>

      {circle.memberNames?.length > 0 && (
        <div style={{ display: 'flex', marginTop: '8px', paddingLeft: '28px' }}>
          {circle.memberNames.slice(0, 4).map((name, i) => (
            <div key={i} style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: `${cat.accent}20`, border: `1px solid ${cat.accent}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '8px', color: cat.accent,
              marginLeft: i > 0 ? '-5px' : 0, zIndex: 4 - i,
            }}>
              {name[0].toUpperCase()}
            </div>
          ))}
          {circle.memberNames.length > 4 && (
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: 'rgba(196,84,122,0.1)', border: '1px solid rgba(196,84,122,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '7px', color: '#7D746D', marginLeft: '-5px',
            }}>+{circle.memberNames.length - 4}</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post, accent, currentUserId }) {
  const isOwn = post.user_id === currentUserId
  return (
    <div style={{
      padding: '1.4rem 0',
      borderBottom: '1px solid rgba(196,84,122,0.07)',
      animation: 'fadeSlideIn 0.35s ease forwards',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <Avatar name={post.profiles?.name} accent={accent} size={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: '#B8B0A8', fontWeight: 500 }}>
              {post.profiles?.name || 'Anonymous'}
            </span>
            {isOwn && (
              <span style={{
                fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: accent, background: `${accent}15`,
                border: `1px solid ${accent}30`,
                padding: '1px 6px', borderRadius: '100px',
              }}>you</span>
            )}
            <span style={{
              fontSize: '9px', color: '#4A4440',
              marginLeft: 'auto', letterSpacing: '0.04em',
            }}>
              {timeAgo(post.created_at)}
            </span>
          </div>
          <div style={{
            fontSize: '0.9rem', color: '#D8D0C8', lineHeight: 1.75,
            wordBreak: 'break-word',
          }}>
            {post.content}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Empty circles state ───────────────────────────────────────────────────────
function WaitingState() {
  return (
    <div style={{ paddingTop: '5rem', textAlign: 'center', maxWidth: '340px', margin: '0 auto' }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        border: '1px solid rgba(196,84,122,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.5rem', fontSize: '1.5rem',
        animation: 'pulse 3s ease-in-out infinite',
      }}>✦</div>
      <div style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: '1.3rem', color: '#EFECE6',
        marginBottom: '0.8rem', fontStyle: 'italic',
      }}>
        Your circles are forming
      </div>
      <div style={{ fontSize: '0.82rem', color: '#7D746D', lineHeight: 1.75 }}>
        As more people with your taste join in your city, you'll be placed into circles automatically. Check back soon.
      </div>
    </div>
  )
}

// ─── Pencil icon ───────────────────────────────────────────────────────────────
function PencilIcon({ color = '#5A5450' }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [user, setUser]               = useState(null)
  const [circles, setCircles]         = useState([])
  const [activeCircle, setActiveCircle] = useState(null)
  const [posts, setPosts]             = useState([])
  const [newPost, setNewPost]         = useState('')
  const [loading, setLoading]         = useState(true)
  const [posting, setPosting]         = useState(false)
  const [postsLoading, setPostsLoading] = useState(false)

  // ── rename state ─────────────────────────────────────────────────────────────
  const [isRenaming, setIsRenaming]   = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [renaming, setRenaming]       = useState(false)
  const renameInputRef                = useRef(null)

  const textareaRef = useRef(null)
  const feedRef     = useRef(null)
  const navigate    = useNavigate()

  // ── init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/auth'); return }
      setUser(user)

      await assignToCircles(user.id)

      const userCircles = await getUserCircles(user.id)
      setCircles(userCircles)

      if (userCircles.length > 0) {
        setActiveCircle(userCircles[0])
        await loadPosts(userCircles[0].id)
      }

      setLoading(false)
    }
    init()
  }, [])

  // ── focus rename input when it opens ────────────────────────────────────────
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [isRenaming])

  // ── auto-resize textarea ────────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [newPost])

  // ── load posts ──────────────────────────────────────────────────────────────
  async function loadPosts(circleId) {
    setPostsLoading(true)
    const data = await getCirclePosts(circleId, 30)
    setPosts(data)
    setPostsLoading(false)
  }

  // ── switch circle ───────────────────────────────────────────────────────────
  async function switchCircle(circle) {
    setActiveCircle(circle)
    setIsRenaming(false)
    setPosts([])
    await loadPosts(circle.id)
    feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── rename handlers ──────────────────────────────────────────────────────────
  function startRename() {
    const cat = CATS[activeCircle.category] || { label: activeCircle.category }
    setRenameValue(activeCircle.name || cat.label)
    setIsRenaming(true)
  }

  async function commitRename() {
    const trimmed = renameValue.trim()
    if (!trimmed || renaming) return
    setRenaming(true)
    try {
      await renameCircle(activeCircle.id, trimmed)
      // Update local state so both header + sidebar reflect the new name instantly
      const updated = { ...activeCircle, name: trimmed }
      setActiveCircle(updated)
      setCircles(prev => prev.map(c => c.id === activeCircle.id ? updated : c))
    } catch (e) {
      console.error('Rename failed:', e)
    }
    setRenaming(false)
    setIsRenaming(false)
  }

  function handleRenameKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); commitRename() }
    if (e.key === 'Escape') { setIsRenaming(false) }
  }

  // ── submit post ─────────────────────────────────────────────────────────────
  async function submitPost() {
    if (!newPost.trim() || !activeCircle || posting) return
    setPosting(true)
    try {
      const post = await createPost(activeCircle.id, user.id, newPost)
      setPosts(prev => [post, ...prev])
      setNewPost('')
    } catch (e) {
      console.error('Post failed:', e)
    }
    setPosting(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitPost()
  }

  async function logout() {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  const cat = activeCircle
    ? (CATS[activeCircle.category] || { emoji: '✦', accent: '#C4547A', label: activeCircle.category })
    : null

  const circleDisplayName = activeCircle
    ? (activeCircle.name || (cat?.label ?? activeCircle.category))
    : ''

  // ── loading screen ──────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0A0706',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Playfair Display, serif',
    }}>
      <div style={{
        fontSize: '1.3rem', color: '#EFECE6', fontStyle: 'italic',
        animation: 'pulse 2s ease-in-out infinite',
      }}>Tuning in...</div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
    </div>
  )

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: '#0A0706',
      fontFamily: 'Inter, sans-serif', color: '#EFECE6',
    }}>

      {/* ── Nav ── */}
      <nav style={{
        padding: '0 2.5rem',
        height: '56px',
        borderBottom: '1px solid rgba(196,84,122,0.1)',
        background: 'rgba(10,7,6,0.92)',
        backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.25rem', color: '#EFECE6',
          }}>mello</div>
          <div style={{ width: '1px', height: '14px', background: 'rgba(196,84,122,0.2)' }} />
          <div style={{
            fontSize: '9px', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#5A5450',
          }}>
            {circles.length} circle{circles.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{
            fontSize: '9px', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#5A5450',
          }}>
            {user?.email?.split('@')[0]}
          </span>
          <span
            onClick={logout}
            style={{
              fontSize: '9px', letterSpacing: '0.2em',
              textTransform: 'uppercase', color: '#5A5450',
              cursor: 'pointer', transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => e.target.style.color = '#C4547A'}
            onMouseLeave={e => e.target.style.color = '#5A5450'}
          >Sign out</span>
        </div>
      </nav>

      {/* ── Layout ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '256px 1fr',
        minHeight: 'calc(100vh - 56px)',
      }}>

        {/* ── Sidebar ── */}
        <aside style={{
          borderRight: '1px solid rgba(196,84,122,0.08)',
          padding: '1.8rem 1rem',
          position: 'sticky', top: '56px',
          height: 'calc(100vh - 56px)',
          overflowY: 'auto',
        }}>
          <div style={{
            fontSize: '9px', letterSpacing: '0.25em',
            textTransform: 'uppercase', color: '#5A5450',
            marginBottom: '1rem', paddingLeft: '14px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ color: '#C4547A' }}>—</span> Your Circles
          </div>

          {circles.length === 0 ? (
            <div style={{
              fontSize: '0.8rem', color: '#5A5450',
              lineHeight: 1.75, padding: '0 14px',
            }}>
              No circles yet. You'll be matched once more people join in your city.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {circles.map(c => (
                <CircleItem
                  key={c.id}
                  circle={c}
                  isActive={activeCircle?.id === c.id}
                  onClick={() => switchCircle(c)}
                />
              ))}
            </div>
          )}

          {circles.length > 0 && (
            <div style={{
              marginTop: '2.5rem', paddingLeft: '14px',
              borderTop: '1px solid rgba(196,84,122,0.06)',
              paddingTop: '1.5rem',
            }}>
              <div style={{
                fontSize: '9px', letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#3A3430',
                marginBottom: '10px',
              }}>How circles work</div>
              {[
                'Auto-formed by taste + city',
                'Up to 30 people per circle',
                'Only members can post & read',
              ].map((t, i) => (
                <div key={i} style={{
                  fontSize: '0.75rem', color: '#4A4440',
                  lineHeight: 1.65, marginBottom: '4px',
                  paddingLeft: '10px', borderLeft: '1px solid rgba(196,84,122,0.12)',
                }}>{t}</div>
              ))}
            </div>
          )}
        </aside>

        {/* ── Main Feed ── */}
        <main ref={feedRef} style={{ padding: '2rem 3rem', maxWidth: '720px' }}>

          {!activeCircle ? <WaitingState /> : (
            <>
              {/* ── Circle Header ── */}
              <div style={{
                marginBottom: '2rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid rgba(196,84,122,0.08)',
              }}>
                <div style={{
                  fontSize: '9px', letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: cat.accent, marginBottom: '8px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span>{cat.emoji}</span>
                  <span>{cat.label} circle</span>
                  <span style={{ color: 'rgba(196,84,122,0.2)' }}>·</span>
                  <span style={{ color: '#4A4440' }}>{activeCircle.city?.split(',')[0]}</span>
                </div>

                {/* ── Circle name + rename ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  {isRenaming ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={handleRenameKeyDown}
                        onBlur={commitRename}
                        maxLength={40}
                        style={{
                          fontFamily: 'Playfair Display, serif',
                          fontSize: '1.4rem', color: '#EFECE6',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: `1px solid ${cat.accent}60`,
                          outline: 'none',
                          padding: '0 0 2px 0',
                          width: '100%', maxWidth: '320px',
                        }}
                      />
                      <span style={{
                        fontSize: '9px', color: '#4A4440',
                        letterSpacing: '0.08em', whiteSpace: 'nowrap',
                      }}>
                        {renaming ? 'saving...' : 'enter to save · esc to cancel'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '1.4rem', color: '#EFECE6',
                      }}>
                        {circleDisplayName}
                      </div>
                      <button
                        onClick={startRename}
                        title="Rename this circle"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '4px',
                          cursor: 'pointer',
                          borderRadius: '3px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0.4,
                          transition: 'opacity 0.2s ease, background 0.2s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = `${cat.accent}15` }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; e.currentTarget.style.background = 'transparent' }}
                      >
                        <PencilIcon color={cat.accent} />
                      </button>
                    </>
                  )}
                </div>

                {/* member strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex' }}>
                    {(activeCircle.memberNames || []).slice(0, 6).map((name, i) => (
                      <div key={i} style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: `${cat.accent}18`,
                        border: `1.5px solid #0A0706`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '9px', color: cat.accent,
                        marginLeft: i > 0 ? '-8px' : 0,
                        zIndex: 10 - i,
                      }}>
                        {name[0].toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#5A5450' }}>
                    {activeCircle.member_count || 0} member{activeCircle.member_count !== 1 ? 's' : ''} in this circle
                  </span>
                  <div style={{
                    marginLeft: 'auto',
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#4A9E6A',
                    boxShadow: '0 0 6px rgba(74,158,106,0.5)',
                    animation: 'blink 3s ease-in-out infinite',
                  }} />
                </div>
              </div>

              {/* ── Compose ── */}
              <div style={{
                marginBottom: '2rem',
                background: '#12100E',
                border: '1px solid rgba(196,84,122,0.12)',
                borderRadius: '4px',
                padding: '1.2rem',
                transition: 'border-color 0.2s ease',
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Avatar name={user?.email} accent={cat.accent} size={28} />
                  <div style={{ flex: 1 }}>
                    <textarea
                      ref={textareaRef}
                      placeholder="Drop a thought, a rec, a reaction... no pressure."
                      value={newPost}
                      onChange={e => setNewPost(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={2}
                      style={{
                        width: '100%', background: 'transparent',
                        border: 'none', color: '#EFECE6',
                        fontFamily: 'Inter', fontSize: '0.88rem',
                        outline: 'none', resize: 'none',
                        lineHeight: 1.7, overflow: 'hidden',
                        minHeight: '52px',
                      }}
                    />
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginTop: '8px',
                    }}>
                      <span style={{
                        fontSize: '9px', letterSpacing: '0.1em', color: '#3A3430',
                      }}>⌘ + Enter to post</span>
                      <button
                        onClick={submitPost}
                        disabled={!newPost.trim() || posting}
                        style={{
                          padding: '7px 18px',
                          background: newPost.trim() ? cat.accent : 'rgba(196,84,122,0.06)',
                          color: newPost.trim() ? '#0A0706' : '#3A3430',
                          border: 'none', borderRadius: '2px',
                          fontFamily: 'Inter', fontSize: '9px',
                          letterSpacing: '0.2em', textTransform: 'uppercase',
                          cursor: newPost.trim() ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s ease',
                          fontWeight: 500,
                        }}
                      >
                        {posting ? '...' : 'Drop it →'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Posts Feed ── */}
              {postsLoading ? (
                <div style={{
                  fontSize: '9px', letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: '#3A3430',
                  paddingTop: '1rem',
                }}>Loading posts...</div>
              ) : posts.length === 0 ? (
                <div style={{ paddingTop: '2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.8rem', opacity: 0.3 }}>{cat.emoji}</div>
                  <div style={{ fontSize: '0.82rem', color: '#4A4440', fontStyle: 'italic' }}>
                    Nothing here yet. Be the first to drop something.
                  </div>
                </div>
              ) : (
                <div>
                  {posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      accent={cat.accent}
                      currentUserId={user?.id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500&family=Inter:wght@300;400;500&display=swap');
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateY(6px) }
          to   { opacity:1; transform:translateY(0) }
        }
        textarea { cursor: text !important; }
        aside::-webkit-scrollbar { width:3px }
        aside::-webkit-scrollbar-track { background: transparent }
        aside::-webkit-scrollbar-thumb { background: rgba(196,84,122,0.15); border-radius:2px }
      `}</style>
    </div>
  )
}