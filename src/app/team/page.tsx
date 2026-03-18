

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { orgs } from "@/lib/api";

export default function TeamPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    orgs.getMembers().then(setMembers).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Members ({members.length})</h2>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <div className="space-y-3">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {m.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{m.full_name}</p>
                      <p className="text-gray-400 text-sm">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-indigo-900 text-indigo-300 rounded-full capitalize">
                      {m.role}
                    </span>
                    {m.is_verified && (
                      <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
