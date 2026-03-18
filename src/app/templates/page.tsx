

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function TemplatesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated]);

  const templates = [
    { title: "Business Email", desc: "Professional email templates", icon: "📧" },
    { title: "Social Media Post", desc: "Engaging social content", icon: "📱" },
    { title: "Product Description", desc: "Convert visitors to buyers", icon: "🛍️" },
    { title: "Blog Article", desc: "SEO optimized blog posts", icon: "📝" },
    { title: "Sales Pitch", desc: "Compelling sales scripts", icon: "💼" },
    { title: "Customer Support", desc: "Professional support replies", icon: "🎯" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Templates</h1>
          <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((t) => (
            <button
              key={t.title}
              onClick={() => router.push("/chat")}
              className="p-6 bg-gray-900 border border-gray-800 hover:border-indigo-500 rounded-xl text-left transition"
            >
              <div className="text-3xl mb-3">{t.icon}</div>
              <h3 className="text-white font-semibold mb-1">{t.title}</h3>
              <p className="text-gray-400 text-sm">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
