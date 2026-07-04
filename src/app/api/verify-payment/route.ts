import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  const { reference, church_id } = await req.json();

  // verify with Paystack
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    },
  );

  const data = await res.json();

  if (data.data.status === "success") {
    const subscriptionEnds = new Date();
    subscriptionEnds.setDate(subscriptionEnds.getDate() + 30);

    await supabase
      .from("churches")
      .update({
        is_subscribed: true,
        subscription_ends_at: subscriptionEnds.toISOString(),
      })
      .eq("id", church_id);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false }, { status: 400 });
}
