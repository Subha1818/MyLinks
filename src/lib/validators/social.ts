import { z } from "zod";
import { getPlatform, isUrlForPlatform, resolveSocialUrl } from "../platforms";
import { isSafeHttpUrl } from "../safe-url";

export const SocialBlockSchema = z.object({
  platform: z
    .string()
    .trim()
    .refine((val) => !!getPlatform(val), {
      message: "Unknown or invalid platform",
    }),
  input: z
    .string()
    .trim()
    .min(1, "Username, handle, or link is required"),
}).transform((data, ctx) => {
  const platform = getPlatform(data.platform)!;
  const resolvedUrl = resolveSocialUrl(data.platform, data.input);

  if (!isSafeHttpUrl(resolvedUrl)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Please enter a valid URL or handle for ${platform.label}`,
      path: ["input"],
    });
    return z.NEVER;
  }

  if (!isUrlForPlatform(data.platform, resolvedUrl)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `That doesn't look like an ${platform.label} link.`,
      path: ["input"],
    });
    return z.NEVER;
  }

  let title = platform.label;
  if (data.platform === "website") {
    try {
      title = new URL(resolvedUrl).hostname.replace(/^www\./, "");
    } catch {
      title = "Website";
    }
  }

  return {
    platform: data.platform,
    url: resolvedUrl,
    title,
  };
});

export type SocialBlockInput = {
  platform: string;
  input: string;
};

