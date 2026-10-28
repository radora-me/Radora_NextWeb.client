"use client";

import { useState } from "react";
import { AlertCircle, ArrowLeft, Loader2, Mail, Pencil, Save, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useAdminProfile, useUpdateAdminProfile, useUploadAdminProfilePhoto } from "@/features/admin/services/admin-profile.service";
import { useAuth } from "@/features/auth/context/auth-context";
import { ProfilePhoto } from "@/components/shared/profile-photo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function AdminProfile() {
  const { data: profile, isLoading, isError, refetch } = useAdminProfile();
  const { updateProfilePhoto } = useAuth();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateAdminProfile();
  const { mutate: uploadPhoto, isPending: isUploading } = useUploadAdminProfilePhoto();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (isLoading) return <div className="mx-auto max-w-3xl space-y-6"><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>;
  if (isError || !profile) return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-red-500"><AlertCircle className="h-10 w-10" /><p>Unable to load your profile.</p></div>;

  const save = () => updateProfile({ name, email }, {
    onSuccess: () => { toast.success("Profile updated"); setEditing(false); refetch(); },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Admin Profile</h1><p className="text-sm text-muted-foreground">Manage your account and profile picture.</p></div>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <ProfilePhoto name={profile.name} url={profile.profilePhotoUrl} size="lg" canUpload uploading={isUploading} onUpload={(file) => uploadPhoto(file, { onSuccess: (result) => { updateProfilePhoto(result.profilePhotoUrl || null); toast.success("Profile photo updated"); }, onError: (error) => toast.error(error.message) })} />
          <div className="space-y-2"><div className="flex items-center gap-2"><h2 className="text-xl font-semibold">{profile.name}</h2><Badge><ShieldCheck className="mr-1 h-3 w-3" /> Administrator</Badge></div><p className="text-sm text-muted-foreground">Your profile photo is stored securely in Cloudinary.</p></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Personal Information</CardTitle>{editing ? <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(false)}><X className="mr-1 h-4 w-4" />Cancel</Button><Button size="sm" onClick={save} disabled={isUpdating}>{isUpdating ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}Save</Button></div> : <Button variant="outline" size="sm" onClick={() => { setName(profile.name || ""); setEmail(profile.email || ""); setEditing(true); }}><Pencil className="mr-1 h-4 w-4" />Edit</Button>}</CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="admin-name">Full name</Label>{editing ? <Input id="admin-name" value={name} onChange={(event) => setName(event.target.value)} /> : <p className="font-medium">{profile.name}</p>}</div>
          <div className="space-y-2"><Label htmlFor="admin-email"><Mail className="mr-1 inline h-3.5 w-3.5" />Email</Label>{editing ? <Input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /> : <p className="font-medium">{profile.email}</p>}</div>
        </CardContent>
      </Card>
    </div>
  );
}
