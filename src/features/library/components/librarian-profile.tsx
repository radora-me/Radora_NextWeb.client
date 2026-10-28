"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Loader2, BookMarked, Pencil, Check, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";
import { ProfilePhoto } from "@/components/shared/profile-photo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useLibraryAdminOverview } from "@/features/library/services/library.service";

interface LibrarianProfileData { id: string; name: string; email: string; address: string | null; profilePhotoUrl: string | null; role: string; }

function useLibrarianProfile() {
  return useQuery<LibrarianProfileData>({
    queryKey: ["librarian-profile"],
    queryFn: () => fetchJsonWithAuth("/auth/librarian/me"),
  });
}

function useUpdateLibrarianProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name?: string; address?: string }) => {
      const res = await fetchWithAuth("/auth/librarian/me", { method: "PATCH", body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");
      return json as LibrarianProfileData;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["librarian-profile"] }),
  });
}

function useUploadLibrarianPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData(); body.append("photo", file);
      const res = await fetchWithAuth("/auth/profile/photo", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      return json as { profilePhotoUrl: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["librarian-profile"] }),
  });
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function LibrarianProfile() {
  const { user, updateProfilePhoto } = useAuth();
  const { data: profile, isLoading, isError } = useLibrarianProfile();
  const { data: overview } = useLibraryAdminOverview();
  const { mutate: update, isPending: isUpdating } = useUpdateLibrarianProfile();
  const { mutate: uploadPhoto, isPending: isUploading } = useUploadLibrarianPhoto();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (profile) { setName(profile.name); setAddress(profile.address || ""); }
  }, [profile]);

  const handleSave = () => {
    update({ name: name.trim(), address: address.trim() }, {
      onSuccess: () => { toast.success("Profile updated"); setEditing(false); },
      onError: (err: any) => toast.error(err.message),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 p-6">
        <div className="rounded-xl border bg-card p-8 space-y-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-32" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center text-red-500 bg-red-50 p-8 rounded-xl m-6 border border-red-100">
        <AlertCircle className="h-10 w-10 mb-3" />
        <h2 className="text-xl font-bold">Error loading profile</h2>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="p-6 space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-start gap-4">
        <ProfilePhoto
          name={profile.name}
          url={profile.profilePhotoUrl || user?.image}
          canUpload
          uploading={isUploading}
          onUpload={(file) => uploadPhoto(file, {
            onSuccess: (r) => { updateProfilePhoto(r.profilePhotoUrl); toast.success("Photo updated"); },
            onError: (err: any) => toast.error(err.message),
          })}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Librarian</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{profile.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-amber-100 bg-gradient-to-br from-amber-50 to-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2"><BookMarked className="h-4 w-4 text-amber-600" /></div>
            <div><p className="text-xs text-amber-800/70 font-medium">Total Books</p><p className="text-lg font-bold text-amber-900">{overview?.totalBooks ?? "—"}</p></div>
          </div>
        </Card>
        <Card className="p-4 border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2"><Mail className="h-4 w-4 text-blue-600" /></div>
            <div><p className="text-xs text-blue-800/70 font-medium">Currently Issued</p><p className="text-lg font-bold text-blue-900">{overview?.totalIssued ?? "—"}</p></div>
          </div>
        </Card>
        <Card className="p-4 border-red-100 bg-gradient-to-br from-red-50 to-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2"><MapPin className="h-4 w-4 text-red-600" /></div>
            <div><p className="text-xs text-red-800/70 font-medium">Overdue</p><p className="text-lg font-bold text-red-900">{overview?.overdueCount ?? "—"}</p></div>
          </div>
        </Card>
      </div>

      {/* Personal Info */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Personal Information</CardTitle>
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs hover:bg-muted">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={isUpdating}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs text-white disabled:opacity-60">
                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
              </button>
              <button onClick={() => { setEditing(false); setName(profile.name); setAddress(profile.address || ""); }}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs hover:bg-muted">
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                <input value={profile.email} disabled
                  className="w-full h-9 rounded-lg border bg-muted px-3 text-sm text-muted-foreground" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address"
                  className="w-full h-9 rounded-lg border bg-background px-3 text-sm outline-none ring-primary focus:ring-2" />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoField label="Full Name" value={profile.name} />
                <InfoField label="Email Address" value={profile.email} />
              </div>
              <Separator className="bg-slate-100" />
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-slate-700">
                  <MapPin className="h-4 w-4 text-slate-400" /> Address
                </h3>
                <p className="text-sm text-slate-600">{profile.address || "—"}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
