"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Hash, LockKeyhole, Eye as EyeIcon, EyeOff, CheckCircle2, AlertCircle, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCreateStudent } from "@/features/students/api";

export function CreateStudentModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState<{ name: string; rollNumber: string } | null>(null);
  const [formError, setFormError] = useState("");

  const createMutation = useCreateStudent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !rollNumber.trim() || !password) {
      setFormError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    try {
      const response = await createMutation.mutateAsync({
        name: name.trim(),
        rollNumber: rollNumber.trim().toUpperCase(),
        password,
      });

      // Update local storage so they appear in the admin's students table
      const stored = localStorage.getItem("radora_students");
      const studentsList = stored ? JSON.parse(stored) : [];

      const names = name.trim().split(" ");
      const firstName = names[0] || "Student";
      const lastName = names.slice(1).join(" ") || "";

      const newStudent = {
        id: response.userId || Date.now().toString(),
        firstName,
        lastName,
        name: name.trim(),
        email: `${rollNumber.trim().toLowerCase()}@radora.edu`,
        rollNumber: rollNumber.trim().toUpperCase(),
        class: "10", // default class
        section: "A", // default section
        status: "active",
        guardianName: "Guardian",
        guardianPhone: "+91 98765 43210",
      };

      localStorage.setItem("radora_students", JSON.stringify([newStudent, ...studentsList]));

      // Dispatch storage event to notify other components/tabs
      window.dispatchEvent(new Event("storage"));

      setSuccess({ name: name.trim(), rollNumber: rollNumber.trim().toUpperCase() });
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    }
  };

  const handleCreateAnother = () => {
    setSuccess(null);
    setName("");
    setRollNumber("");
    setPassword("");
    setFormError("");
    createMutation.reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Create Student Account</CardTitle>
                <CardDescription className="text-sm mt-0.5">
                  Student can use their roll number to log in.
                </CardDescription>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-5"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Account Created!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Student <span className="font-medium text-slate-700">{success.name}</span> can now log in with:
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 border p-4 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Roll Number</span>
                    <span className="font-mono font-bold text-indigo-700">{success.rollNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Password</span>
                    <span className="font-mono font-bold">{password}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Portal</span>
                    <span className="font-medium">Student Tab on Login</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={handleCreateAnother}>
                    Create Another
                  </Button>
                  <Button className="flex-1 bg-slate-900 hover:bg-slate-800" onClick={onClose}>
                    Done
                  </Button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="s-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="s-name"
                      placeholder="Kabir Singh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-11"
                    />
                  </div>
                </div>

                {/* Roll Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="s-roll">Roll Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="s-roll"
                      placeholder="e.g. STU001"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="pl-9 h-11 font-mono uppercase"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">This is used as the login identifier.</p>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="s-pwd">Login Password</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="s-pwd"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {formError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Student"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
