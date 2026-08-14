"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, User, Phone, MapPin, HeartPulse, Edit2, Save, X,
  UserCircle, GraduationCap, Hash,
} from "lucide-react";
import {
  useTeacherDeepStudentProfile,
  useUpdateStudentProfile,
} from "@/features/students/services";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value || "—"}</p>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="h-8 text-sm"
      />
    </div>
  );
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
}

export function TeacherStudentProfileModal({
  rollNumber,
  open,
  onOpenChange,
}: {
  rollNumber: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: profile, isLoading, isError } = useTeacherDeepStudentProfile(rollNumber);
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateStudentProfile();
  const [isEditing, setIsEditing] = useState(false);

  // ── Form state (uses backend field names) ──
  const [address, setAddress]           = useState("");
  const [city, setCity]                 = useState("");
  const [state, setState]               = useState("");
  const [pincode, setPincode]           = useState("");
  const [parentName, setParentName]     = useState("");
  const [parentPhone, setParentPhone]   = useState("");
  const [parentEmail, setParentEmail]   = useState("");
  const [parentRelation, setParentRelation] = useState("");
  const [bloodGroup, setBloodGroup]     = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Populate form when profile loads (and reset on close/cancel)
  useEffect(() => {
    if (profile && !isEditing) {
      setAddress(profile.address || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setPincode(profile.pincode || "");
      setParentName(profile.parentName || "");
      setParentPhone(profile.parentPhone || "");
      setParentEmail(profile.parentEmail || "");
      setParentRelation(profile.parentRelation || "");
      setBloodGroup(profile.bloodGroup || "");
      setEmergencyPhone(profile.emergencyPhone || "");
    }
  }, [profile, isEditing]);

  // Reset editing state when modal closes
  useEffect(() => {
    if (!open) setIsEditing(false);
  }, [open]);

  const handleCancel = () => {
    setIsEditing(false);
    // re-populate from cached profile
    if (profile) {
      setAddress(profile.address || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setPincode(profile.pincode || "");
      setParentName(profile.parentName || "");
      setParentPhone(profile.parentPhone || "");
      setParentEmail(profile.parentEmail || "");
      setParentRelation(profile.parentRelation || "");
      setBloodGroup(profile.bloodGroup || "");
      setEmergencyPhone(profile.emergencyPhone || "");
    }
  };

  const handleSave = () => {
    if (!rollNumber) return;
    updateProfile(
      {
        rollNumber,
        data: {
          address: address || null,
          city: city || null,
          state: state || null,
          pincode: pincode || null,
          parentName: parentName || null,
          parentPhone: parentPhone || null,
          parentEmail: parentEmail || null,
          parentRelation: parentRelation || null,
          bloodGroup: bloodGroup || null,
          emergencyPhone: emergencyPhone || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Student profile updated successfully");
          setIsEditing(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update profile");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white p-0 overflow-hidden shadow-2xl rounded-2xl">
        {/* ── Header ── */}
        <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                <AvatarImage src={profile?.profilePhotoUrl || ""} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold text-sm">
                  {profile?.name ? getInitials(profile.name) : <UserCircle className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  {profile?.name || "Student Profile"}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-[10px] font-semibold bg-white border-slate-200 gap-1">
                    <Hash className="h-2.5 w-2.5" />{rollNumber}
                  </Badge>
                  {profile?.className && (
                    <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 gap-1">
                      <GraduationCap className="h-2.5 w-2.5" />Class {profile.className}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {!isLoading && !isError && (
              isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 shrink-0"
                >
                  <X className="h-4 w-4 mr-1.5" /> Cancel
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 shrink-0"
                >
                  <Edit2 className="h-4 w-4 mr-1.5" /> Edit
                </Button>
              )
            )}
          </div>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-40 text-red-500 text-sm gap-2">
              <p className="font-medium">Failed to load profile data.</p>
              <p className="text-xs text-slate-400">Check your connection and try again.</p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* ── Health Info ── */}
              <section className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <HeartPulse className="h-3 w-3 text-rose-400" /> Health
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {isEditing ? (
                    <>
                      <EditField label="Blood Group" value={bloodGroup} onChange={setBloodGroup} placeholder="e.g. B+" />
                      <EditField label="Emergency Phone" value={emergencyPhone} onChange={setEmergencyPhone} placeholder="+91 XXXXX" />
                    </>
                  ) : (
                    <>
                      <InfoRow label="Blood Group" value={bloodGroup} />
                      <InfoRow label="Emergency Phone" value={emergencyPhone} />
                    </>
                  )}
                </div>
              </section>

              {/* ── Address ── */}
              <section className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-indigo-400" /> Address
                </h4>
                {isEditing ? (
                  <div className="space-y-3">
                    <EditField label="Street Address" value={address} onChange={setAddress} placeholder="e.g. 123 MG Road" />
                    <div className="grid grid-cols-2 gap-3">
                      <EditField label="City" value={city} onChange={setCity} placeholder="Mumbai" />
                      <EditField label="State" value={state} onChange={setState} placeholder="Maharashtra" />
                    </div>
                    <EditField label="Pincode" value={pincode} onChange={setPincode} placeholder="400001" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><InfoRow label="Street Address" value={address} /></div>
                    <InfoRow label="City" value={city} />
                    <InfoRow label="State" value={state} />
                    <InfoRow label="Pincode" value={pincode} />
                  </div>
                )}
              </section>

              {/* ── Guardian / Parent ── */}
              <section className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="h-3 w-3 text-emerald-400" /> Guardian Details
                </h4>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <EditField label="Parent / Guardian Name" value={parentName} onChange={setParentName} placeholder="Full name" />
                    <EditField label="Relation" value={parentRelation} onChange={setParentRelation} placeholder="e.g. Father" />
                    <EditField label="Phone" value={parentPhone} onChange={setParentPhone} placeholder="+91 XXXXX" />
                    <EditField label="Email" value={parentEmail} onChange={setParentEmail} placeholder="parent@email.com" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Name" value={parentName} />
                    <InfoRow label="Relation" value={parentRelation} />
                    <InfoRow label="Phone" value={parentPhone} />
                    <InfoRow label="Email" value={parentEmail} />
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        {/* ── Save Footer ── */}
        {isEditing && (
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={isUpdating}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isUpdating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isUpdating ? (
                <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Saving…</>
              ) : (
                <><Save className="h-3.5 w-3.5 mr-2" />Save Changes</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
