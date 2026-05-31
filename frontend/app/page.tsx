"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, MessageCircle, TrendingUp } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const FEATURES = [
  {
    Icon: Brain,
    title: "Remembers everything",
    text: "Every decision, every session, every pivot. Junto builds context over time.",
  },
  {
    Icon: MessageCircle,
    title: "Challenges, not validates",
    text: "Junto pushes back. It asks the question you're avoiding.",
  },
  {
    Icon: TrendingUp,
    title: "Smarter over time",
    text: "The longer you use Junto, the more it understands your startup.",
  },
];


function EmailForm({
  email,
  setEmail,
  onSubmit,
  isLoading,
  hasError,
  autoFocus = false,
}: {
  email: string;
  setEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  hasError: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-[440px] mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 bg-white/[0.05] border border-white/[0.08] text-white placeholder-[#555] rounded-xl px-5 py-3.5 text-sm outline-none focus:border-[#7c6af7]/50 focus:bg-white/[0.07] transition-all duration-200"
          required
          autoFocus={autoFocus}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#7c6af7] hover:bg-[#8b7af8] active:bg-[#6a58e5] text-white font-medium rounded-xl px-6 py-3.5 text-sm transition-all duration-150 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "..." : "Get started →"}
        </button>
      </form>
      {hasError && (
        <p className="mt-3 text-red-400 text-sm text-center">
          Something went wrong. Try again.
        </p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [topEmail, setTopEmail] = useState("");
  const [bottomEmail, setBottomEmail] = useState("");
  const [loadingForm, setLoadingForm] = useState<"top" | "bottom" | null>(null);
  const [errorForm, setErrorForm] = useState<"top" | "bottom" | null>(null);
  const router = useRouter();

  const screenshotRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (screenshotRef.current) observer.observe(screenshotRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (email: string, form: "top" | "bottom") => {
    if (!email.trim()) return;

    setLoadingForm(form);
    setErrorForm(null);

    try {
      const res = await fetch(`${API_URL}/api/founder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!res.ok) throw new Error("Failed to connect");

      const data = await res.json();
      localStorage.setItem("founder_id", data.founder.id);
      localStorage.setItem("founder_email", data.founder.email);
      if (data.founder.name) localStorage.setItem("founder_name", data.founder.name);

      router.push(data.is_new ? "/onboard" : "/chat");
    } catch {
      setErrorForm(form);
    } finally {
      setLoadingForm(null);
    }
  };

  return (
    <main className="bg-[#0a0a0a] text-white">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div
            className="absolute top-[15%] left-[10%] w-[650px] h-[650px] rounded-full bg-[#7c6af7] opacity-[0.08] blur-[140px]"
            style={{ animation: "orb1 22s ease-in-out infinite" }}
          />
          <div
            className="absolute bottom-[20%] right-[5%] w-[500px] h-[500px] rounded-full bg-[#3d2fa0] opacity-[0.07] blur-[120px]"
            style={{ animation: "orb2 28s ease-in-out infinite" }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl w-full">
          <p className="text-white font-semibold text-sm tracking-[0.3em] mb-16 opacity-80">
            JUNTO
          </p>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.04] tracking-tight mb-4">
            You&apos;re not<br />building alone.
          </h1>

          <p className="text-[#7c6af7] text-base md:text-lg font-semibold tracking-tight mb-6">
            Unlike chatbots that forget, Junto builds a living memory of your company.
          </p>

          <p className="text-[#888888] text-base md:text-lg leading-relaxed mb-10 max-w-[440px]">
            Junto remembers every decision, tracks your assumptions, and builds
            strategic context across months — so you never start from scratch.
          </p>

          <EmailForm
            email={topEmail}
            setEmail={setTopEmail}
            onSubmit={(e) => { e.preventDefault(); handleSubmit(topEmail, "top"); }}
            isLoading={loadingForm === "top"}
            hasError={errorForm === "top"}
            autoFocus
          />

          <p className="mt-8 text-[#555] text-xs tracking-[0.15em] uppercase">
            Built for founders who build alone.
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <p className="text-[#444] text-xs tracking-[0.2em] uppercase">scroll</p>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3L8 13M8 13L4 9M8 13L12 9" stroke="#444" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {/* ── Product screenshot ── */}
      <section className="px-6 py-16 flex flex-col items-center">
        <p className="text-[#555] text-xs tracking-[0.2em] uppercase mb-8">
          See it in action
        </p>

        <div
          ref={screenshotRef}
          className={`w-full max-w-4xl relative group cursor-zoom-in transition-all duration-700 ease-out ${
            visible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-90 translate-y-10"
          }`}
          onClick={() => setLightbox(true)}
        >
          <img
            src="/screenshot.png"
            alt="Junto in action"
            className="w-full rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
            style={{ filter: "drop-shadow(0 0 60px rgba(124,106,247,0.15))" }}
          />
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 bg-black/60 rounded-lg px-2.5 py-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
            </svg>
            <span className="text-[#888] text-xs">click to zoom</span>
          </div>
        </div>

        {lightbox && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 cursor-zoom-out"
            onClick={() => setLightbox(false)}
          >
            <img
              src="/screenshot.png"
              alt="Junto in action"
              className="max-w-6xl w-full rounded-xl shadow-2xl"
            />
          </div>
        )}
      </section>

      {/* ── Feature columns ── */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
          {FEATURES.map(({ Icon, title, text }) => (
            <div key={title} className="flex flex-col gap-3">
              <Icon size={18} strokeWidth={1.5} className="text-[#7c6af7]" />
              <h3 className="text-white font-semibold text-sm">{title}</h3>
              <p className="text-[#666666] text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tagline ── */}
      <div className="text-center py-12 border-t border-[#141414]">
        <p className="text-[#666666] text-sm">Built for founders who build alone.</p>
      </div>

      {/* ── Bottom email capture ── */}
      <section className="px-6 py-20 flex flex-col items-center">
        <h2 className="text-white font-bold text-2xl md:text-3xl mb-3 text-center">
          Ready to stop deciding alone?
        </h2>
        <p className="text-[#666666] text-sm mb-10">
          Your AI co-founder is one email away.
        </p>

        <EmailForm
          email={bottomEmail}
          setEmail={setBottomEmail}
          onSubmit={(e) => { e.preventDefault(); handleSubmit(bottomEmail, "bottom"); }}
          isLoading={loadingForm === "bottom"}
          hasError={errorForm === "bottom"}
        />
      </section>
    </main>
  );
}
