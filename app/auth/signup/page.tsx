"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signup");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        setError(data.message || "Sign up failed");
        return;
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        redirectTo: "/home",
      });

      if (result?.error) {
        setError("Account created, but automatic sign in failed. Please log in.");
        router.push("/auth/login");
        return;
      }

      router.push("/home");
      router.refresh();
    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    await signIn("google", { redirectTo: "/home" });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-100 via-emerald-50 to-emerald-100">
      {/* soft background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 -top-28 h-[420px] w-[420px] rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -right-28 -bottom-28 h-[420px] w-[420px] rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-6 lg:py-10">
        {/* same container sizing as signin */}
        <div className="w-full max-w-[950px] lg:h-[600px] overflow-hidden rounded-3xl border border-white/35 bg-white/10 shadow-2xl backdrop-blur-xl">
          <div className="grid h-full grid-cols-1 lg:grid-cols-2">
            {/* LEFT */}
            <div className="relative flex items-center justify-center bg-white/10 px-6 py-10 lg:px-16">
              {/* center divider */}
              <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-px bg-white/25 lg:block" />

              <div className="w-full max-w-sm">
                <h1 className="text-center text-3xl font-bold font-poppins text-[#023030]">
                  Sign Up
                </h1>

                <p className="mt-2 text-center text-[13px] leading-5 text-gray-600 font-helvetica font-normal">
                  Just a few quick things to get started
                </p>

                {/* Tabs */}
                <div className="mx-auto mt-5 flex w-full max-w-[280px] rounded-xl border border-gray-300/60 bg-white/15 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("signin");
                      router.push("/auth/login"); // change if your login route is different
                    }}
                    className={`flex-1 rounded-lg py-2 text-[13px] font-helvetica font-normal transition ${
                      activeTab === "signin"
                        ? "bg-[#0d3626]/10 text-[#2c3531]"
                        : "text-[#2c3531] hover:bg-white/25"
                    }`}
                  >
                    Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className={`flex-1 rounded-lg py-2 text-[13px] font-helvetica font-normal transition ${
                      activeTab === "signup"
                        ? "bg-[#0d3626]/10 text-[#2c3531]"
                        : "text-[#2c3531] hover:bg-white/25"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {error && (
                  <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-[13px] text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {/* First + Last Name (two columns) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-[12px] text-[#023030] font-helvetica font-normal">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          name="firstName"
                          type="text"
                          placeholder="Enter your first name"
                          value={form.firstName}
                          onChange={handleChange}
                          required
                          className="w-full rounded-xl font-helvetica font-light border border-gray-300/40 bg-white/30 py-2.5 pl-10 pr-4 text-[12px] text-gray-900 placeholder-gray-500/60 outline-none transition focus:border-[#0d3626]/40 focus:ring-2 focus:ring-[#0d3626]/25"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[12px] text-[#023030] font-helvetica font-normal">
                        Last Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          name="lastName"
                          type="text"
                          placeholder="Enter your last name"
                          value={form.lastName}
                          onChange={handleChange}
                          required
                          className="w-full rounded-xl font-helvetica font-light border border-gray-300/40 bg-white/30 py-2.5 pl-10 pr-4 text-[12px] text-gray-900 placeholder-gray-500/60 outline-none transition focus:border-[#0d3626]/40 focus:ring-2 focus:ring-[#0d3626]/25"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-[12px] text-[#023030] font-helvetica font-normal">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl font-helvetica font-light border border-gray-300/40 bg-white/30 py-2.5 pl-10 pr-4 text-[13px] text-gray-900 placeholder-gray-500/60 outline-none transition focus:border-[#0d3626]/40 focus:ring-2 focus:ring-[#0d3626]/25"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-[12px] text-[#023030] font-helvetica font-normal">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl font-helvetica font-light border border-gray-300/40 bg-white/30 py-2.5 pl-10 pr-10 text-[13px] text-gray-900 placeholder-gray-500/60 outline-none transition focus:border-[#0d3626]/40 focus:ring-2 focus:ring-[#0d3626]/25"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sign up */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="font-helvetica mt-2 w-full rounded-xl bg-[linear-gradient(135deg,#0a8f8f_0%,#046d6d_45%,#033f3f_90%,#022b2b_100%)] py-2.5 text-[13px] font-light text-white shadow-[0_8px_18px_rgba(2,48,48,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(2,48,48,0.35)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Creating account..." : "Sign Up"}
                  </button>

                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300/40 bg-white/25 py-2.5 text-[13px] font-helvetica text-[#2c3531] transition transition-all duration-100 hover:bg-black/1"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign Up with Google
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT PANEL */}
                  <div className="relative hidden lg:block h-full overflow-hidden rounded-r-3xl">
                    {/* Background */}
                    <Image
                      src="/right-signin.png"
                      alt="SARI welcome card"
                      fill
                      className="object-cover"
                      priority
                    />
            
                  {/* Optional overlay for readability (keep subtle since your design is already readable) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            
                  {/* Logo */}
                  <div className="absolute left-3 top-7 z-20 h-48 w-48  ">
                    <Image
                      src="/sari-logo-yellow.png"
                      alt="SARI logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
            
                  {/* Text */}
                  <div className="absolute left-12 bottom-63 z-20 max-w-[420px] text-white">
                    <h2 className="text-3xl font-semibold font-poppins leading-tight drop-shadow">
                      Welcome to SARI
                    </h2>
            
                    <p className="mt-3 text-xs leading-snug text-white/90 drop-shadow font-helvetica font-extralight">
                      Not sure what to eat today? Enter your budget and get a full <br />
                      day&apos;s worth of meals planned in seconds.
                    </p>
            
                    <p className="mt-4 text-xs text-white/90 drop-shadow font-helvetica font-extralight">
                      Sign up for free and let sari handle the rest
                    </p>
                  </div>
            
                  {/* CARD */}
                  <div className="absolute left-12 bottom-12 z-20 w-[370px]">
                    <Image
                      src="/Subtract.png"
                      alt="Budget card"
                      width={740}
                      height={320}
                      className="h-auto w-full"
                      priority
                    />
            
                    <p className="mt-3 text-md leading-snug text-[#023030] drop-shadow font-poppins font-semibold absolute left-8 top-5">
                      Your daily budget can go  <br />
                      further than you think
                    </p>
            
                    <p className="mt-3 text-xs leading-snug text-[#023030] drop-shadow font-helvetica font-light absolute left-8 top-20">
                      Be one of the first iskolars to eat  <br />
                      smarter with sari
                    </p>
            
                    {/* Avatars */}
                    <div className="absolute bottom-8 right-10 flex items-center">
                      <img
                        src="/avatar.png"
                        className="h-8 w-8 rounded-full border-2 border-white object-cover"
                      />
                      <img
                        src="/avatar2.jpg"
                        className="-ml-3 h-8 w-8 rounded-full border-2 border-white object-cover"
                      />
                      <img
                        src="/avatar3.jpg"
                        className="-ml-3 h-8 w-8 rounded-full border-2 border-white object-cover"
                      />
                    </div>
                    </div>
                    </div>
            {/* END RIGHT */}
          </div>
        </div>
      </div>
    </div>
  );
}