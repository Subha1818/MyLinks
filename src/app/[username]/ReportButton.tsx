"use client";

import { useState, useTransition } from "react";
import { Flag, X, Loader2, CheckCircle2 } from "lucide-react";
import { submitReportAction } from "@/server/actions/report";

export function ReportButton({ username }: { username: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setStatus("error");
      setMessage("Please select a reason.");
      return;
    }

    startTransition(async () => {
      const res = await submitReportAction({
        username,
        reason: reason as "spam" | "phishing_or_malware" | "impersonation" | "inappropriate" | "other",
        details,
        honeypot,
      });

      if (res.ok) {
        setStatus("success");
        setMessage("Thanks, we'll review this page.");
      } else {
        setStatus("error");
        setMessage(res.message || "An error occurred.");
      }
    });
  };

  const handleClose = () => {
    if (isPending) return;
    setIsOpen(false);
    setTimeout(() => {
      setStatus("idle");
      setMessage("");
      setReason("");
      setDetails("");
      setHoneypot("");
    }, 200);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-3 bg-white/80 backdrop-blur text-ink/50 hover:text-ink hover:bg-white border border-ink/10 rounded-full shadow-lg transition-all group focus:outline-none focus:ring-2 focus:ring-ink"
        aria-label="Report this page"
        title="Report this page"
      >
        <Flag className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm transition-opacity"
            onClick={handleClose}
          />
          
          <div 
            className="relative bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="report-title" className="text-xl font-heading font-extrabold text-ink">
                Report Page
              </h2>
              <button
                onClick={handleClose}
                className="p-2 text-ink/50 hover:text-ink hover:bg-ink/5 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {status === "success" ? (
              <div className="py-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center mb-4 text-forest">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="font-bold text-lg text-ink">{message}</p>
                <button
                  onClick={handleClose}
                  className="mt-6 w-full py-3 bg-ink text-white font-bold rounded-xl hover:bg-ink/90 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-ink">Why are you reporting this page?</label>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "spam", label: "Spam or misleading" },
                      { value: "phishing_or_malware", label: "Phishing or Malware" },
                      { value: "impersonation", label: "Impersonation" },
                      { value: "inappropriate", label: "Inappropriate content" },
                      { value: "other", label: "Other" },
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-3 p-3 rounded-xl border border-ink/10 hover:bg-ink/5 cursor-pointer transition-colors has-[:checked]:border-ink has-[:checked]:bg-ink/5">
                        <input
                          type="radio"
                          name="reason"
                          value={opt.value}
                          checked={reason === opt.value}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-4 h-4 text-ink focus:ring-ink"
                        />
                        <span className="text-sm font-medium text-ink/90">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label htmlFor="details" className="block text-sm font-bold text-ink">
                      Details (optional)
                    </label>
                    <span className="text-xs text-ink/50 font-medium">{details.length}/500</span>
                  </div>
                  <textarea
                    id="details"
                    rows={3}
                    maxLength={500}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full p-3 bg-cream border border-ink/10 rounded-xl text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/20 resize-none"
                    placeholder="Provide additional context..."
                  />
                </div>

                {/* Honeypot field */}
                <div className="hidden" aria-hidden="true">
                  <input
                    type="text"
                    name="phone"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm font-bold text-coral">{message}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isPending}
                    className="flex-1 py-3 px-4 font-bold text-ink hover:bg-ink/5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 py-3 px-4 bg-ink text-white font-bold rounded-xl hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
