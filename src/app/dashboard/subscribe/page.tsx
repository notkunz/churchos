"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SubscribePage() {
  const [church, setChurch] = useState<{
    id: string;
    name: string;
    trial_ends_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("churches")
      .select("id, name, trial_ends_at")
      .eq("email", user?.email)
      .single();
    setChurch(data);
    setLoading(false);
  };

  const handlePayment = () => {
    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: "",
      amount: 1000000, // ₦10,000 in kobo
      currency: "NGN",
      ref: `churchos_${church?.id}_${Date.now()}`,
      metadata: { church_id: church?.id },
      callback: async (response: { reference: string }) => {
        // verify on backend
        await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: response.reference,
            church_id: church?.id,
          }),
        });
        window.location.href = "/dashboard";
      },
      onClose: () => {},
    });
    handler.openIframe();
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );

  return (
    <>
      <script src="https://js.paystack.co/v1/inline.js" async />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-gray-100 p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Your trial has ended
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Subscribe to keep managing {church?.name} on ChurchOS.
          </p>

          <div className="bg-blue-600 rounded-xl p-6 mb-6 text-left">
            <p className="text-blue-200 text-xs mb-1">Monthly Plan</p>
            <p className="text-white text-3xl font-bold mb-4">
              ₦10,000
              <span className="text-blue-200 text-sm font-normal">/month</span>
            </p>
            <ul className="space-y-2">
              {[
                "Unlimited member records",
                "Attendance tracking",
                "Follow-up list",
                "Offering records",
                "Monthly reports",
              ].map((f) => (
                <li
                  key={f}
                  className="text-blue-100 text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handlePayment}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Pay ₦10,000 with Paystack
          </button>

          <p className="text-xs text-gray-400 mt-4">
            Secure payment powered by Paystack
          </p>
        </div>
      </div>
    </>
  );
}
