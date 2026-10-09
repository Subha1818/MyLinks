"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "./card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Check, Loader2 } from "lucide-react";
import { updateProfile } from "@/server/actions/profile";
import { profileSchema, ProfileInput } from "@/lib/validators/profile";

interface ProfileFormProps {
  initialData: {
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    username: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialData.displayName || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const hasChanges =
    displayName !== (initialData.displayName || "") ||
    bio !== (initialData.bio || "");

  // Prevent leaving page with unsaved changes
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

  // Handle successful save timeout
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
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setFieldErrors({});
    setGeneralError(null);
    setIsSaved(false);

    // Client-side validation
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
      // We don't need to manually update initialData because the server action
      // revalidates the path, which will refresh the server component and pass new props.
    } else {
      if (response.fieldErrors) setFieldErrors(response.fieldErrors);
      if (response.message) setGeneralError(response.message);
    }
  };

  const bioLength = bio.length;
  const bioIsMax = bioLength >= 160;

  return (
    <Card className="mb-8">
      <h2 className="font-heading font-bold text-xl text-ink mb-6">Profile</h2>
      
      <div className="flex flex-col gap-8">
        {/* Avatar Row */}
        <div className="flex items-center gap-6">
          {initialData.avatarUrl ? (
            <img
              src={initialData.avatarUrl}
              alt="Profile avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-ink/10"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-lime text-forest flex items-center justify-center font-bold text-2xl border-2 border-ink/10">
              {initialData.displayName?.[0]?.toUpperCase() || initialData.username[0].toUpperCase()}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <button
              disabled
              className="bg-cream border border-ink/10 text-ink/50 font-bold text-sm py-2 px-4 rounded-full cursor-not-allowed w-fit"
            >
              Change photo
            </button>
            <p className="text-xs text-ink/60 font-medium">
              Photo upload is coming soon
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <FormField
            id="displayName"
            label="Display Name"
            error={fieldErrors.displayName?.[0]}
          >
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              disabled={isSaving}
              maxLength={50}
            />
          </FormField>

          <FormField
            id="bio"
            label="Bio"
            error={fieldErrors.bio?.[0]}
          >
            <div className="relative">
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short bio about yourself..."
                disabled={isSaving}
                rows={3}
                className="resize-none"
                maxLength={160}
              />
              <div
                className={`absolute bottom-3 right-3 text-xs font-bold ${
                  bioIsMax ? "text-coral" : "text-ink/40"
                }`}
              >
                {bioLength}/160
              </div>
            </div>
          </FormField>

          {generalError && (
            <p className="text-sm text-coral font-medium" aria-live="polite">
              {generalError}
            </p>
          )}

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="inline-flex items-center justify-center min-w-[140px] gap-2 bg-ink text-cream font-bold py-3 px-6 rounded-full transition-all hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save changes"
              )}
            </button>
            
            {hasChanges && !isSaving && (
              <button
                onClick={handleReset}
                className="text-ink/60 hover:text-ink font-bold text-sm px-2 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded"
              >
                Reset
              </button>
            )}

            {isSaved && (
              <div
                className="inline-flex items-center gap-2 text-forest font-bold text-sm ml-auto animate-in fade-in slide-in-from-left-2"
                aria-live="polite"
              >
                <Check className="w-4 h-4" />
                <span>Saved</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
