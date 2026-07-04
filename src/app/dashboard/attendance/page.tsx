"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Member = { id: string; full_name: string; department: string };
type AttendanceMap = Record<string, boolean>;

export default function AttendancePage() {
  const metadata = { title: "Attendance" };
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceMap>({});
  const [churchId, setChurchId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    if (churchId) fetchAttendance();
  }, [date, churchId]);

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
    const { data } = await supabase
      .from("members")
      .select("id, full_name, department")
      .eq("church_id", church.id)
      .eq("is_active", true)
      .order("full_name");
    setMembers(data ?? []);
    setLoading(false);
  };

  const fetchAttendance = async () => {
    const { data } = await supabase
      .from("attendance")
      .select("member_id, present")
      .eq("church_id", churchId)
      .eq("service_date", date);
    const map: AttendanceMap = {};
    data?.forEach((r) => {
      map[r.member_id] = r.present;
    });
    setAttendance(map);
  };

  const toggle = (id: string) => {
    setAttendance((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  };
  const markAll = (present: boolean) => {
    const map: AttendanceMap = {};
    members.forEach((m) => {
      map[m.id] = present;
    });
    setAttendance(map);
    setSaved(false);
  };

  const saveAttendance = async () => {
    setSaving(true);
    await supabase
      .from("attendance")
      .delete()
      .eq("church_id", churchId)
      .eq("service_date", date);
    await supabase.from("attendance").insert(
      members.map((m) => ({
        church_id: churchId,
        member_id: m.id,
        service_date: date,
        present: attendance[m.id] ?? false,
      })),
    );
    setSaving(false);
    setSaved(true);
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Attendance</h2>
          <p className="text-gray-400 text-sm">
            {presentCount} of {members.length} present
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
          />
          <button
            onClick={() => markAll(true)}
            className="text-sm text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            Mark All Present
          </button>
          <button
            onClick={() => markAll(false)}
            className="text-sm text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            Clear All
          </button>
          <button
            onClick={saveAttendance}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved" : "Save Attendance"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Name", "Department", "Present"].map((h) => (
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
            {members.map((member) => (
              <tr
                key={member.id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {member.full_name}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {member.department || "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggle(member.id)}
                    className={`w-10 h-6 rounded-full transition-colors ${attendance[member.id] ? "bg-blue-600" : "bg-gray-200"}`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${attendance[member.id] ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
