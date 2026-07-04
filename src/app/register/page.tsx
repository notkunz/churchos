"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type FormKey =
  | "church_name"
  | "pastor_name"
  | "email"
  | "password"
  | "confirm_password";

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<Record<FormKey, string>>({
    church_name: "",
    pastor_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const router = useRouter();

  const handleRegister = async () => {
    setError("");
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    if (
      !form.church_name ||
      !form.pastor_name ||
      !form.email ||
      !form.password
    ) {
      setError("Please fill in all fields");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: churchError } = await supabase.from("churches").insert({
        name: form.church_name,
        pastor_name: form.pastor_name,
        email: form.email,
      });
      if (churchError) {
        setError(churchError.message);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Get Started</h1>
        <p className="text-gray-400 text-sm mb-6">
          Create your church account on ChurchOS
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex gap-2 mb-6">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${step >= s ? "bg-blue-600" : "bg-gray-100"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Church Name
              </label>
              <input
                type="text"
                value={form.church_name}
                onChange={(e) =>
                  setForm({ ...form, church_name: e.target.value })
                }
                placeholder="e.g. Grace Chapel Lagos"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                placeholder="e.g. Pastor John Doe"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => {
                if (!form.church_name || !form.pastor_name) {
                  setError("Please fill in all fields");
                  return;
                }
                setError("");
                setStep(2);
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="pastor@church.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Min 6 characters"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirm_password}
                  onChange={(e) =>
                    setForm({ ...form, confirm_password: e.target.value })
                  }
                  placeholder="Repeat password"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="flex-1 border border-gray-200 text-gray-500 py-3 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 mt-6 pt-4 text-center">
          <p className="text-xs text-gray-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
