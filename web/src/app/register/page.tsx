"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setSuccess("Account registered! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
            Create Account
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight pt-2">
            Get Started
          </h2>
          <p className="text-xs text-slate-400">
            Create an account to begin assessments.
          </p>
        </div>

        {/* Status Notifications */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-medium mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-medium mb-6">
            {success}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name Input */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              required
              className="w-full px-4 py-3 bg-[#0e1115] border border-slate-800 rounded-xl focus:border-[#5b7a61] focus:ring-1 focus:ring-[#5b7a61]/25 focus:outline-none transition duration-200 text-sm text-white"
            />
          </div>

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
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Password (6+ chars)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-[#0e1115] border border-slate-800 rounded-xl focus:border-[#5b7a61] focus:ring-1 focus:ring-[#5b7a61]/25 focus:outline-none transition duration-200 text-sm text-white"
            />
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-[#0e1115] border border-slate-800 rounded-xl focus:border-[#5b7a61] focus:ring-1 focus:ring-[#5b7a61]/25 focus:outline-none transition duration-200 text-sm text-white"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-[#5b7a61] hover:bg-[#4b6651] text-white font-bold text-xs rounded-xl transition duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-8 pt-6 border-t border-slate-800/40">
          <p className="text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#8fbc8f] hover:text-[#a9dfa9] font-bold transition"
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
