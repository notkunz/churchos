"use client";
import { useEffect, useState } from "react";
import { getChurchId, supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TrialBanner() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const check = async () => {
      const churchId = await getChurchId();
      if (!churchId) return;

      const { data } = await supabase
        .from("churches")
        .select("is_subscribed, trial_ends_at, subscription_ends_at")
        .eq("id", churchId)
        .single();

      if (!data) return;

      const now = new Date();

      if (data.is_subscribed && data.subscription_ends_at) {
        const days = Math.ceil(
          (new Date(data.subscription_ends_at).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        setDaysLeft(days);
        setIsSubscribed(true);
      } else {
        const days = Math.ceil(
          (new Date(data.trial_ends_at).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        setDaysLeft(days);
        setIsSubscribed(false);
      }
    };
    void check();
  }, []);

  if (daysLeft === null || daysLeft > 10) return null;

  const isUrgent = daysLeft <= 3;

  const message = isSubscribed
    ? `Your subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Renew to stay active.`
    : `Your free trial expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Subscribe to keep access.`;

  const buttonLabel = isSubscribed ? "Renew Subscription" : "Subscribe Now";

  return (
    <div
      className={`px-4 py-3 text-sm flex items-center justify-between ${
        isUrgent ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"
      }`}
    >
      <p>{message}</p>
      <Link
        href="/dashboard/subscribe"
        className={`text-xs font-medium px-3 py-1 rounded-lg ml-4 shrink-0 ${
          isUrgent
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-yellow-600 text-white hover:bg-yellow-700"
        }`}
      >
        {buttonLabel}
      </Link>
    </div>
  );
}
