"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Loader2,
  Mail,
  User,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Registration failed.");
      }

      // Registration successful
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Unable to connect to the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Left Branding Panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex xl:w-[55%]">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -right-20 bottom-0 h-[30rem] w-[30rem] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2em0wIDJjNC40MTggMCA4LTMuNTgyIDgtOHMtMy41ODItOC04LTgtOCAzLjU4Mi04IDggMy41ODIgOCA4IDh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 mix-blend-overlay" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Radora</span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 backdrop-blur-sm">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin Registration Portal
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.1]">
              Set up your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                admin account.
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              This page creates the master admin credential for the Radora school management system. Only share this URL with your system administrator.
            </p>
          </motion.div>

          <motion.div
            className="mt-12 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            {[
              "Full access to all admin controls",
              "Manage teachers and student accounts",
              "Configure school settings and policies",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © 2026 Radora Technologies Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full items-center justify-center p-8 sm:p-12 lg:w-1/2 xl:w-[45%]">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">Radora</span>
          </div>

          {success ? (
            // ── Success State ──────────────────────────────────
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 bg-emerald-50 p-8 rounded-2xl border border-emerald-100"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Admin Account Created!</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Your admin account for <span className="font-medium text-slate-700">{email}</span> has been successfully created. You can now sign in to the Admin Portal.
                </p>
              </div>
              <Link href="/login">
                <Button className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10">
                  Go to Login
                </Button>
              </Link>
            </motion.div>
          ) : (
            // ── Registration Form ──────────────────────────────
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 mb-4">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin Access Only
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create Admin Account</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Register the master administrator account for your school.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Full Name
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <User className="h-5 w-5" />
                    </div>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Dr. Sanjay Gupta"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-600 h-12"
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@yourschool.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-600 h-12"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <LockKeyhole className="h-5 w-5" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-600 h-12"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <LockKeyhole className="h-5 w-5" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-600 h-12"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100"
                    >
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-0.5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Admin Account...
                    </>
                  ) : (
                    "Create Admin Account"
                  )}
                </Button>

                <p className="text-center text-sm text-slate-500 pt-2">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-slate-900 hover:underline">
                    Sign in instead
                  </Link>
                </p>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
