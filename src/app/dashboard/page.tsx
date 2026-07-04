"use client";
import { useEffect, useState } from "react";
import { getChurchId, supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    lastSundayAttendance: 0,
    monthlyTithe: 0,
    upcomingEvents: 0,
  });
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push("/login");
      else fetchStats();
    });
  }, []);

  const fetchStats = async () => {
    const churchId = await getChurchId();
    if (!churchId) {
      setLoading(false);
      return;
    }
    const today = new Date();
    const day = today.getDay();
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - day);
    const lastSundayStr = lastSunday.toISOString().split("T")[0];
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    const [members, attendance, tithe, events] = await Promise.all([
      supabase
        .from("members")
        .select("id", { count: "exact" })
        .eq("church_id", churchId)
        .eq("is_active", true),
      supabase
        .from("attendance")
        .select("id", { count: "exact" })
        .eq("church_id", churchId)
        .eq("service_date", lastSundayStr)
        .eq("present", true),
      supabase
        .from("transactions")
        .select("amount, type")
        .eq("church_id", churchId)
        .gte("date", firstOfMonth),
      supabase
        .from("events")
        .select("id", { count: "exact" })
        .eq("church_id", churchId)
        .gte("event_date", today.toISOString().split("T")[0]),
    ]);

    const totalTithe =
      tithe.data
        ?.filter((t) => t.type === "tithe")
        .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
    setStats({
      totalMembers: members.count ?? 0,
      lastSundayAttendance: attendance.count ?? 0,
      monthlyTithe: totalTithe,
      upcomingEvents: events.count ?? 0,
    });
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h2>
      <p className="text-gray-400 text-sm mb-8">Church overview</p>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: stats.totalMembers },
          { label: "Last Sunday", value: stats.lastSundayAttendance },
          {
            label: "Monthly Tithe",
            value: `₦${stats.monthlyTithe.toLocaleString()}`,
          },
          { label: "Upcoming Events", value: stats.upcomingEvents },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-5 border border-gray-100"
          >
            <p className="text-xs text-gray-400 mb-2">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
