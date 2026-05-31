"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WELCOME = "I've read everything you shared. Let's get into what's actually on your mind.";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 bg-[#7c6af7] rounded-full inline-block animate-bounce"
          style={{ animationDelay: `${delay}ms`, animationDuration: "1s" }}
        />
      ))}
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [founderId, setFounderId] = useState<string | null>(null);
  const [founderName, setFounderName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([{ role: "assistant", content: WELCOME }]);
  const founderIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Keep refs in sync so beforeunload closure stays fresh
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const saveSession = useCallback((id: string, msgs: Message[]) => {
    const real = msgs.filter((m) => m.role !== "system");
    if (real.length < 2) return;
    navigator.sendBeacon(
      `${API_URL}/api/session/save`,
      new Blob([JSON.stringify({ founder_id: id, messages: real })], {
        type: "application/json",
      })
    );
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("founder_id");
    const name = localStorage.getItem("founder_name");

    if (!id) {
      router.push("/");
      return;
    }

    setFounderId(id);
    founderIdRef.current = id;
    setFounderName(name || "");

    if (!name) {
      fetch(`${API_URL}/api/founder/${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.name) {
            setFounderName(data.name);
            localStorage.setItem("founder_name", data.name);
          }
        })
        .catch(() => {});
    }

    const handleUnload = () => {
      if (founderIdRef.current) {
        saveSession(founderIdRef.current, messagesRef.current);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [router, saveSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading || !founderId) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ founder_id: founderId, messages: updated }),
      });

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Try again." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <span className="text-white font-bold text-lg tracking-widest">JUNTO</span>
        {founderName && <span className="text-[#666] text-sm">{founderName}</span>}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#7c6af7] text-white px-4 py-3"
                    : "bg-[#1a1a1a] text-[#e0e0e0] border border-[#2a2a2a] px-4 py-3"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
                <ThinkingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[#2a2a2a] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Talk to Junto…"
            rows={1}
            autoFocus
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-[#444] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7c6af7] transition-colors resize-none overflow-hidden"
            style={{ minHeight: "48px", maxHeight: "120px" }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="shrink-0 bg-[#7c6af7] hover:bg-[#6a58e5] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl w-11 h-11 flex items-center justify-center transition-colors text-lg"
            aria-label="Send"
          >
            ↑
          </button>
        </div>
        <p className="max-w-2xl mx-auto mt-2 text-[#333] text-xs text-center">
          Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
