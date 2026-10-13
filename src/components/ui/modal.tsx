"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  className,
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      // Simple focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    // Initial focus into modal ONLY when opened (prioritize autofocus or input over close button)
    const timer = setTimeout(() => {
      if (modalRef.current) {
        // If an element inside modal already has focus, do not steal it
        if (modalRef.current.contains(document.activeElement)) return;

        const autoFocusEl = modalRef.current.querySelector<HTMLElement>("[autofocus]");
        const firstInput = modalRef.current.querySelector<HTMLElement>("input, textarea, select");
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (autoFocusEl || firstInput || firstFocusable)?.focus();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      {/* Backdrop click */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className={cn(
          "relative z-10 w-full bg-white rounded-[28px] border border-hairline shadow-2xl flex flex-col max-h-[90vh] overflow-hidden",
          maxWidthClasses,
          className
        )}
      >
        {/* Title bar (if title provided) */}
        {title && (
          <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-hairline flex items-center justify-between gap-4">
            <div>
              <h2
                id="modal-title"
                className="font-heading font-extrabold text-xl sm:text-2xl text-ink leading-tight"
              >
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-sm text-ink/70 font-medium">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-ink/50 hover:text-ink hover:bg-cream rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal content */}
        <div className="p-6 sm:p-8 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
