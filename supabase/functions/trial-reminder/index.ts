import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async () => {
  const now = new Date()
  const { data: churches } = await supabase
    .from('churches')
    .select('name, email, trial_ends_at, is_subscribed')
    .eq('is_subscribed', false)

  for (const church of churches ?? []) {
    const daysLeft = Math.ceil((new Date(church.trial_ends_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    console.log(`${church.name} — ${daysLeft} days left`)
  }

  return new Response('done', { status: 200 })
})