

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Welcome to Dacexy, {user?.full_name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-gray-400 mb-8">
          Your account is ready. A verification email has been sent to your inbox.
          Please verify your email to unlock all features.
        </p>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 text-left">
          <h2 className="text-white font-semibold mb-4">What you can do with Dacexy:</h2>
          <ul className="space-y-3">
            {[
              { icon: "💬", text: "Chat with powerful DeepSeek AI" },
              { icon: "🤖", text: "Run autonomous AI agents" },
              { icon: "🎨", text: "Generate images and videos" },
              { icon: "🌐", text: "Build websites with AI" },
              { icon: "🧠", text: "Store and retrieve business memory" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-gray-300">
                <span className="text-2xl">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition"
        >
          Go to Dashboard →
        </button>
      </div>
    </div>
  );
               }
