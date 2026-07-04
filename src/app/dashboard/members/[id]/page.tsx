"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

type Member = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  department: string;
  join_date: string;
  is_active: boolean;
};

type Attendance = {
  id: string;
  service_date: string;
  present: boolean;
};

type Transaction = {
  id: string;
  type: string;
  amount: number;
  date: string;
  note: string;
};

export default function MemberDetailPage() {
  const { id } = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) init();
  }, [id]);

  const init = async () => {
    const [memberRes, attendanceRes, transactionRes] = await Promise.all([
      supabase.from("members").select("*").eq("id", id).single(),
      supabase
        .from("attendance")
        .select("*")
        .eq("member_id", id)
        .order("service_date", { ascending: false })
        .limit(10),
      supabase
        .from("transactions")
        .select("*")
        .eq("member_id", id)
        .order("date", { ascending: false }),
    ]);
    setMember(memberRes.data);
    setAttendance(attendanceRes.data ?? []);
    setTransactions(transactionRes.data ?? []);
    setLoading(false);
  };

  const totalGiving = transactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0,
  );
  const attendanceRate =
    attendance.length > 0
      ? Math.round(
          (attendance.filter((a) => a.present).length / attendance.length) *
            100,
        )
      : 0;

  const formatDate = (str: string) =>
    new Date(str).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (!member) return <div className="p-8 text-gray-400">Member not found</div>;

  return (
    <div className="p-8 max-w-4xl">
      {/* Back */}
      <a
        href="/dashboard/members"
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 block"
      >
        &larr; Back to Members
      </a>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {member.full_name}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {member.department || "No department"}
            </p>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full ${member.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}
          >
            {member.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: "Phone", value: member.phone || "—" },
            { label: "Email", value: member.email || "—" },
            {
              label: "Joined",
              value: member.join_date ? formatDate(member.join_date) : "—",
            },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-400 mb-1">{item.label}</p>
              <p className="text-sm text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Attendance Rate", value: `${attendanceRate}%` },
          { label: "Services Tracked", value: attendance.length },
          { label: "Total Giving", value: `₦${totalGiving.toLocaleString()}` },
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

      <div className="grid grid-cols-2 gap-6">
        {/* Attendance History */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm">
              Recent Attendance
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Date", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs text-gray-400 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(a.service_date)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${a.present ? "bg-green-50 text-green-600" : "bg-red-50 text-red-400"}`}
                    >
                      {a.present ? "Present" : "Absent"}
                    </span>
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-6 text-center text-gray-400 text-xs"
                  >
                    No attendance records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Giving History */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm">
              Giving History
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Date", "Type", "Amount"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs text-gray-400 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full capitalize ${
                        t.type === "tithe"
                          ? "bg-blue-50 text-blue-600"
                          : t.type === "offering"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    ₦{Number(t.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-gray-400 text-xs"
                  >
                    No giving records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
