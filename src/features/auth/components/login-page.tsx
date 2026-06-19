"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const rolePlaceholders: Record<string, string> = {
  admin: "you@radora.edu",
  teacher: "teacher@school.edu",
  student: "e.g. STU001",
};

export function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [roleType, setRoleType] = useState<"admin" | "teacher" | "student">("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        roleType,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please verify your details.");
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

  return (
    <div className="flex min-h-screen w-full bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Left Branding Panel (Hidden on Mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex xl:w-[55%]">
        {/* Abstract Background Elements */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -right-20 bottom-0 h-[30rem] w-[30rem] rounded-full bg-violet-600/20 blur-[120px]" />
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2em0wIDJjNC40MTggMCA4LTMuNTgyIDgtOHMtMy41ODItOC04LTgtOCAzLjU4Mi04IDggMy41ODIgOCA4IDh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 mix-blend-overlay" />

        {/* Logo Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
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
      <div className="flex w-full items-center justify-center p-8 sm:p-12 lg:w-1/2 xl:w-[45%]">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Toggle Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
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
            <div className="space-y-4">
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
                  <Link href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </Link>
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
              className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-0.5"
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
    </div>
  );
}
