import { supabase } from '../SupabaseClient'

export async function loadCircles(userId) {
  const { data } = await supabase
    .from('circle_members')
    .select('circle_id, circles(id, category, city, name)')
    .eq('user_id', userId)

  if (!data) return []

  const circles = data.map(d => d.circles).filter(Boolean)

  // For each circle, get member count and names
  const enriched = await Promise.all(circles.map(async (circle) => {
    const { data: members } = await supabase
      .from('circle_members')
      .select('user_id, profiles(name)')
      .eq('circle_id', circle.id)
      .limit(10)

    const memberNames = members?.map(m => m.profiles?.name).filter(Boolean) || []

    return {
      ...circle,
      member_count: members?.length || 0,
      memberNames
    }
  }))

  return enriched
}

export async function getCirclePosts(circleId, limit = 30) {
  const { data } = await supabase
    .from('posts')
    .select('*, profiles(name)')
    .eq('circle_id', circleId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}

export async function createPost(circleId, userId, content) {
  const { data } = await supabase
    .from('posts')
    .insert({ circle_id: circleId, user_id: userId, content })
    .select('*, profiles(name)')
    .single()

  return data
}

export async function renameCircle(circleId, name) {
  const { data } = await supabase
    .from('circles')
    .update({ name })
    .eq('id', circleId)
    .select()
    .single()

  return data
}