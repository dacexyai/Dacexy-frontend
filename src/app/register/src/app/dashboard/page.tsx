

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { orgs, billing } from "@/lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { user, org, isAuthenticated } = useAuthStore();
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    billing.getUsage().then(setUsage).catch(() => {});
  }, [isAuthenticated]);

  const features = [
    { title: "AI Chat", desc: "Chat with DeepSeek AI", href: "/chat", icon: "💬", color: "from-indigo-900 to-indigo-800" },
    { title: "AI Agent", desc: "Automate complex tasks", href: "/agent", icon: "🤖", color: "from-purple-900 to-purple-800" },
    { title: "Billing", desc: "Manage your plan", href: "/billing", icon: "💳", color: "from-green-900 to-green-800" },
    { title: "Team", desc: "Manage members", href: "/team", icon: "👥", color: "from-blue-900 to-blue-800" },
    { title: "Settings", desc: "Account settings", href: "/settings", icon: "⚙️", color: "from-gray-800 to-gray-700" },
    { title: "Audit Logs", desc: "View activity", href: "/audit-logs", icon: "📋", color: "from-yellow-900 to-yellow-800" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user?.full_name?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="text-gray-400 mt-1">{org?.name} — {org?.plan_tier || "free"} plan</p>
          </div>
          <button
            onClick={() => { useAuthStore.getState().logout(); router.push("/login"); }}
            className="px-4 py-2 text-gray-400 hover:text-white border border-gray-700 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {usage && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">AI Calls This Month</p>
              <p className="text-2xl font-bold text-white mt-1">{usage.monthly_ai_calls || 0}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Credits Balance</p>
              <p className="text-2xl font-bold text-white mt-1">{usage.credits_balance || 0}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className={`p-6 bg-gradient-to-br ${f.color} border border-gray-700 rounded-xl hover:scale-105 transition`}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold text-lg">{f.title}</h3>
              <p className="text-gray-300 text-sm mt-1">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
