"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { getPublicUrl } from "@/lib/urls";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({
  username,
  variant = "primary",
  size = "40px",
  className,
}: {
  username: string;
  variant?: "primary" | "accent" | "secondary" | "ghost";
  size?: "40px" | "48px" | "sm" | "md";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getPublicUrl(username));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
    >
      {copied ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
      <span>{copied ? "Copied!" : "Copy link"}</span>
    </Button>
  );
}
