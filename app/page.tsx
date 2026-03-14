"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  Mail,
  MapPin,
  Sparkles,
  Wallet,
  UtensilsCrossed,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pt-[80px] text-[#123c3b]">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/30 bg-white/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 md:px-8 lg:px-10">
          <Link
            href="/"
            className="text-[28px] font-semibold tracking-[-0.04em] text-[#0b4b49]"
          >
            sari
          </Link>

          <nav className="hidden items-center gap-8 md:flex font-poppins">
            <a
              href="#features"
              className="text-sm font-medium text-[#214746] transition hover:text-[#0a6a68]"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-[#214746] transition hover:text-[#0a6a68]"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-[#214746] transition hover:text-[#0a6a68]"
            >
              Contact Us
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth/login"
              className="font-poppins rounded-full border border-[#d7e2de] bg-white/80 px-5 py-2 text-sm font-medium text-[#214746] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="font-poppins rounded-full bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] px-5 py-2 text-sm font-medium text-white shadow-[0_10px_24px_rgba(10,106,104,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(10,106,104,0.28)]"
            >
              Sign Up
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e2de] bg-white text-[#214746] shadow-sm md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#edf2f0] bg-white/95 px-5 py-4 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-4 font-poppins">
              <a
                href="#features"
                className="text-sm font-medium text-[#214746]"
                onClick={() => setMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#about"
                className="text-sm font-medium text-[#214746]"
                onClick={() => setMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#contact"
                className="text-sm font-medium text-[#214746]"
                onClick={() => setMenuOpen(false)}
              >
                Contact Us
              </a>

              <div className="flex gap-3 pt-2">
                <Link
                  href="/auth/login"
                  className="rounded-full border border-[#d7e2de] bg-white px-5 py-2 text-sm font-medium text-[#214746]"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] px-5 py-2 text-sm font-medium text-white"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden">
        <Image
          src="/landingpage-bg.png"
          alt="SARI hero background"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.28))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.18),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(6,182,212,0.12),transparent_24%)]" />

        <div className="hero-blob absolute -left-16 top-20 h-64 w-64 rounded-full bg-[#7be0d5]/30 blur-3xl" />
        <div className="hero-blob-delayed absolute right-0 top-28 h-72 w-72 rounded-full bg-[#9fe7df]/30 blur-3xl" />

        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent via-white/70 to-white" />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-[1280px] grid-cols-1 items-center gap-12 px-5 py-14 md:px-8 lg:grid-cols-2 lg:px-10 lg:py-12">
          <div className="max-w-[620px] animate-fade-up">
            <div className="font-helvetica font-light inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 px-4 py-2 text-xs tracking-wide text-[#0a6a68] shadow-[0_8px_24px_rgba(255,255,255,0.35)] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Budget-friendly meal planning for Elbi students
            </div>

            <h1 className="mt-6 text-[42px] font-semibold font-helvetica leading-[0.98] tracking-[-0.06em] text-[#073b3a] sm:text-[56px] md:text-[68px] lg:text-[70px]">
              Not sure what to
              <br />
              eat in Elbi?
            </h1>

            <p className="mt-5 max-w-[560px] text-[16px] leading-7 text-[#355857] md:text-[19px] font-helvetica font-light">
              Tell us your budget and let SARI build a sulit meal plan for your
              day in seconds.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="font-poppins inline-flex items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_45%,#046d6d_90%,#0a8f8f_100%)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(10,106,104,0.24)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(10,106,104,0.30)]"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#features"
                className="font-poppins inline-flex items-center justify-center rounded-[14px] border border-white/70 bg-white/55 px-6 py-3.5 text-sm font-semibold text-[#214746] shadow-sm backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/80"
              >
                Explore Features
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="font-helvetica font-light inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/45 px-4 py-2 text-sm text-[#315756] backdrop-blur-md">
                <BadgeCheck className="h-4 w-4 text-[#0a6a68]" />
                Budget-based suggestions
              </div>
              <div className="font-helvetica font-light inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/45 px-4 py-2 text-sm text-[#315756] backdrop-blur-md">
                <BadgeCheck className="h-4 w-4 text-[#0a6a68]" />
                Elbi-friendly choices
              </div>
              <div className="font-helvetica font-light inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/45 px-4 py-2 text-sm text-[#315756] backdrop-blur-md">
                <BadgeCheck className="h-4 w-4 text-[#0a6a68]" />
                Quick meal planning
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="absolute right-6 top-12 hidden h-24 w-24 rounded-full bg-white/35 blur-2xl lg:block" />
            <div className="absolute bottom-14 left-10 hidden h-28 w-28 rounded-full bg-[#86d8cf]/25 blur-3xl lg:block" />

            <div className="float-card relative w-full max-w-[450px] p-4 backdrop-blur-xl mr-10">
              <div>
                <Image
                  src="/landing-page-right.png"
                  alt="SARI app preview"
                  width={900}
                  height={900}
                  priority
                  className="h-auto w-full object-contain drop-shadow-[0_24px_50px_rgba(0,0,0,0.12)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-28 relative bg-[linear-gradient(to_bottom,#ffffff,#f6fbfa)] px-5 py-20 md:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10 max-w-[760px]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0a6a68]">
              Features
            </p>
            <h2 className="mt-2 text-3xl font-bold font-helvetica tracking-[-0.05em] text-[#0f3f3e] md:text-5xl">
              Made for practical everyday food decisions
            </h2>
            <p className="mt-4 text-base leading-7 text-[#557170] md:text-lg">
              SARI helps students stretch their allowance better by turning a
              simple budget into meal options that feel realistic, quick, and
              easy to trust.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 font-poppins">
            {[
              {
                icon: Wallet,
                title: "Smart budget matching",
                text: "Input your daily or weekly allowance and get meal suggestions that stay within your actual budget.",
              },
              {
                icon: UtensilsCrossed,
                title: "Easy meal combinations",
                text: "Mix and match meals from different establishments to find combinations that fit both cravings and cost.",
              },
              {
                icon: Sparkles,
                title: "Faster everyday planning",
                text: "Spend less time deciding where to eat and more time focusing on class, org work, and your day.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-[26px] border border-[#e7efec] bg-white/75 p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_44px_rgba(10,106,104,0.10)]"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-[linear-gradient(135deg,#e8f4f3,#f5fbfb)] p-3 shadow-sm transition group-hover:scale-105">
                    <Icon className="h-5 w-5 text-[#0a6a68]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#103f3e]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#587372]">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-28 bg-white px-5 pb-20 md:px-8 lg:px-10"
      >
        <div className="mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-[1.15fr_0.85fr] mt-10">
          <div className="rounded-[30px] border border-[#e7efec] bg-[linear-gradient(180deg,#ffffff,#f7fbfa)] p-7 shadow-[0_14px_36px_rgba(0,0,0,0.04)] md:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0a6a68]">
              About
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-[#0f3f3e] md:text-4xl font-helvetica">
              SARI is built to make budgeting feel lighter
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-[#557170] md:text-base font-helvetica font-light">
              Many students already know their allowance — the harder part is
              figuring out what meals actually fit that budget every day. SARI
              is designed to simplify that process by helping users discover
              meal options they can afford without the extra stress of computing
              everything on their own.
            </p>
            <p className="mt-4 text-[15px] leading-7 text-[#557170] md:text-base font-helvetica font-light">
              The goal is simple: help Elbi students make smarter, quicker, and
              more practical food decisions through a clean and friendly
              experience.
            </p>
          </div>

          <div className="rounded-[30px] border border-[#e7efec] bg-[linear-gradient(180deg,#f8fbfa,#f1f8f6)] p-7 shadow-[0_14px_36px_rgba(0,0,0,0.04)] md:p-9">
            <h3 className="text-xl font-medium text-[#103f3e] font-helvetica">
              Why students may like it
            </h3>

            <div className="mt-5 space-y-4 font-helvetica font-light">
              {[
                ["Simple to use", "Budget in, meal plan out."],
                [
                  "Student-centered",
                  "Designed around everyday food choices in Elbi.",
                ],
                [
                  "Clean and practical",
                  "No clutter, just helpful suggestions and clear pricing.",
                ],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-[18px] border border-white bg-white/90 p-4 shadow-sm transition hover:-translate-y-1"
                >
                  <p className="font-medium text-[#143f3f]">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#5c7675]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-28 bg-white px-5 pb-20 md:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1200px] rounded-[32px] border border-[#dfeceb] bg-[linear-gradient(135deg,#f7fbfa_0%,#ffffff_55%,#edf9f8_100%)] p-7 shadow-[0_18px_44px_rgba(0,0,0,0.05)] md:p-9">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0a6a68]">
                Contact Us
              </p>
              <h2 className="mt-2 text-3xl font-bold font-helvetica tracking-[-0.05em] text-[#0f3f3e] md:text-4xl">
                Let’s connect
              </h2>
              <p className="font-helvetica font-light mt-4 max-w-[620px] text-base leading-7 text-[#557170]">
                Have questions, ideas, or feedback for SARI? Contact us!
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[#ecf2f1] bg-white/90 p-4 shadow-sm">
                  <div className="mb-2 inline-flex rounded-xl bg-[#e8f4f3] p-2">
                    <Mail className="h-4 w-4 text-[#0a6a68]" />
                  </div>
                  <p className="font-helvetica font-medium text-[#143f3f]">Email</p>
                  <p className="font-helvetica font-light mt-1 text-sm text-[#5c7675]">
                    217kathleen@gmail.com
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#ecf2f1] bg-white/90 p-4 shadow-sm">
                  <div className="mb-2 inline-flex rounded-xl bg-[#e8f4f3] p-2">
                    <MapPin className="h-4 w-4 text-[#0a6a68]" />
                  </div>
                  <p className="font-medium text-[#143f3f] font-helvetica">Location</p>
                  <p className="mt-1 text-sm text-[#5c7675] font-helvetica font-light">
                    University of the Philippines Los Baños
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#022b2b_0%,#033f3f_40%,#046d6d_78%,#0a8f8f_100%)] p-7 text-white shadow-[0_18px_44px_rgba(10,106,104,0.28)]">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.16em] text-white/75">
                    Start using SARI
                  </p>
                  <h3 className="mt-2 text-2xl font-medium font-helvetica leading-tight md:text-3xl">
                    Ready to plan your meals within budget?
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/80 font-helvetica font-light">
                    Create an account and start exploring practical meal
                    combinations for your allowance.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                  <Link
                    href="/auth/signup"
                    className="font-poppins inline-flex items-center justify-center rounded-[12px] bg-white px-5 py-3 text-sm font-semibold text-[#0a6a68] transition hover:-translate-y-1 hover:bg-white/90"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/auth/login"
                    className="font-poppins inline-flex items-center justify-center rounded-[12px] border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/15"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#edf2f0] bg-white px-5 py-6 md:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 text-sm text-[#557170] md:flex-row md:items-center md:justify-between">
          <p>© 2026 SARI. Budget-friendly meal planning for Elbi students.</p>
          <div className="flex gap-5">
            <a href="#features" className="font-helvetica font-light transition hover:text-[#0a6a68]">
              Features
            </a>
            <a href="#about" className="font-helvetica font-light transition hover:text-[#0a6a68]">
              About
            </a>
            <a href="#contact" className="font-helvetica font-light transition hover:text-[#0a6a68]">
              Contact
            </a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes floatY {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes blobMove {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(14px, -10px, 0) scale(1.04);
          }
        }

        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .float-card {
          animation: floatY 6s ease-in-out infinite;
        }

        .hero-blob {
          animation: blobMove 10s ease-in-out infinite;
        }

        .hero-blob-delayed {
          animation: blobMove 13s ease-in-out infinite;
        }

        .animate-fade-up {
          animation: fadeUp 0.8s ease-out both;
        }
      `}</style>
    </main>
  );
}