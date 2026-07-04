import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async () => {
  const now = new Date();

  const day20 = new Date(now);
  day20.setDate(day20.getDate() + 10);

  const day27 = new Date(now);
  day27.setDate(day27.getDate() + 3);

  const { data: churches } = await supabase
    .from("churches")
    .select("name, email, trial_ends_at, is_subscribed")
    .eq("is_subscribed", false);

  for (const church of churches ?? []) {
    const trialEnd = new Date(church.trial_ends_at);
    const daysLeft = Math.ceil(
      (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysLeft === 10 || daysLeft === 3) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ChurchOS <noreply@churchos.app>",
          to: church.email,
          subject: `Your ChurchOS trial expires in ${daysLeft} days`,
          html: `
            <h2>Hi ${church.name},</h2>
            <p>Your free trial expires in <strong>${daysLeft} days</strong>.</p>
            <p>Subscribe now to keep your member records, attendance history and reports.</p>
            <a href="https://churchos.vercel.app/dashboard/subscribe" 
               style="background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
              Subscribe Now — ₦10,000/month
            </a>
          `,
        }),
      });
    }
  }

  return new Response("done", { status: 200 });
});
