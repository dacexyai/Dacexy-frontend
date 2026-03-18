

"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="text-2xl font-bold text-white">
          Dace<span className="text-indigo-400">xy</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white transition">
            Login
          </Link>
          <Link href="/register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center text-center px-4 py-32">
        <div className="inline-block px-4 py-2 bg-indigo-900/50 border border-indigo-700 rounded-full text-indigo-300 text-sm mb-8">
          Enterprise AI Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          AI That Works<br />
          <span className="text-indigo-400">For Your Business</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-12">
          Chat, generate images, build websites, automate tasks and more — all in one enterprise platform built for India.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg font-semibold transition">
            Start Free Trial
          </Link>
          <Link href="/login" className="px-8 py-4 border border-gray-700 hover:border-indigo-500 text-gray-300 hover:text-white rounded-xl text-lg transition">
            Sign In
          </Link>
        </div>
      </section>

      <section className="px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Everything Your Business Needs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "AI Chat", desc: "Powerful conversations with DeepSeek AI", icon: "💬" },
            { title: "Image Generation", desc: "Create stunning visuals instantly", icon: "🎨" },
            { title: "Website Builder", desc: "Build websites with AI in seconds", icon: "🌐" },
            { title: "AI Agent", desc: "Automate complex tasks autonomously", icon: "🤖" },
            { title: "Voice AI", desc: "Text to speech and voice chat", icon: "🎙️" },
            { title: "Memory & RAG", desc: "AI that remembers your business context", icon: "🧠" },
          ].map((f) => (
            <div key={f.title} className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-indigo-700 transition">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-gray-600 border-t border-gray-900">
        © 2026 Dacexy. All rights reserved.
      </footer>
    </main>
  );
