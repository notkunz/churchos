"use client";
import { useEffect, useState } from "react";
import { supabase, getChurchId } from "@/lib/supabase";

type Admin = { id: string; email: string; role: string };

export default function SettingsPage() {
  const [church, setChurch] = useState<{
    id: string;
    name: string;
    pastor_name: string;
    email: string;
  } | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [form, setForm] = useState({ name: "", pastor_name: "" });
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [churchId, setChurchId] = useState("");

  const init = async () => {
    const churchId = await getChurchId();
    if (!churchId) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("churches")
      .select("*")
      .eq("id", churchId)
      .single();
    if (data) {
      setChurch(data);
      setChurchId(churchId);
      setForm({ name: data.name, pastor_name: data.pastor_name ?? "" });
      fetchAdmins(churchId);
    }
    setLoading(false);
  };

  useEffect(() => {
    void init();
  }, []);

  const fetchAdmins = async (id: string) => {
    const { data } = await supabase
      .from("church_admins")
      .select("*")
      .eq("church_id", id);
    setAdmins(data ?? []);
  };

  const save = async () => {
    if (!church) return;
    setSaving(true);
    await supabase.from("churches").update(form).eq("id", church.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    await supabase
      .from("church_admins")
      .insert({ church_id: churchId, email: newAdminEmail });
    setNewAdminEmail("");
    fetchAdmins(churchId);
  };

  const removeAdmin = async (id: string) => {
    await supabase.from("church_admins").delete().eq("id", id);
    fetchAdmins(churchId);
  };

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="p-8 max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-400 text-sm">Manage your church profile</p>
      </div>

      {/* Church Details */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Church Details</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Church Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Pastor Name
            </label>
            <input
              type="text"
              value={form.pastor_name}
              onChange={(e) =>
                setForm({ ...form, pastor_name: e.target.value })
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Admin Email
            </label>
            <input
              type="text"
              value={church?.email ?? ""}
              disabled
              className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
        </button>
      </div>

      {/* Admins */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Admin Team</h3>
        <p className="text-xs text-gray-400 mb-4">
          Add other staff who can access this dashboard.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="staff@church.com"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={addAdmin}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        <div className="space-y-2">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between py-2 border-b border-gray-50"
            >
              <p className="text-sm text-gray-700">{admin.email}</p>
              <button
                onClick={() => removeAdmin(admin.id)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          {admins.length === 0 && (
            <p className="text-xs text-gray-400">No additional admins yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
