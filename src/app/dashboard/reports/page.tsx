"use client";
import { useEffect, useState } from "react";
import { getChurchId, supabase } from "@/lib/supabase";

type ReportData = {
  totalMembers: number;
  totalServices: number;
  averageAttendance: number;
  totalTithe: number;
  totalOffering: number;
  totalSeed: number;
  totalOther: number;
  totalIncome: number;
};

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [churchId, setChurchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const init = async () => {
    const churchId = await getChurchId();
    if (!churchId) return;
    setChurchId(churchId);
    fetchReport(churchId);
  };

  useEffect(() => {
    void init();
  }, []);

  useEffect(() => {
    if (churchId) {
      void fetchReport(churchId);
    }
  }, [month, year, churchId]);

  const fetchReport = async (id: string) => {
    setLoading(true);

    const firstDay = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const lastDay = new Date(year, month, 1).toISOString().split("T")[0];

    const [members, attendance, transactions] = await Promise.all([
      supabase
        .from("members")
        .select("id", { count: "exact" })
        .eq("church_id", id)
        .eq("is_active", true),
      supabase
        .from("attendance")
        .select("service_date, present")
        .eq("church_id", id)
        .gte("service_date", firstDay)
        .lt("service_date", lastDay),
      supabase
        .from("transactions")
        .select("type, amount")
        .eq("church_id", id)
        .gte("date", firstDay)
        .lt("date", lastDay),
    ]);

    const services = new Set(attendance.data?.map((a) => a.service_date) ?? [])
      .size;
    const present = attendance.data?.filter((a) => a.present).length ?? 0;
    const t = transactions.data ?? [];

    const tithe = t
      .filter((x) => x.type === "tithe")
      .reduce((s, x) => s + Number(x.amount), 0);
    const offering = t
      .filter((x) => x.type === "offering")
      .reduce((s, x) => s + Number(x.amount), 0);
    const seed = t
      .filter((x) => x.type === "seed")
      .reduce((s, x) => s + Number(x.amount), 0);
    const other = t
      .filter((x) => x.type === "other")
      .reduce((s, x) => s + Number(x.amount), 0);

    setReport({
      totalMembers: members.count ?? 0,
      totalServices: services,
      averageAttendance: services > 0 ? Math.round(present / services) : 0,
      totalTithe: tithe,
      totalOffering: offering,
      totalSeed: seed,
      totalOther: other,
      totalIncome: tithe + offering + seed + other,
    });
    setLoading(false);
  };

  const monthName = new Date(year, month - 1).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = [2024, 2025, 2026, 2027];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
          <p className="text-gray-400 text-sm">Monthly summary — {monthName}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
          >
            {months.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={() => window.print()}
            className="border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            Print Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading report...</div>
      ) : report ? (
        <>
          {/* Attendance */}
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Attendance
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Active Members", value: report.totalMembers },
              { label: "Services Held", value: report.totalServices },
              { label: "Avg Attendance", value: report.averageAttendance },
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

          {/* Finance */}
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Financials
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: "Total Tithe", value: report.totalTithe },
              { label: "Total Offering", value: report.totalOffering },
              {
                label: "Seed & Other",
                value: report.totalSeed + report.totalOther,
              },
              { label: "Total Income", value: report.totalIncome },
            ].map((card) => (
              <div
                key={card.label}
                className={`rounded-xl p-5 border ${card.label === "Total Income" ? "bg-blue-600 border-blue-600" : "bg-white border-gray-100"}`}
              >
                <p
                  className={`text-xs mb-1 ${card.label === "Total Income" ? "text-blue-200" : "text-gray-400"}`}
                >
                  {card.label}
                </p>
                <p
                  className={`text-2xl font-bold ${card.label === "Total Income" ? "text-white" : "text-gray-800"}`}
                >
                  ₦{card.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
