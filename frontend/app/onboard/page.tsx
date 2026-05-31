"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const QUESTIONS = [
  { key: "name", question: "What's your name?", placeholder: "Alex" },
  {
    key: "startup",
    question: "What's your startup called?",
    placeholder: "Junto",
  },
  {
    key: "idea",
    question: "What are you building and who is it for?",
    placeholder: "An AI co-founder for solo founders who make decisions alone",
  },
  {
    key: "stage",
    question: "What stage are you at?",
    placeholder: "Idea, pre-revenue, early traction…",
  },
  {
    key: "icp",
    question: "Describe your ideal customer in one sentence.",
    placeholder: "Solo technical founders building B2B SaaS in their first year",
  },
  {
    key: "biggest_fear",
    question: "What's your biggest fear about this?",
    placeholder: "That I'm building something nobody wants",
  },
  {
    key: "current_focus",
    question: "What's your single biggest focus right now?",
    placeholder: "Getting my first 10 paying customers",
  },
  {
    key: "constraints",
    question: "What are your biggest constraints?",
    placeholder: "No budget, working nights after my day job",
  },
];

export default function OnboardPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const q = QUESTIONS[current];
  const progress = (current / QUESTIONS.length) * 100;

  useEffect(() => {
    const founderId = localStorage.getItem("founder_id");
    if (!founderId) router.push("/");
  }, [router]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [current]);

  const advance = async () => {
    if (!input.trim()) return;

    const newAnswers = { ...answers, [q.key]: input.trim() };
    setAnswers(newAnswers);

    if (current < QUESTIONS.length - 1) {
      setVisible(false);
      setTimeout(() => {
        setCurrent((c) => c + 1);
        setInput("");
        setVisible(true);
      }, 180);
    } else {
      setLoading(true);
      const founderId = localStorage.getItem("founder_id");

      try {
        const res = await fetch(`${API_URL}/api/founder/${founderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAnswers),
        });

        if (!res.ok) throw new Error("Failed to save");

        const data = await res.json();
        if (data.name) localStorage.setItem("founder_name", data.name);
        router.push("/chat");
      } catch {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      advance();
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex flex-col">
      <div className="p-8 flex items-center justify-between">
        <span className="text-white font-bold text-xl tracking-widest">JUNTO</span>
        <span className="text-[#555] text-sm tabular-nums">
          {current + 1} / {QUESTIONS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mx-8 h-px bg-[#1a1a1a] overflow-hidden">
        <div
          className="h-full bg-[#7c6af7] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div
          className="max-w-xl w-full transition-all duration-180"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)" }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8 leading-snug">
            {q.question}
          </h2>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={q.placeholder}
            rows={3}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-[#444] rounded-xl px-5 py-4 text-base outline-none focus:border-[#7c6af7] transition-colors resize-none"
          />

          <div className="flex items-center justify-between mt-4">
            <span className="text-[#555] text-sm">Enter to continue</span>
            <button
              onClick={advance}
              disabled={!input.trim() || loading}
              className="bg-[#7c6af7] hover:bg-[#6a58e5] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl px-6 py-3 transition-colors"
            >
              {loading ? "Saving…" : current === QUESTIONS.length - 1 ? "Finish →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
