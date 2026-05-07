// utils/matching.js
// Circle formation logic for Mello
// Circles are auto-formed per category + city, capped at 30 members each.
// A user is placed into one circle per category they have interests in.

import { supabase } from '../SupabaseClient'

const CIRCLE_MAX = 30   // max members per circle
const CIRCLE_MIN = 3    // min members before a circle is "active"

/**
 * Main entry point. Called on every dashboard load for a user.
 * Idempotent — safe to call multiple times.
 */
export async function assignToCircles(userId) {
  // 1. Get user's city
  const { data: profile } = await supabase
    .from('profiles')
    .select('city')
    .eq('id', userId)
    .single()

  if (!profile?.city) return

  // 2. Get distinct categories the user has interests in
  const { data: interests } = await supabase
    .from('interests')
    .select('category')
    .eq('user_id', userId)

  if (!interests || interests.length === 0) return

  const categories = [...new Set(interests.map(i => i.category))]

  // 3. For each category, ensure user is in exactly one circle
  for (const category of categories) {
    await ensureUserInCircle(userId, profile.city, category)
  }
}

/**
 * Finds or creates a circle for a user in a given city + category.
 * Priority: join an existing circle with room → create new one.
 */
async function ensureUserInCircle(userId, city, category) {
  // Check if user is already in a circle for this category + city
  const { data: existing } = await supabase
    .from('circle_members')
    .select('circle_id, circles(city, category)')
    .eq('user_id', userId)

  const alreadyIn = existing?.find(
    m => m.circles?.city === city && m.circles?.category === category
  )
  if (alreadyIn) return // already placed, nothing to do

  // Find circles in this city + category that have room
  const { data: circles } = await supabase
    .from('circles')
    .select('id, member_count')
    .eq('city', city)
    .eq('category', category)
    .lt('member_count', CIRCLE_MAX)
    .order('member_count', { ascending: false }) // prefer filling circles
    .limit(1)

  let circleId

  if (circles && circles.length > 0) {
    // Join existing circle
    circleId = circles[0].id
  } else {
    // Create a new circle
    const { data: newCircle } = await supabase
      .from('circles')
      .insert({ city, category, member_count: 0 })
      .select('id')
      .single()

    if (!newCircle) return
    circleId = newCircle.id
  }

  // Add user to circle
  await supabase.from('circle_members').insert({
    circle_id: circleId,
    user_id: userId
  })

  // Increment member_count
  await supabase.rpc('increment_circle_count', { circle_id: circleId })
}

/**
 * Returns enriched circle data for a user with member count + sample members.
 */
export async function getUserCircles(userId) {
  const { data } = await supabase
    .from('circle_members')
    .select(`
      circle_id,
      circles (
        id,
        category,
        city,
        member_count,
        created_at
      )
    `)
    .eq('user_id', userId)

  if (!data) return []

  const circles = data.map(d => d.circles).filter(Boolean)

  // For each circle, get a few member names for the "who's here" preview
  const enriched = await Promise.all(
    circles.map(async (circle) => {
      const { data: members } = await supabase
        .from('circle_members')
        .select('profiles(name)')
        .eq('circle_id', circle.id)
        .limit(5)

      const memberNames = members
        ?.map(m => m.profiles?.name)
        .filter(Boolean) || []

      return { ...circle, memberNames }
    })
  )

  return enriched
}

/**
 * Returns posts for a circle with author info, reactions count.
 */
export async function getCirclePosts(circleId, limit = 30) {
  const { data } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      created_at,
      user_id,
      profiles (name)
    `)
    .eq('circle_id', circleId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}

/**
 * Creates a post in a circle. Returns the new post.
 */
export async function createPost(circleId, userId, content) {
  const { data, error } = await supabase
    .from('posts')
    .insert({ circle_id: circleId, user_id: userId, content: content.trim() })
    .select('*, profiles(name)')
    .single()

  if (error) throw error
  return data
}

export async function renameCircle(circleId, name) {
  const { error } = await supabase
    .from('circles')
    .update({ name: name.trim() })
    .eq('id', circleId)
  if (error) throw error
}