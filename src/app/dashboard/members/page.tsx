"use client";
import { useEffect, useState } from "react";
import { getChurchId, supabase } from "@/lib/supabase";
import EmptyState from "@/components/EmptyState";

type Member = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  department: string;
  join_date: string;
  is_active: boolean;
};
type MemberForm = {
  full_name: string;
  phone: string;
  email: string;
  department: string;
  join_date: string;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [churchId, setChurchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<MemberForm>({
    full_name: "",
    phone: "",
    email: "",
    department: "",
    join_date: "",
  });

  const init = async () => {
    const churchId = await getChurchId();
    if (!churchId) return;
    setChurchId(churchId);
    fetchMembers(churchId);
  };

  useEffect(() => {
    void init();
  }, []);

  const fetchMembers = async (id: string) => {
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("church_id", id)
      .order("full_name");
    setMembers(data ?? []);
    setLoading(false);
  };

  const addMember = async () => {
    if (!form.full_name) return;
    await supabase.from("members").insert({ ...form, church_id: churchId });
    setForm({
      full_name: "",
      phone: "",
      email: "",
      department: "",
      join_date: "",
    });
    setShowForm(false);
    fetchMembers(churchId);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("members").update({ is_active: !current }).eq("id", id);
    fetchMembers(churchId);
  };

  const filtered = members.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.department?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Members</h2>
          <p className="text-gray-400 text-sm">
            {members.length} total members
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Add Member
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">New Member</h3>
          <div className="grid grid-cols-2 gap-4">
            {(
              [
                { key: "full_name", label: "Full Name", type: "text" },
                { key: "phone", label: "Phone", type: "text" },
                { key: "email", label: "Email", type: "email" },
                { key: "department", label: "Department", type: "text" },
                { key: "join_date", label: "Join Date", type: "date" },
              ] as { key: keyof MemberForm; label: string; type: string }[]
            ).map(({ key, label, type }) => (
              <div key={key}>
                <label className="text-xs text-gray-400 mb-1 block">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={addMember}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Save Member
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

      <input
        type="text"
        placeholder="Search by name or department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 mb-4 bg-white"
      />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                "Name",
                "Phone",
                "Department",
                "Join Date",
                "Status",
                "Action",
              ].map((h) => (
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
            {filtered.map((member) => (
              <tr
                key={member.id}
                onClick={() =>
                  (window.location.href = `/dashboard/members/${member.id}`)
                }
                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {member.full_name}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {member.phone || "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {member.department || "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {member.join_date || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${member.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}
                  >
                    {member.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(member.id, member.is_active)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    {member.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="No members yet"
                    description="Start building your member directory by adding your first member."
                    actionLabel="Add Member"
                    actionHref="#"
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
