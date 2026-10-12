"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Avatar } from "@/components/ui/avatar";
import { Check, Upload, Trash2 } from "lucide-react";
import { StarSpinner } from "@/components/brand/StarLoader";
import { updateProfile, removeAvatar } from "@/server/actions/profile";
import { profileSchema } from "@/lib/validators/profile";
import { useRouter } from "next/navigation";
import { usePageDraft } from "./PageDraftProvider";

interface ProfileFormProps {
  initialData: {
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    username: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const { updateProfile: updateDraftProfile } = usePageDraft();

  const [displayName, setDisplayName] = useState(initialData.displayName || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Avatar states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Modal states
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const hasChanges =
    displayName !== (initialData.displayName || "") ||
    bio !== (initialData.bio || "");

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => setIsSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  const handleReset = () => {
    setDisplayName(initialData.displayName || "");
    setBio(initialData.bio || "");
    setFieldErrors({});
    setGeneralError(null);
    updateDraftProfile({
      displayName: initialData.displayName || "",
      bio: initialData.bio || "",
    });
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setFieldErrors({});
    setGeneralError(null);
    setIsSaved(false);

    const result = profileSchema.safeParse({ displayName, bio });
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    setIsSaving(true);
    const response = await updateProfile({ displayName, bio });
    setIsSaving(false);

    if (response.ok) {
      setIsSaved(true);
    } else {
      if (response.fieldErrors) setFieldErrors(response.fieldErrors);
      if (response.message) setGeneralError(response.message);
    }
  };

  // Avatar Handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check type and size (< 5MB)
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setAvatarError("Please select a JPEG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("File must be less than 5MB.");
      e.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowModal(true);
    e.target.value = "";
  };

  const processAndUpload = async () => {
    if (!imageRef.current) return;

    setIsUploading(true);
    setShowModal(false);
    setAvatarError(null);

    const img = imageRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Center crop to 512x512
      const size = Math.min(img.naturalWidth, img.naturalHeight);
      const startX = (img.naturalWidth - size) / 2;
      const startY = (img.naturalHeight - size) / 2;

      ctx.drawImage(img, startX, startY, size, size, 0, 0, 512, 512);
    }

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setAvatarError("Failed to process image.");
          setIsUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", blob, "avatar.webp");

        try {
          const res = await fetch("/api/upload/avatar", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.ok) {
            updateDraftProfile({ avatarUrl: data.url });
            router.refresh();
          } else {
            setAvatarError(data.message || "Failed to upload avatar.");
          }
        } catch {
          setAvatarError("Network error. Please try again.");
        } finally {
          setIsUploading(false);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      },
      "image/webp",
      0.85
    );
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove your profile photo?")) return;

    setIsRemoving(true);
    setAvatarError(null);
    const res = await removeAvatar();
    setIsRemoving(false);

    if (res.ok) {
      updateDraftProfile({ avatarUrl: null });
      router.refresh();
    } else {
      setAvatarError(res.message || "Failed to remove avatar.");
    }
  };

  const bioLength = bio.length;
  const bioIsMax = bioLength >= 160;

  return (
    <>
      <Card className="mb-6 p-4 sm:p-5">
        <h2 className="font-heading font-bold text-lg sm:text-xl text-ink mb-3 sm:mb-4">
          Profile
        </h2>

        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Avatar Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative group shrink-0">
              <Avatar
                src={initialData.avatarUrl}
                fallback={initialData.displayName || initialData.username}
                size="lg"
                className={isUploading || isRemoving ? "opacity-50" : ""}
              />
              {(isUploading || isRemoving) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <StarSpinner className="w-6 h-6 text-forest" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
                <Button
                  variant="secondary"
                  size="40px"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isRemoving}
                >
                  <Upload className="w-4 h-4" />
                  <span>Change photo</span>
                </Button>

                {initialData.avatarUrl && (
                  <Button
                    variant="ghost"
                    size="40px"
                    type="button"
                    onClick={handleRemove}
                    disabled={isUploading || isRemoving}
                    className="text-tomato hover:text-tomato hover:bg-tomato/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove photo</span>
                  </Button>
                )}
              </div>

              {avatarError && (
                <p className="text-xs font-bold text-tomato" aria-live="polite">
                  {avatarError}
                </p>
              )}
            </div>
          </div>

          {/* Inputs - 2 columns on sm+ to eliminate excessive width and blank space */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
            <FormField
              id="displayName"
              label="Display Name"
              error={fieldErrors.displayName?.[0]}
            >
              <Input
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  updateDraftProfile({ displayName: e.target.value });
                }}
                placeholder="Your name"
                disabled={isSaving}
                maxLength={50}
                className="py-2 px-3.5 text-sm sm:text-base"
              />
            </FormField>

            <FormField
              id="bio"
              label="Bio"
              labelRight={
                <span
                  className={`font-semibold ${
                    bioIsMax ? "text-tomato font-bold" : "text-ink/40"
                  }`}
                >
                  {bioLength}/160
                </span>
              }
              error={fieldErrors.bio?.[0]}
            >
              <Textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  updateDraftProfile({ bio: e.target.value });
                }}
                placeholder="A short bio about yourself..."
                disabled={isSaving}
                rows={2}
                className="resize-none py-2 px-3.5 text-sm sm:text-base min-h-[46px]"
                maxLength={160}
              />
            </FormField>
          </div>

          {generalError && (
            <p className="text-sm text-tomato font-bold" aria-live="polite">
              {generalError}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button
              variant="primary"
              size="40px"
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              isLoading={isSaving}
            >
              Save changes
            </Button>

            {hasChanges && !isSaving && (
              <Button
                variant="ghost"
                size="40px"
                type="button"
                onClick={handleReset}
              >
                Reset
              </Button>
            )}

            {isSaved && (
              <div
                className="inline-flex items-center gap-2 text-forest font-bold text-sm ml-auto animate-in fade-in slide-in-from-left-2"
                aria-live="polite"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Saved</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Upload Preview Modal */}
      <Modal
        isOpen={showModal && !!previewUrl}
        onClose={() => setShowModal(false)}
        title="Preview photo"
        maxWidth="sm"
      >
        <div className="flex justify-center mb-6">
          <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-hairline relative bg-cream shadow-inner">
            {previewUrl && (
              <img
                ref={imageRef}
                src={previewUrl}
                alt="Preview avatar"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="secondary"
            size="40px"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="40px"
            onClick={processAndUpload}
          >
            Use this photo
          </Button>
        </div>
      </Modal>
    </>
  );
}
