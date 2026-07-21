import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Phone, MapPin, HeartPulse, Edit2, Save, X } from "lucide-react";
import { 
  useTeacherDeepStudentProfile, 
  useUpdateStudentProfile 
} from "@/features/students/services";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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

  // Form state
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");

  useEffect(() => {
    if (profile && !isEditing) {
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setBloodGroup(profile.bloodGroup || "");
      setGuardianName(profile.guardianName || "");
      setGuardianPhone(profile.guardianPhone || "");
    }
  }, [profile, isEditing]);

  const handleSave = () => {
    if (!rollNumber) return;
    updateProfile(
      {
        rollNumber,
        data: {
          phone,
          address,
          bloodGroup,
          guardianName,
          guardianPhone,
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
      <DialogContent className="max-w-md bg-white p-0 overflow-hidden shadow-xl rounded-xl">
        <DialogHeader className="p-6 pb-0 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-200">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-800">
                  {profile?.name || "Student Profile"}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs font-semibold bg-white border-slate-200">
                    Roll No: {rollNumber}
                  </Badge>
                  {profile?.status && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] uppercase">
                      {profile.status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {!isLoading && !isError && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? "text-slate-500 hover:text-slate-700 bg-slate-100" : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-1.5" /> Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-1.5" /> Edit
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-40 text-red-500 text-sm">
              Failed to load profile data.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Personal Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5 text-slate-600">
                      <Phone className="h-3.5 w-3.5 text-indigo-400" /> Phone
                    </Label>
                    {isEditing ? (
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-8 text-sm" />
                    ) : (
                      <div className="text-sm font-medium text-slate-800">{phone || "Not provided"}</div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5 text-slate-600">
                      <HeartPulse className="h-3.5 w-3.5 text-indigo-400" /> Blood Group
                    </Label>
                    {isEditing ? (
                      <Input value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="h-8 text-sm" />
                    ) : (
                      <div className="text-sm font-medium text-slate-800">{bloodGroup || "Not provided"}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5 text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" /> Address
                  </Label>
                  {isEditing ? (
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} className="h-8 text-sm" />
                  ) : (
                    <div className="text-sm font-medium text-slate-800 break-words">{address || "Not provided"}</div>
                  )}
                </div>
              </div>

              {/* Guardian Info */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Guardian Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Guardian Name</Label>
                    {isEditing ? (
                      <Input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className="h-8 text-sm" />
                    ) : (
                      <div className="text-sm font-medium text-slate-800">{guardianName || "Not provided"}</div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Guardian Phone</Label>
                    {isEditing ? (
                      <Input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} className="h-8 text-sm" />
                    ) : (
                      <div className="text-sm font-medium text-slate-800">{guardianPhone || "Not provided"}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} disabled={isUpdating} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
                {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
