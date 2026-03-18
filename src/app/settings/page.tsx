 

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { orgs } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const { user, org, isAuthenticated } = useAuthStore();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    orgs.listApiKeys().then(setApiKeys).catch(() => {});
  }, [isAuthenticated]);

  async function createKey() {
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      const data = await orgs.createApiKey(newKeyName);
      setNewKey(data.key);
      setNewKeyName("");
      orgs.listApiKeys().then(setApiKeys).catch(() => {});
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">Profile</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span className="text-white">{user?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Role</span>
              <span className="text-white capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email Verified</span>
              <span className={user?.is_verified ? "text-green-400" : "text-red-400"}>
                {user?.is_verified ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">Organization</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span className="text-white">{org?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Plan</span>
              <span className="text-white capitalize">{org?.plan_tier}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">API Keys</h2>
          {newKey && (
            <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg mb-4">
              <p className="text-green-300 text-sm font-mono break-all">{newKey}</p>
              <p className="text-green-400 text-xs mt-1">Copy this key — it won't be shown again</p>
            </div>
          )}
          <div className="flex gap-3 mb-4">
            <input
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="Key name"
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={createKey}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition"
            >
              Create
            </button>
          </div>
          <div className="space-y-2">
            {apiKeys.map((k) => (
              <div key={k.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-white text-sm">{k.name}</p>
                  <p className="text-gray-400 text-xs font-mono">{k.key_prefix}...</p>
                </div>
                <span className="text-gray-500 text-xs">{new Date(k.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {apiKeys.length === 0 && <p className="text-gray-500 text-sm">No API keys yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
