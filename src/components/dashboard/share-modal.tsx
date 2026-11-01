"use client";

import { useState, useEffect } from "react";
import { Copy, Check, QrCode, Download, Share2, ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, type ButtonProps } from "@/components/ui/button";
import { StarMark } from "@/components/brand/StarMark";
import { StarSpinner } from "@/components/brand/StarLoader";
import { getPublicUrl, getPublicUrlDisplay } from "@/lib/urls";
import {
  QR_COLOR_PRESETS,
  buildWhatsAppShareUrl,
  buildXShareUrl,
  buildTelegramShareUrl,
  buildEmailShareUrl,
} from "@/lib/share";

interface ShareModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ username, isOpen, onClose }: ShareModalProps) {
  const publicUrl = getPublicUrl(username);
  const publicUrlDisplay = getPublicUrlDisplay(username);

  const [selectedColor, setSelectedColor] = useState<string>(QR_COLOR_PRESETS[0].hex);
  const [centerStar, setCenterStar] = useState<boolean>(true);
  const [qrSvg, setQrSvg] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Feature detection for navigator.share (evaluated in browser)
  const canNativeShare =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function";

  const isGenerating = !qrSvg;

  // Dynamically import 'qrcode' ONLY when modal is open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    import("qrcode")
      .then((QRCode) => {
        return QRCode.toString(publicUrl, {
          type: "svg",
          margin: 4,
          errorCorrectionLevel: centerStar ? "H" : "M",
          color: {
            dark: selectedColor,
            light: "#FFFFFF",
          },
        });
      })
      .then((svg) => {
        if (isMounted) {
          setQrSvg(svg);
        }
      })
      .catch((err) => {
        console.error("[ShareModal] QR generation error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, publicUrl, selectedColor, centerStar]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[ShareModal] Failed to copy link:", err);
    }
  };

  const handleNativeShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({
        title: `${username}'s MyLinks`,
        text: `Check out ${username}'s links on MyLinks:`,
        url: publicUrl,
      });
    } catch {
      // User cancelled or share dismissed
    }
  };

  // Generate SVG string with or without center star
  const getFullSvgContent = (): string => {
    if (!qrSvg) return "";
    if (!centerStar) return qrSvg;

    // Center star overlay with white rounded background
    const starOverlay = `
      <g id="star-overlay">
        <rect x="39%" y="39%" width="22%" height="22%" rx="3%" ry="3%" fill="#FFFFFF" />
        <g transform="translate(42.5, 42.5) scale(0.15)">
          <svg viewBox="0 0 100 100" width="100" height="100">
            <path d="M50 0 C50 27.6 72.4 50 100 50 C72.4 50 50 72.4 50 100 C50 72.4 27.6 50 0 50 C27.6 50 50 27.6 50 0 Z" fill="${selectedColor}" />
          </svg>
        </g>
      </g>
    </svg>`;

    return qrSvg.replace("</svg>", starOverlay);
  };

  const handleDownloadSvg = () => {
    const fullSvg = getFullSvgContent();
    if (!fullSvg) return;

    const blob = new Blob([fullSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mylinks-${username}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    const fullSvg = getFullSvgContent();
    if (!fullSvg) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([fullSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.drawImage(img, 0, 0, 1024, 1024);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `mylinks-${username}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.src = url;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share your page" maxWidth="lg">
      <div className="space-y-5">
        {/* URL Pill + Copy Bar */}
        <div className="flex items-center justify-between gap-3 bg-cream border border-hairline rounded-2xl px-4 py-2.5">
          <span className="text-xs sm:text-sm font-mono text-ink/70 truncate select-all">
            {publicUrlDisplay}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            className="flex-shrink-0"
            aria-label="Copy link to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-forest" />
                <span className="text-forest">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
        <div aria-live="polite" className="sr-only">
          {copied ? "Link copied to clipboard" : ""}
        </div>

        {/* QR Code Card */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 bg-cream border border-hairline rounded-2xl p-4 sm:p-5">
          {/* QR Display Tile */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 bg-white rounded-2xl shadow-xs border border-hairline p-3 flex items-center justify-center shrink-0">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 text-ink/40">
                <StarSpinner className="w-6 h-6" />
                <span className="text-xs font-medium">Generating QR...</span>
              </div>
            ) : (
              <div
                className="w-full h-full relative flex items-center justify-center"
                role="img"
                aria-label={`QR code linking to ${publicUrl}`}
              >
                {/* Embedded SVG */}
                <div
                  className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />

                {/* Center Star Overlay (DOM layer preview) */}
                {centerStar && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="w-[18%] h-[18%] bg-white rounded-[22%] flex items-center justify-center shadow-xs">
                      <StarMark
                        width={22}
                        height={22}
                        className="transition-colors duration-200"
                        style={{ color: selectedColor }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* QR Customization Options */}
          <div className="flex-1 space-y-4 w-full">
            {/* Color Presets */}
            <div>
              <label className="block text-[11px] font-extrabold text-ink/70 uppercase tracking-wider mb-2">
                QR Color (Contrast &gt; 7:1)
              </label>
              <div
                role="radiogroup"
                aria-label="QR Code Color Presets"
                className="flex items-center gap-2 flex-wrap"
              >
                {QR_COLOR_PRESETS.map((preset) => {
                  const isSelected = selectedColor === preset.hex;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={preset.label}
                      onClick={() => setSelectedColor(preset.hex)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-transform cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-forest ring-offset-2 scale-110 border-white shadow-sm"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: preset.hex }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Center Star Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs sm:text-sm font-bold text-ink block">
                  Center star logo
                </span>
                <span className="text-[11px] text-ink/60">
                  Correction level: {centerStar ? "High (H)" : "Medium (M)"}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={centerStar}
                aria-label="Toggle center star logo in QR code"
                onClick={() => setCenterStar(!centerStar)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                  centerStar ? "bg-forest" : "bg-neutral-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    centerStar ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Download Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleDownloadPng}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold"
                aria-label="Download QR code as PNG"
              >
                <Download className="h-3.5 w-3.5" />
                <span>PNG (1024)</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleDownloadSvg}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold"
                aria-label="Download QR code as SVG"
              >
                <Download className="h-3.5 w-3.5" />
                <span>SVG Vector</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Share Channels */}
        <div className="space-y-2.5">
          <label className="block text-[11px] font-extrabold text-ink/70 uppercase tracking-wider">
            Share link directly
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {canNativeShare && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleNativeShare}
                className="col-span-2 sm:col-span-4 flex items-center justify-center gap-2 font-bold"
                aria-label="Share via system share menu"
              >
                <Share2 className="h-4 w-4" />
                <span>Share with apps...</span>
              </Button>
            )}

            <a
              href={buildWhatsAppShareUrl({
                url: publicUrl,
                text: `Check out ${username}'s links on MyLinks:`,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-hairline bg-white hover:bg-cream text-ink transition-colors shadow-2xs"
            >
              <span>WhatsApp</span>
              <ExternalLink className="h-3 w-3 text-ink/50" />
            </a>

            <a
              href={buildXShareUrl({
                url: publicUrl,
                text: `Check out ${username}'s links on MyLinks:`,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-hairline bg-white hover:bg-cream text-ink transition-colors shadow-2xs"
            >
              <span>X (Twitter)</span>
              <ExternalLink className="h-3 w-3 text-ink/50" />
            </a>

            <a
              href={buildTelegramShareUrl({
                url: publicUrl,
                text: `Check out ${username}'s links on MyLinks:`,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-hairline bg-white hover:bg-cream text-ink transition-colors shadow-2xs"
            >
              <span>Telegram</span>
              <ExternalLink className="h-3 w-3 text-ink/50" />
            </a>

            <a
              href={buildEmailShareUrl({
                url: publicUrl,
                title: `${username}'s MyLinks page`,
                text: `Check out ${username}'s MyLinks page: ${publicUrl}`,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-hairline bg-white hover:bg-cream text-ink transition-colors shadow-2xs"
            >
              <span>Email</span>
              <ExternalLink className="h-3 w-3 text-ink/50" />
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export interface ShareButtonProps {
  username: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  label?: string;
  className?: string;
  showQrIcon?: boolean;
}

export function ShareButton({
  username,
  variant = "secondary",
  size = "sm",
  label = "Share",
  className = "",
  showQrIcon = true,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 ${className}`}
        aria-label={`Share ${username}'s page and QR code`}
      >
        {showQrIcon && <QrCode className="h-4 w-4" />}
        <span>{label}</span>
      </Button>

      <ShareModal
        username={username}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
