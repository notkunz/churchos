"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import EmptyState from '@/components/EmptyState'

type Transaction = {
  id: string;
  amount: number;
  type: string;
  date: string;
  note: string;
  member_id: string | null;
  members: { full_name: string } | null;
};
type Member = { id: string; full_name: string };
type TransactionForm = {
  member_id: string;
  type: string;
  amount: string;
  date: string;
  note: string;
};

export default function TransactionsPage() {
  const metadata = { title: 'Transactions' }
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [churchId, setChurchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"individual" | "general">("general");
  const [form, setForm] = useState<TransactionForm>({
    member_id: "",
    type: "offering",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

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
    setChurchId(church.id);
    await Promise.all([fetchTransactions(church.id), fetchMembers(church.id)]);
    setLoading(false);
  };

  const fetchTransactions = async (id: string) => {
    const { data } = await supabase
      .from("transactions")
      .select("*, members(full_name)")
      .eq("church_id", id)
      .order("date", { ascending: false });
    setTransactions(data ?? []);
  };

  const fetchMembers = async (id: string) => {
    const { data } = await supabase
      .from("members")
      .select("id, full_name")
      .eq("church_id", id)
      .eq("is_active", true)
      .order("full_name");
    setMembers(data ?? []);
  };

  const addTransaction = async () => {
    if (!form.amount) return;
    if (mode === "individual" && !form.member_id) return;
    await supabase.from("transactions").insert({
      church_id: churchId,
      member_id: mode === "individual" ? form.member_id : null,
      type: form.type,
      amount: Number(form.amount),
      date: form.date,
      note: form.note,
    });
    setForm({
      member_id: "",
      type: "offering",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
    });
    setShowForm(false);
    fetchTransactions(churchId);
  };

  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalTithe = transactions
    .filter((t) => t.type === "tithe")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalOffering = transactions
    .filter((t) => t.type === "offering")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
          <p className="text-gray-400 text-sm">
            Tithes, offerings and other income
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Income", value: total },
          { label: "Total Tithe", value: totalTithe },
          { label: "Total Offering", value: totalOffering },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-5 border border-gray-100"
          >
            <p className="text-xs text-gray-400 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800">
              ₦{card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">New Transaction</h3>
          <div className="flex gap-2 mb-4">
            {(["general", "individual"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${mode === m ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                {m === "general"
                  ? "General (Service Total)"
                  : "Individual (Member)"}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-4">
            {mode === "general"
              ? "Log total offerings collected during a service — no member attached."
              : "Log a specific member's tithe or personal giving."}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {mode === "individual" && (
              <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">
                  Member
                </label>
                <select
                  value={form.member_id}
                  onChange={(e) =>
                    setForm({ ...form, member_id: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select member</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="offering">Offering</option>
                <option value="tithe">Tithe</option>
                <option value="seed">Seed</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Amount (₦)
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Note (optional)
              </label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder={
                  mode === "general"
                    ? "e.g. Sunday morning service"
                    : "e.g. Monthly tithe"
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={addTransaction}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 text-sm px-4 py-2 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Member", "Type", "Amount", "Date", "Note"].map((h) => (
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
              <tr
                key={t.id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-gray-800">
                  {t.members?.full_name ?? (
                    <span className="text-gray-400 text-xs">General</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${t.type === "tithe" ? "bg-blue-50 text-blue-600" : t.type === "offering" ? "bg-green-50 text-green-600" : t.type === "seed" ? "bg-purple-50 text-purple-600" : "bg-gray-100 text-gray-500"}`}
                  >
                    {t.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  ₦{Number(t.amount).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-500">{t.date}</td>
                <td className="px-4 py-3 text-gray-500">{t.note || "—"}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
             <tr>
  <td colSpan={5}>
    <EmptyState
      title="No transactions yet"
      description="Start recording tithes and offerings to track your church finances."
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
