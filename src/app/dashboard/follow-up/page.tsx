"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import EmptyState from '@/components/EmptyState'

type MemberAttendance = {
  id: string;
  full_name: string;
  phone: string;
  department: string;
  last_seen: string | null;
  weeks_absent: number;
};

export default function FollowUpPage() {
  const metadata = { title: 'Follow-up' }
  const [members, setMembers] = useState<MemberAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: church } = await supabase
      .from("churches")
      .select("id")
      .eq("email", user?.email)
      .single();
    if (!church) return;

    const { data: allMembers } = await supabase
      .from("members")
      .select("id, full_name, phone, department")
      .eq("church_id", church.id)
      .eq("is_active", true);

    if (!allMembers) {
      setLoading(false);
      return;
    }

    const results: MemberAttendance[] = [];

    await Promise.all(
      allMembers.map(async (member) => {
        const { data: lastPresent } = await supabase
          .from("attendance")
          .select("service_date")
          .eq("member_id", member.id)
          .eq("present", true)
          .order("service_date", { ascending: false })
          .limit(1);

        const lastSeen = lastPresent?.[0]?.service_date ?? null;

        const weeksAbsent = lastSeen
          ? Math.floor(
              (new Date().getTime() - new Date(lastSeen).getTime()) /
                (1000 * 60 * 60 * 24 * 7),
            )
          : 99;

        if (weeksAbsent >= 3) {
          results.push({
            ...member,
            last_seen: lastSeen,
            weeks_absent: weeksAbsent,
          });
        }
      }),
    );

    results.sort((a, b) => b.weeks_absent - a.weeks_absent);
    setMembers(results);
    setLoading(false);
  };

  const urgencyColor = (weeks: number) => {
    if (weeks >= 8) return "bg-red-50 text-red-600";
    if (weeks >= 5) return "bg-orange-50 text-orange-500";
    return "bg-yellow-50 text-yellow-600";
  };

  const urgencyLabel = (weeks: number) => {
    if (weeks === 99) return "Never attended";
    if (weeks >= 8) return `${weeks} weeks absent`;
    return `${weeks} weeks absent`;
  };

  const formatDate = (str: string) =>
    new Date(str).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Follow-up List</h2>
        <p className="text-gray-400 text-sm">
          Members who have not attended in 3 or more weeks
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Need Follow-up", value: members.length },
          {
            label: "Missing 5+ Weeks",
            value: members.filter((m) => m.weeks_absent >= 5).length,
          },
          {
            label: "Never Attended",
            value: members.filter((m) => m.weeks_absent === 99).length,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-5 border border-gray-100"
          >
            <p className="text-xs text-gray-400 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Member", "Department", "Phone", "Last Seen", "Status"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs text-gray-400 font-medium"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                onClick={() =>
                  (window.location.href = `/dashboard/members/${member.id}`)
                }
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {member.full_name}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {member.department || "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {member.phone || "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {member.last_seen ? formatDate(member.last_seen) : "Never"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${urgencyColor(member.weeks_absent)}`}
                  >
                    {urgencyLabel(member.weeks_absent)}
                  </span>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
             <tr>
  <td colSpan={5}>
    <EmptyState
      title="No follow-ups needed"
      description="All active members have attended recently. Keep it up."
    />
  </td>
</tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
