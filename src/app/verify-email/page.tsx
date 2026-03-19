"use client";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) { setStatus("error"); return; }
    auth.verifyEmail(token)
      .then(() => { setStatus("success"); setTimeout(() => router.push("/login"), 3000); })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-white">Verifying your email...</h1>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
            <p className="text-gray-400 mt-2">Redirecting to login...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
            <p className="text-gray-400 mt-2">Invalid or expired token.</p>
            <button onClick={() => router.push("/login")} className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg">
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-white">Loading...</p></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
