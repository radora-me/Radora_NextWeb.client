"use client";

import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type ProfilePhotoProps = {
  name: string;
  url?: string | null;
  size?: "sm" | "md" | "lg";
  canUpload?: boolean;
  uploading?: boolean;
  onUpload?: (file: File) => void;
};

const sizes = { sm: "h-12 w-12", md: "h-16 w-16", lg: "h-28 w-28" };

export function ProfilePhoto({ name, url, size = "md", canUpload = false, uploading = false, onUpload }: ProfilePhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const initials = name.split(" ").filter(Boolean).map((part) => part[0]).join("").toUpperCase().slice(0, 2) || "US";

  const selectFile = (file?: File) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) {
      toast.error("Choose a JPEG, PNG, WEBP, or GIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photo must be 5 MB or smaller.");
      return;
    }
    onUpload?.(file);
  };

  return (
    <>
      <div className="relative shrink-0">
        <button
          type="button"
          aria-label={`View ${name}'s profile photo`}
          onClick={() => url && setViewerOpen(true)}
          className={`${sizes[size]} rounded-full ${url ? "cursor-zoom-in" : "cursor-default"}`}
        >
          <Avatar className="h-full w-full shadow-sm">
            <AvatarImage src={url || ""} alt={`${name} profile`} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-bold">{initials}</AvatarFallback>
          </Avatar>
        </button>
        {canUpload && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                selectFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="Upload profile photo"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-background shadow"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </Button>
          </>
        )}
      </div>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-lg p-4">
          <DialogHeader>
            <DialogTitle>{name}&apos;s profile photo</DialogTitle>
          </DialogHeader>
          <div className="flex max-h-[70vh] items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-2">
            {url ? <img src={url} alt={`${name} profile`} className="max-h-[65vh] max-w-full rounded-lg object-contain" /> : <ImageIcon className="h-20 w-20 text-slate-300" />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
