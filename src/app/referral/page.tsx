

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function ReferralPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated]);

  const referralLink = "https://dacexy.vercel.app/register?ref=YOUR_CODE";

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Referral Program</h1>
          <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </button>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-white font-bold text-xl mb-2">Invite Friends, Earn Credits</h2>
          <p className="text-gray-400 mb-6">Share your referral link and earn credits when friends sign up.</p>
          <div className="flex gap-3">
            <input
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm"
            />
            <button
              onClick={copyLink}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-gray-400 text-sm mt-1">Total Referrals</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-gray-400 text-sm mt-1">Credits Earned</p>
          </div>
        </div>
      </div>
    </div>
  );
}
