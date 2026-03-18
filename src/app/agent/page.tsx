 

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { agent } from "@/lib/api";

export default function AgentPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [task, setTask] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    agent.listTasks().then(setTasks).catch(() => {});
  }, [isAuthenticated]);

  async function handleRun() {
    if (!task.trim() || loading) return;
    setLoading(true);
    setResult("");
    try {
      const data = await agent.run(task, context || undefined);
      setResult(data.result || "Task completed");
      agent.listTasks().then(setTasks).catch(() => {});
    } catch (err: any) {
      setResult("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">AI Agent</h1>
          <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">Run a Task</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Task Description</label>
              <textarea
                value={task}
                onChange={e => setTask(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 h-24 resize-none"
                placeholder="Describe what you want the AI agent to do..."
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Context (optional)</label>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 h-20 resize-none"
                placeholder="Any additional context..."
              />
            </div>
            <button
              onClick={handleRun}
              disabled={loading || !task.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition font-semibold"
            >
              {loading ? "Running..." : "Run Agent"}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-3">Result</h2>
            <p className="text-gray-300 whitespace-pre-wrap text-sm">{result}</p>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">Recent Tasks</h2>
            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300 text-sm">{t.task_type}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    t.status === "completed" ? "bg-green-900 text-green-300" :
                    t.status === "failed" ? "bg-red-900 text-red-300" :
                    "bg-yellow-900 text-yellow-300"
                  }`}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
