"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  Loader2, 
  Eye, 
  EyeOff, 
  Mail, 
  UserCircle, 
  LockKeyhole,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const rolePlaceholders: Record<string, string> = {
  admin: "you@radora.edu",
  teacher: "teacher@school.edu",
  student: "e.g. STU001",
};

export function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [roleType, setRoleType] = useState<"admin" | "teacher" | "student">("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Wizard State (Steps 1 -> 2 -> 3 -> 4)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2 | 3 | 4>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const result = await login(identifier, password, roleType);

      if (result.error) {
        setError(result.error);
      } else {
        if (roleType === "student") {
          router.push("/student-dashboard");
        } else if (roleType === "teacher") {
          router.push("/teacher-dashboard");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch {
      setError("Unable to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request Verification Code (OTP)
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError("Please enter your registered email address.");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setForgotError(data.error || "Failed to send verification code.");
      } else {
        setForgotSuccess(data.message || "Verification code sent!");
        setModalStep(2);
      }
    } catch (err: any) {
      setForgotError("Network error. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setForgotError("Please enter the complete 6-digit verification code.");
      return;
    }

    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: otpCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.resetToken) {
        setForgotError(data.error || "Invalid or expired OTP code.");
      } else {
        setResetToken(data.resetToken);
        setModalStep(3);
      }
    } catch (err: any) {
      setForgotError("Network error. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setForgotError("Please fill in both password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }

    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setForgotError(data.error || "Failed to reset password.");
      } else {
        setModalStep(4);
        setPassword(newPassword);
        if (!identifier) setIdentifier(forgotEmail);
        setTimeout(() => {
          setShowForgotModal(false);
        }, 2000);
      }
    } catch (err: any) {
      setForgotError("Network error. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Helper for Password Strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return null;
    if (pass.length < 6) return { label: "Too Short", color: "text-rose-500 bg-rose-50 border-rose-200" };
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
      return { label: "Strong", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    }
    return { label: "Medium", color: "text-amber-600 bg-amber-50 border-amber-200" };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="flex min-h-screen w-full bg-white selection:bg-indigo-100 selection:text-indigo-900" suppressHydrationWarning>
      {/* Left Branding Panel (Hidden on Mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex xl:w-[55%]">
        {/* Abstract Background Elements */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -right-20 bottom-0 h-[30rem] w-[30rem] rounded-full bg-violet-600/20 blur-[120px]" />
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2em0wIDJjNC40MTggMCA4LTMuNTgyIDgtOHMtMy41ODItOC04LTgtOCAzLjU4Mi04IDggMy41ODIgOCA4IDh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 mix-blend-overlay" />

        {/* Logo Header */}
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/logo/Next.png"
            alt="Radora Logo"
            width={48}
            height={48}
            className="object-cover rounded-xl shadow-xl shadow-indigo-500/20"
          />
          <span className="text-2xl font-bold tracking-tight text-white">
            Radora
          </span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Next-Generation OS for Education
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.1]">
              Elevate your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                academic journey.
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              Experience a seamlessly integrated platform designed to empower educators, engage students, and streamline administration with intelligent insights.
            </p>
          </motion.div>

          <motion.div 
            className="mt-12 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            {[
              "Real-time analytics and predictive grading",
              "AI-powered personalized tutoring for students",
              "Effortless parent-teacher communication channels"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                <span>{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-slate-500">
          © 2026 Radora Technologies Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full items-center justify-center p-8 sm:p-12 lg:w-1/2 xl:w-[45%]" suppressHydrationWarning>
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          suppressHydrationWarning
        >
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <Image
              src="/logo/Next.png"
              alt="Radora Logo"
              width={48}
              height={48}
              className="object-cover rounded-xl shadow-xl shadow-indigo-500/20"
            />
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              Radora
            </span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Please enter your details to access your portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
            {/* Role Toggle Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-1" suppressHydrationWarning>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setRoleType("admin")}
                className={`flex-1 rounded-md py-2.5 text-xs sm:text-sm font-medium transition-all ${
                  roleType === "admin" 
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setRoleType("teacher")}
                className={`flex-1 rounded-md py-2.5 text-xs sm:text-sm font-medium transition-all ${
                  roleType === "teacher" 
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Teacher
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setRoleType("student")}
                className={`flex-1 rounded-md py-2.5 text-xs sm:text-sm font-medium transition-all ${
                  roleType === "student" 
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Student
              </button>
            </div>

            {/* Input Fields */}
            <div className="space-y-4" suppressHydrationWarning>
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-medium text-slate-700">
                  {roleType === "student" ? "Roll Number" : "Email Address"}
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    {roleType === "student" ? <UserCircle className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                  </div>
                  <Input
                    id="identifier"
                    type={roleType === "student" ? "text" : "email"}
                    placeholder={rolePlaceholders[roleType] ?? "Enter your credentials"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-600 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  {roleType !== "student" && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(identifier.includes("@") ? identifier : "");
                        setModalStep(1);
                        setOtpCode("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setForgotError("");
                        setForgotSuccess("");
                        setShowForgotModal(true);
                      }}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-600 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-0.5 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            
            <p className="text-center text-sm text-slate-500 pt-4">
              By signing in, you agree to our{" "}
              <Link href="#" className="font-medium text-slate-900 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-medium text-slate-900 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </motion.div>
      </div>

      {/* ── Professional 3-Step Wizard Reset Password Dialog Modal ── */}
      <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
        <DialogContent className="max-w-md bg-white p-0 rounded-2xl shadow-2xl overflow-hidden border-0">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-6 text-white relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                {modalStep === 1 && <Mail className="h-5 w-5 text-white" />}
                {modalStep === 2 && <ShieldCheck className="h-5 w-5 text-white" />}
                {modalStep === 3 && <KeyRound className="h-5 w-5 text-white" />}
                {modalStep === 4 && <CheckCircle2 className="h-5 w-5 text-emerald-300" />}
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {modalStep === 1 && "Find Your Account"}
                  {modalStep === 2 && "Enter Verification Code"}
                  {modalStep === 3 && "Create New Password"}
                  {modalStep === 4 && "Password Reset Complete"}
                </h3>
                <p className="text-xs text-indigo-200">
                  {modalStep === 1 && "Step 1 of 3 — Email Verification"}
                  {modalStep === 2 && "Step 2 of 3 — 6-Digit OTP"}
                  {modalStep === 3 && "Step 3 of 3 — Secure Password"}
                  {modalStep === 4 && "Success"}
                </p>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            {modalStep <= 3 && (
              <div className="flex gap-1.5 mt-5">
                <div className={`h-1 flex-1 rounded-full transition-colors ${modalStep >= 1 ? "bg-white" : "bg-white/30"}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${modalStep >= 2 ? "bg-white" : "bg-white/30"}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${modalStep >= 3 ? "bg-white" : "bg-white/30"}`} />
              </div>
            )}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* ── STEP 1: Enter Email ── */}
              {modalStep === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleRequestOtp}
                  className="space-y-5"
                >
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enter your registered email address. We will generate a 6-digit verification code to reset your password safely.
                  </p>

                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email" className="text-xs font-medium text-slate-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="you@school.edu"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="pl-9 bg-slate-50 border-slate-200 h-10 text-sm focus-visible:ring-indigo-600"
                        autoFocus
                      />
                    </div>
                  </div>

                  {forgotError && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
                      {forgotError}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowForgotModal(false)}
                      className="text-xs text-slate-500"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-200"
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      ) : (
                        <ArrowRight className="h-4 w-4 mr-1.5" />
                      )}
                      Send Verification Code
                    </Button>
                  </div>
                </motion.form>
              )}

              {/* ── STEP 2: Enter OTP Verification Code ── */}
              {modalStep === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                >
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900">
                    A 6-digit verification code was sent to <strong className="font-semibold">{forgotEmail}</strong>.
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="otp-code" className="text-xs font-medium text-slate-700">
                      6-Digit Verification Code
                    </Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
                      <Input
                        id="otp-code"
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.trim())}
                        className="pl-9 font-mono tracking-widest text-base font-bold text-slate-900 bg-slate-50 border-slate-200 h-11 focus-visible:ring-indigo-600"
                        autoFocus
                      />
                    </div>
                  </div>

                  {forgotError && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
                      {forgotError}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotError("");
                        setModalStep(1);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" /> Change Email
                    </button>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRequestOtp}
                        disabled={forgotLoading}
                        className="text-xs text-slate-500"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Resend
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-200"
                        disabled={forgotLoading || otpCode.length < 6}
                      >
                        {forgotLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        ) : (
                          <ArrowRight className="h-4 w-4 mr-1.5" />
                        )}
                        Verify Code
                      </Button>
                    </div>
                  </div>
                </motion.form>
              )}

              {/* ── STEP 3: Create New Password ── */}
              {modalStep === 3 && (
                <motion.form
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleResetPassword}
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-500">
                    Code verified! Set your new password below.
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="new-password" className="text-xs font-medium text-slate-700">
                        New Password
                      </Label>
                      {strength && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${strength.color}`}>
                          {strength.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-9 pr-9 bg-slate-50 border-slate-200 h-10 text-sm focus-visible:ring-indigo-600"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password" className="text-xs font-medium text-slate-700">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Repeat new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-9 bg-slate-50 border-slate-200 h-10 text-sm focus-visible:ring-indigo-600"
                      />
                    </div>
                  </div>

                  {forgotError && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
                      {forgotError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowForgotModal(false)}
                      className="text-xs text-slate-500"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-200"
                      disabled={forgotLoading || !newPassword || newPassword !== confirmPassword}
                    >
                      {forgotLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      ) : (
                        <Check className="h-4 w-4 mr-1.5" />
                      )}
                      Reset Password
                    </Button>
                  </div>
                </motion.form>
              )}

              {/* ── STEP 4: Success State ── */}
              {modalStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center space-y-3"
                >
                  <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="h-6 w-6 stroke-[3]" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Password Reset Successfully!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Your password has been updated. We have pre-filled your password on the login screen.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
