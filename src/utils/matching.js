import { supabase } from '../SupabaseClient'

export async function assignToCircles(userId) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('city')
      .eq('id', userId)
      .single()

    if (!profile?.city) return

    const { data: myInterests } = await supabase
      .from('interests')
      .select('*')
      .eq('user_id', userId)

    if (!myInterests?.length) return

    const { data: cityUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('city', profile.city)
      .neq('id', userId)

    const categories = ['movies', 'shows', 'music', 'books']

    for (const category of categories) {
      const myItems = myInterests
        .filter(i => i.category === category)
        .map(i => i.item_id)

      if (!myItems.length) continue

      const matches = []

      for (const u of cityUsers || []) {
        const { data: their } = await supabase
          .from('interests')
          .select('item_id')
          .eq('user_id', u.id)
          .eq('category', category)

        const overlap = (their || []).filter(i => myItems.includes(i.item_id)).length
        if (overlap >= 1) matches.push(u.id)
      }

      // Find or create circle
      let { data: circle } = await supabase
        .from('circles')
        .select('id')
        .eq('category', category)
        .eq('city', profile.city)
        .maybeSingle()

      if (!circle) {
        const { data: newCircle } = await supabase
          .from('circles')
          .insert({ category, city: profile.city })
          .select()
          .single()
        circle = newCircle
      }

      if (!circle) continue

      // Add current user + matches to circle
      const toInsert = [...new Set([userId, ...matches])].map(uid => ({
        circle_id: circle.id,
        user_id: uid
      }))

      await supabase
        .from('circle_members')
        .upsert(toInsert, { onConflict: 'circle_id,user_id' })
    }
  } catch(e) {
    console.error('Matching error:', e)
  }
}