"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import EmptyState from '@/components/EmptyState'

type Announcement = { id: string; message: string; created_at: string };

export default function AnnouncementsPage() {
  const metadata = { title: 'Announcements' }
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [churchId, setChurchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

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
    fetchAnnouncements(church.id);
  };

  const fetchAnnouncements = async (id: string) => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("church_id", id)
      .order("created_at", { ascending: false });
    setAnnouncements(data ?? []);
    setLoading(false);
  };

  const post = async () => {
    if (!message.trim()) return;
    setSaving(true);
    await supabase
      .from("announcements")
      .insert({ church_id: churchId, message });
    setMessage("");
    setSaving(false);
    fetchAnnouncements(churchId);
  };

  const remove = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    fetchAnnouncements(churchId);
  };

  const formatDate = (str: string) =>
    new Date(str).toLocaleDateString("en-NG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
        <p className="text-gray-400 text-sm">
          {announcements.length} announcements posted
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <label className="text-xs text-gray-400 mb-2 block">
          New Announcement
        </label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your announcement here..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-400">{message.length} characters</p>
          <button
            onClick={post}
            disabled={saving || !message.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Posting..." : "Post Announcement"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="bg-white border border-gray-100 rounded-xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-gray-800 leading-relaxed flex-1">
                {a.message}
              </p>
              <button
                onClick={() => remove(a.id)}
                className="text-xs text-red-400 hover:text-red-600 shrink-0"
              >
                Delete
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {formatDate(a.created_at)}
            </p>
          </div>
        ))}
        {announcements.length === 0 && (
         <EmptyState
  title="No announcements yet"
  description="Post your first announcement to keep your church informed."
/>
        )}
      </div>
    </div>
  );
}
