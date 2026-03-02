"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Login failed");
      return;
    }

    localStorage.setItem("userId", data.userId);
    router.push("/home");
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-emerald-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-6xl flex gap-8 items-center">
          {/* Left Section - Sign In Form */}
          <div className="w-full lg:w-1/2 bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[#0d3626] mb-4 text-center">Sign In</h1>
              <p className="text-gray-600 text-base text-center">
                Hello, there! You've been missed.
                <br />
                Please enter your details to access your account
              </p>

              {/* Sign In / Sign Up Tabs */}
              <div className="flex gap-2 border border-gray-300 rounded-xl p-2 mt-8 w-fit bg-white/10">
                <button
                  onClick={() => setActiveTab("signin")}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all  ${
                    activeTab === "signin"
                      ? "bg-[#0d3626]/10 text-[#2c3531]"
                      : "text-[#2c3531] hover:bg-white/20"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setActiveTab("signup");
                    router.push("/auth/signup");
                  }}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === "signup"
                      ? "bg-[#0d3626]/10 text-[#2c3531]"
                      : "text-[#2c3531] hover:bg-white/20"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-[#0d3626] mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-14 pr-4 py-3 bg-white/35 border border-gray-300/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d3626] focus:bg-white/50 text-gray-900 placeholder-gray-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-[#0d3626] mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-14 pr-12 py-3 bg-white/35 border border-gray-300/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d3626] focus:bg-white/50 text-gray-900 placeholder-gray-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onChange={() => setShowPassword(!showPassword)}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
                <a href="#" className="text-sm text-[#0d3626] hover:underline mt-2 inline-block">
                  Forgot Password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#0d3626] text-white font-semibold rounded-xl hover:bg-[#0d3626]/90 transition-all shadow-lg hover:shadow-xl"
              >
                Sign in
              </button>

              {/* Google Sign In */}
              <button
                type="button"
                className="w-full py-3 bg-white/40 border border-gray-300/30 text-[#2c3531] font-semibold rounded-xl hover:bg-white/50 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>
            </form>
          </div>

          {/* Right Section - Welcome Message */}
          <div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-gradient-to-br from-[#0d3626] to-[#0a291d] rounded-3xl p-12 relative overflow-hidden min-h-96">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-emerald-400 rounded-full blur-2xl"></div>
            </div>

            {/* SARI Logo */}
            <div className="text-center mb-8 relative z-10">
              <div className="w-24 h-24 mx-auto mb-6 bg-amber-700/30 rounded-full flex items-center justify-center border-2 border-amber-600/50">
                <span className="text-5xl font-bold text-amber-600">S</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Welcome to SARI</h2>
            </div>

            {/* Description Text */}
            <div className="text-center mb-8 relative z-10">
              <p className="text-gray-200 text-sm leading-relaxed mb-4">
                Not sure what to eat today? Enter your budget and get a full day's worth of meals planned in seconds.
              </p>
              <p className="text-gray-100 text-base font-semibold">
                Sign up for free and let sari handle the rest
              </p>
            </div>

            {/* Info Card */}
            <div className="bg-white/95 rounded-3xl p-6 relative z-10 max-w-sm w-full">
              <h3 className="text-[#0d3626] font-bold text-xl mb-2">
                Your daily budget can go further than you think
              </h3>
              <p className="text-[#0d3626] text-sm mb-4">
                Be one of the first Iskolars to eat smarter with Sari.
              </p>

              {/* User Avatars */}
              <div className="flex items-center gap-2 -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"
                    alt="User 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop"
                    alt="User 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop"
                    alt="User 3"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}