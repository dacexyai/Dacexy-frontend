 

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { billing } from "@/lib/api";

export default function BillingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    Promise.all([billing.getPlans(), billing.getUsage()])
      .then(([p, u]) => { setPlans(p); setUsage(u); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  async function handleUpgrade(plan_tier: string) {
    try {
      const order = await billing.createOrder(plan_tier);
      if (order.message) {
        alert(order.message);
      } else if (order.order_id) {
        alert("Order created: " + order.order_id + ". Payment integration coming soon.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Billing & Plans</h1>
          <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </button>
        </div>

        {usage && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-white font-semibold mb-4">Current Usage</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Current Plan</p>
                <p className="text-white font-bold capitalize">{usage.plan_tier}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">AI Calls</p>
                <p className="text-white font-bold">{usage.monthly_ai_calls}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Credits</p>
                <p className="text-white font-bold">{usage.credits_balance}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-center">Loading plans...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className={`p-6 rounded-xl border ${plan.id === "growth" ? "border-indigo-500 bg-indigo-900/20" : "border-gray-800 bg-gray-900"}`}>
                {plan.id === "growth" && (
                  <div className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full inline-block mb-3">Popular</div>
                )}
                <h3 className="text-white font-bold text-xl">{plan.name}</h3>
                <p className="text-3xl font-bold text-white mt-2">
                  {plan.price_inr === 0 ? "Free" : `₹${plan.price_inr}`}
                  {plan.price_inr > 0 && <span className="text-gray-400 text-sm font-normal">/mo</span>}
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f: string) => (
                    <li key={f} className="text-gray-300 text-sm flex items-center gap-2">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {plan.id !== "free" && (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-semibold"
                  >
                    Upgrade to {plan.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
