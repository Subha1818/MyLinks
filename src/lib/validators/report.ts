import { z } from "zod";

export const ReportSchema = z.object({
  username: z.string().min(1, "Username is required"),
  reason: z.enum(["spam", "phishing_or_malware", "impersonation", "inappropriate", "other"], {
    message: "Please select a valid reason",
  }),
  details: z
    .string()
    .max(500, "Details must be at most 500 characters")
    .transform((val) => val.trim().replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, ""))
    .optional(),
  honeypot: z.string().max(0, "Invalid submission").optional(),
});

export type ReportInput = z.infer<typeof ReportSchema>;
