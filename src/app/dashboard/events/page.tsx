"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import EmptyState from '@/components/EmptyState'

type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
};
type EventForm = {
  title: string;
  description: string;
  event_date: string;
  location: string;
};

export default function EventsPage() {
  const metadata = { title: 'Events' }
  const [events, setEvents] = useState<Event[]>([]);
  const [churchId, setChurchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EventForm>({
    title: "",
    description: "",
    event_date: "",
    location: "",
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
    fetchEvents(church.id);
  };

  const fetchEvents = async (id: string) => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("church_id", id)
      .order("event_date", { ascending: true });
    setEvents(data ?? []);
    setLoading(false);
  };

  const addEvent = async () => {
    if (!form.title || !form.event_date) return;
    await supabase.from("events").insert({ ...form, church_id: churchId });
    setForm({ title: "", description: "", event_date: "", location: "" });
    setShowForm(false);
    fetchEvents(churchId);
  };

  const removeEvent = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    fetchEvents(churchId);
  };

  const isPast = (date: string) => new Date(date) < new Date();

  const formatDate = (str: string) =>
    new Date(str).toLocaleDateString("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const upcoming = events.filter((e) => !isPast(e.event_date));
  const past = events.filter((e) => isPast(e.event_date));

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Events</h2>
          <p className="text-gray-400 text-sm">{upcoming.length} upcoming</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Add Event
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">New Event</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">
                Event Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Annual Thanksgiving Service"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Date</label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) =>
                  setForm({ ...form, event_date: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Main Auditorium"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">
                Description (optional)
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Brief description..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={addEvent}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Save Event
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

      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Upcoming
      </h3>
      <div className="space-y-3 mb-8">
        {upcoming.map((event) => (
          <div
            key={event.id}
            className="bg-white border border-gray-100 rounded-xl p-5 flex items-start justify-between"
          >
            <div>
              <p className="font-semibold text-gray-800">{event.title}</p>
              <p className="text-sm text-blue-600 mt-1">
                {formatDate(event.event_date)}
              </p>
              {event.location && (
                <p className="text-xs text-gray-400 mt-1">{event.location}</p>
              )}
              {event.description && (
                <p className="text-sm text-gray-500 mt-2">
                  {event.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeEvent(event.id)}
              className="text-xs text-red-400 hover:text-red-600 shrink-0 ml-4"
            >
              Delete
            </button>
          </div>
        ))}
        {upcoming.length === 0 && (
        <EmptyState
  title="No upcoming events"
  description="Add your first event so members know what to look forward to."
/>
        )}
      </div>

      {past.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Past Events
          </h3>
          <div className="space-y-3">
            {past.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-gray-100 rounded-xl p-5 flex items-start justify-between opacity-60"
              >
                <div>
                  <p className="font-semibold text-gray-800">{event.title}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatDate(event.event_date)}
                  </p>
                  {event.location && (
                    <p className="text-xs text-gray-400 mt-1">
                      {event.location}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeEvent(event.id)}
                  className="text-xs text-red-400 hover:text-red-600 shrink-0 ml-4"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
