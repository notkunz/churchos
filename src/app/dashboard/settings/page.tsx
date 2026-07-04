"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Church = {
  id: string;
  name: string;
  pastor_name: string;
  email: string;
};

export default function SettingsPage() {
  const metadata = { title: 'Settings' }
  const [church, setChurch] = useState<Church | null>(null);
  const [form, setForm] = useState({ name: "", pastor_name: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("churches")
      .select("*")
      .eq("email", user?.email)
      .single();
    if (data) {
      setChurch(data);
      setForm({ name: data.name, pastor_name: data.pastor_name ?? "" });
    }
    setLoading(false);
  };

  const save = async () => {
    if (!church) return;
    setSaving(true);
    await supabase.from("churches").update(form).eq("id", church.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-400 text-sm">Manage your church profile</p>
      </div>

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
    </div>
  );
}
