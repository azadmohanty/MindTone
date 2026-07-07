"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  ClipboardList, 
  TrendingUp, 
  Trash2, 
  UserCheck, 
  ShieldAlert, 
  RefreshCw, 
  Activity,
  Heart,
  Calendar,
  Search,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AssessmentRecord {
  id: string;
  fullName: string;
  date: string;
  phq9Score: number;
  anxiety7Score: number;
  finalDisorder: string;
  decision: string;
  pdfReportName: string | null;
  user: {
    name: string;
    email: string;
  };
}

interface AdminStats {
  totalUsers: number;
  totalAssessments: number;
  avgPhq: number;
  avgGad: number;
  decisions: Record<string, number>;
  disorders: Record<string, number>;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"analytics" | "users" | "records">("analytics");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/data");
      if (!res.ok) {
        throw new Error(await res.text() || "Failed to load admin dashboard data.");
      }
      const data = await res.json();
      setUsers(data.users);
      setAssessments(data.assessments);
      setStats(data.stats);
    } catch (e: any) {
      setError(e.message || "An error occurred while loading clinician metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    setActionLoadingId(userId);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_role", id: userId, role: newRole })
      });
      if (!res.ok) {
        throw new Error(await res.text() || "Failed to change user role.");
      }
      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      fetchData(); // Reload statistics
    } catch (e: any) {
      alert(e.message || "Role change failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm("Are you sure you want to permanently delete this assessment record? This will also remove the recorded audio files from disk. This action cannot be undone.")) return;

    setActionLoadingId(assessmentId);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_assessment", id: assessmentId })
      });
      if (!res.ok) {
        throw new Error(await res.text() || "Failed to delete assessment.");
      }
      // Update local state
      setAssessments(prev => prev.filter(a => a.id !== assessmentId));
      fetchData(); // Reload statistics
    } catch (e: any) {
      alert(e.message || "Record deletion failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredAssessments = assessments.filter(a => 
    a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.finalDisorder.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Loading Clinician Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Clinician Portal Error</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-indigo-500 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 font-sans max-w-6xl mx-auto">
      
      {/* 1. Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1.5">
              <ShieldAlert className="h-3 w-3" /> Secure Access
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-1">
            Clinician Panel
          </h1>
          <p className="text-xs text-slate-500 font-semibold pt-0.5">MindTone wellness audits, models oversight, and account metrics.</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* 2. Top-level Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Patients</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight pt-0.5">{stats.totalUsers}</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assessments Filed</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight pt-0.5">{stats.totalAssessments}</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-2xl">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg PHQ-9 Score</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight pt-0.5">{stats.avgPhq} <span className="text-xs text-slate-400 font-bold">/ 27</span></h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg GAD-7 Score</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight pt-0.5">{stats.avgGad} <span className="text-xs text-slate-400 font-bold">/ 21</span></h3>
            </div>
          </div>

        </div>
      )}

      {/* 3. Section Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: "analytics", label: "Analytics Overview", icon: TrendingUp },
          { id: "records", label: "Patient Check-in Logs", icon: ClipboardList },
          { id: "users", label: "User Audit & Roles", icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchTerm("");
              }}
              className={`flex items-center gap-2 px-6 py-4.5 font-bold text-xs uppercase tracking-wider border-b-2 transition duration-150 -mb-[2px] ${
                isActive 
                  ? "border-indigo-600 text-indigo-600 font-extrabold" 
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-350"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Views */}
      
      {/* 4A. Analytics Tab */}
      {activeTab === "analytics" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Diagnostic Outcome Splits */}
          <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Diagnosis Distribution</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Multimodal Joint Classifier Output splits</p>
            </div>
            
            <div className="space-y-4 pt-2">
              {Object.keys(stats.disorders).length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold py-4 text-center">No diagnostic logs recorded yet.</p>
              ) : (
                Object.entries(stats.disorders).map(([disorder, count]) => {
                  const pct = Math.round((count / stats.totalAssessments) * 100);
                  return (
                    <div key={disorder} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-650">
                        <span>{disorder}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-lg overflow-hidden border border-slate-200/30">
                        <div className="bg-indigo-500 h-full rounded-lg transition-all duration-300" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Fusion Engine Decision Pathways */}
          <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Fusion Decision Protocols</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fuses Tabular Questionnaire & Vocal Biomarker confidence</p>
            </div>
            
            <div className="space-y-4 pt-2">
              {Object.keys(stats.decisions).length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold py-4 text-center">No decision logs recorded yet.</p>
              ) : (
                Object.entries(stats.decisions).map(([decision, count]) => {
                  const pct = Math.round((count / stats.totalAssessments) * 100);
                  const isVerified = decision === "Verified by Audio" || decision === "Priority Clinical Screening";
                  return (
                    <div key={decision} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-650">
                        <span className="flex items-center gap-1.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${isVerified ? "bg-emerald-500" : "bg-indigo-550"}`} />
                          {decision}
                        </span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-lg overflow-hidden border border-slate-200/30">
                        <div className={`h-full rounded-lg transition-all duration-300 ${isVerified ? "bg-emerald-500" : "bg-indigo-550"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* 4B. Patient Check-in Logs Tab */}
      {activeTab === "records" && (
        <div className="bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm overflow-hidden p-6 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search logs by patient name, disorder, or assessment ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{filteredAssessments.length} logs found</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-slate-600 text-xs font-medium">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-4.5 px-4">Patient</th>
                  <th className="py-4.5 px-4">Date</th>
                  <th className="py-4.5 px-4">Scores</th>
                  <th className="py-4.5 px-4">Joint Diagnosis</th>
                  <th className="py-4.5 px-4">Decision Protocol</th>
                  <th className="py-4.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssessments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-bold uppercase">No matching check-in records found.</td>
                  </tr>
                ) : (
                  filteredAssessments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-4 space-y-0.5">
                        <p className="font-extrabold text-slate-900">{a.fullName}</p>
                        <p className="text-[10px] text-slate-400">{a.user.email}</p>
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-450" />
                          {new Date(a.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 space-y-1 text-[10px]">
                        <span className="inline-block px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold rounded">
                          PHQ-9: {a.phq9Score}
                        </span>
                        <span className="inline-block px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 font-bold rounded ml-2">
                          GAD-7: {a.anxiety7Score}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">{a.finalDisorder}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded border ${
                          a.decision === "Verified by Audio" || a.decision === "Priority Clinical Screening"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                            : "bg-indigo-50 border-indigo-100 text-indigo-750"
                        }`}>
                          {a.decision}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right flex items-center justify-end gap-3.5">
                        <Link
                          href={`/dashboard/report/${a.id}`}
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                          title="View detailed dashboard report"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                        <button
                          disabled={actionLoadingId === a.id}
                          onClick={() => handleDeleteAssessment(a.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition disabled:opacity-50"
                          title="Purge record & audio files from disk"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 4C. User Audit & Roles Tab */}
      {activeTab === "users" && (
        <div className="bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm overflow-hidden p-6 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search registered patients by name or email address..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{filteredUsers.length} users registered</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-slate-600 text-xs font-medium">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-4.5 px-4">User</th>
                  <th className="py-4.5 px-4">Register Date</th>
                  <th className="py-4.5 px-4">Role Status</th>
                  <th className="py-4.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-bold uppercase">No matching user registrations found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-4 space-y-0.5">
                        <p className="font-extrabold text-slate-900">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded border ${
                          u.role === "ADMIN" 
                            ? "bg-rose-50 border-rose-100 text-rose-700" 
                            : "bg-slate-150 border-slate-200 text-slate-650"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          disabled={actionLoadingId === u.id}
                          onClick={() => handleRoleChange(u.id, u.role)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded-lg transition disabled:opacity-50"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Toggle Role
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
