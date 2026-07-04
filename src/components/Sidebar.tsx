"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Members", href: "/dashboard/members" },
  { label: "Attendance", href: "/dashboard/attendance" },
  { label: "Transactions", href: "/dashboard/transactions" },
  { label: "Announcements", href: "/dashboard/announcements" },
  { label: "Events", href: "/dashboard/events" },
  { label: "Follow-up", href: "/dashboard/follow-up" },
  { label: "Reports", href: "/dashboard/reports" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [churchName, setChurchName] = useState("ChurchOS");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchChurch = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("churches")
        .select("name")
        .eq("email", user.email)
        .single();
      if (data?.name) setChurchName(data.name);
    };
    fetchChurch();
  }, []);

  // close sidebar on route change on mobile
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3">
        <h1 className="text-base font-bold text-blue-600 max-w-[150px]">
          {churchName}
        </h1>
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-500 hover:text-gray-800 p-1"
        >
          {open ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-100 flex flex-col z-20
        transition-transform duration-200
        md:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-lg font-bold text-blue-600">
            {churchName}
          </h1>
          <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="w-full text-sm text-gray-400 hover:text-red-500 text-left px-3 py-2"
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
