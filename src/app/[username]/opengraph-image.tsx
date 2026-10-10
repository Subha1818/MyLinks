import { ImageResponse } from "next/og";
import { getPublicPageByUsername } from "@/server/services/public-page";
import { resolveTheme } from "@/lib/theme";
import { siteConfig } from "@/lib/site";
import fs from "fs";
import path from "path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Allowed avatar hosts for security
const ALLOWED_AVATAR_HOSTS = [
  "public.blob.vercel-storage.com",
  "lh3.googleusercontent.com",
];

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const page = await getPublicPageByUsername(username.toLowerCase());

  if (!page) {
    return new Response("Not Found", { status: 404 });
  }

  const theme = resolveTheme(page.theme);
  const displayName = page.displayName || page.username;

  // Truncate bio to ~90 chars
  let bio = "";
  if (page.bio) {
    const plain = page.bio.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, "").replace(/\s+/g, " ").trim();
    if (plain.length > 90) {
      bio = plain.slice(0, 89).trim() + "…";
    } else {
      bio = plain;
    }
  }

  // Determine avatar safety
  let safeAvatarUrl: string | null = null;
  if (page.avatarUrl) {
    try {
      const url = new URL(page.avatarUrl);
      // Check if hostname is directly allowed or ends with allowed blob domain
      if (
        ALLOWED_AVATAR_HOSTS.includes(url.hostname) ||
        url.hostname.endsWith(".public.blob.vercel-storage.com")
      ) {
        safeAvatarUrl = page.avatarUrl;
      }
    } catch {
      // Invalid URL
    }
  }

  // Load font
  let bricolageFont: ArrayBuffer | null = null;
  try {
    const fontData = fs.readFileSync(
      path.join(process.cwd(), "src/assets/fonts/BricolageGrotesque-Bold.ttf")
    );
    bricolageFont = fontData.buffer.slice(
      fontData.byteOffset,
      fontData.byteOffset + fontData.byteLength
    ) as ArrayBuffer;
  } catch (_e) {
    // Fall back to sans-serif
  }

  const initials = displayName.slice(0, 2).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.background.value,
          color: theme.textColor,
          padding: "80px",
          fontFamily: bricolageFont ? "Bricolage" : "sans-serif",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "200px",
            height: "200px",
            borderRadius: "100px",
            backgroundColor: theme.button.fill,
            color: theme.button.textColor,
            fontSize: "72px",
            fontWeight: "bold",
            marginBottom: "40px",
            overflow: "hidden",
          }}
        >
          {safeAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={safeAvatarUrl}
              width="200"
              height="200"
              alt={displayName}
              style={{ objectFit: "cover" }}
            />
          ) : (
            initials
          )}
        </div>

        <div
          style={{
            fontSize: "72px",
            fontWeight: "900",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}
        >
          {displayName}
        </div>

        <div
          style={{
            fontSize: "36px",
            fontWeight: "500",
            opacity: 0.8,
            marginBottom: bio ? "32px" : "0",
          }}
        >
          @{page.username}
        </div>

        {bio && (
          <div
            style={{
              fontSize: "32px",
              lineHeight: 1.4,
              opacity: 0.9,
              maxWidth: "800px",
            }}
          >
            {bio}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "40px",
            fontSize: "24px",
            fontWeight: "bold",
            opacity: 0.5,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {siteConfig.name}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: bricolageFont
        ? [
            {
              name: "Bricolage",
              data: bricolageFont,
              style: "normal",
              weight: 700,
            },
          ]
        : undefined,
    }
  );
}
