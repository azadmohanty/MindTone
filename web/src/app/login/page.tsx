"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check credentials.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1115] flex flex-col justify-center items-center px-4 relative">
      
      {/* Main Container Card */}
      <div className="w-full max-w-md bg-[#161a22] border border-slate-800/80 rounded-2xl shadow-xl p-8 sm:p-10 relative z-10">
        
        {/* Header Block */}
        <div className="text-center space-y-2 mb-8">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-md border border-slate-700/50">
            Secure Portal
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight pt-2">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400">
            Sign in to access your assessment dashboard.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-medium mb-6">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@example.com"
              required
              className="w-full px-4 py-3 bg-[#0e1115] border border-slate-800 rounded-xl focus:border-[#5b7a61] focus:ring-1 focus:ring-[#5b7a61]/25 focus:outline-none transition duration-200 text-sm text-white"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-[#0e1115] border border-slate-800 rounded-xl focus:border-[#5b7a61] focus:ring-1 focus:ring-[#5b7a61]/25 focus:outline-none transition duration-200 text-sm text-white"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#5b7a61] hover:bg-[#4b6651] text-white font-bold text-xs rounded-xl transition duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-8 pt-6 border-t border-slate-800/40">
          <p className="text-xs text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-[#8fbc8f] hover:text-[#a9dfa9] font-bold transition"
            >
              Sign Up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
