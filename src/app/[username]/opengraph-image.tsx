import { ImageResponse } from "next/og";
import { getCachedPublicPage } from "@/server/services/public-page";
import { resolveTheme } from "@/lib/theme";
import fs from "fs";
import path from "path";

import sharp from "sharp";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Allowed avatar hosts for security
const ALLOWED_AVATAR_HOSTS = [
  "public.blob.vercel-storage.com",
  "lh3.googleusercontent.com",
];

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const page = await getCachedPublicPage(username.toLowerCase());

  // Load font if it exists
  let fontData: ArrayBuffer | null = null;
  try {
    const fontPath = path.join(process.cwd(), "src/assets/fonts/BricolageGrotesque-Bold.ttf");
    if (fs.existsSync(fontPath)) {
      const buffer = fs.readFileSync(fontPath);
      fontData = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    }
  } catch (err) {
    // ignore
  }

  if (!page) {
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
            backgroundColor: "#14181F",
            color: "#FFFFFF",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex", marginBottom: 16 }}>MyLinks</div>
          <div style={{ display: "flex", fontSize: 28, opacity: 0.7 }}>User not found</div>
        </div>
      ),
      { ...size }
    );
  }

  const theme = resolveTheme(page.theme);
  const displayName = page.displayName || page.username;

  let bio = "";
  if (page.bio) {
    const plain = page.bio.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, "").replace(/\s+/g, " ").trim();
    if (plain.length > 90) {
      bio = plain.slice(0, 89).trim() + "…";
    } else {
      bio = plain;
    }
  }

  let finalAvatarDataUri: string | null = null;
  if (page.avatarUrl) {
    try {
      const url = new URL(page.avatarUrl);
      if (
        ALLOWED_AVATAR_HOSTS.includes(url.hostname) ||
        url.hostname.endsWith(".public.blob.vercel-storage.com")
      ) {
        // Fetch the avatar on the server with 3s timeout and 1MB size cap
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(page.avatarUrl, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          if (arrayBuffer.byteLength <= 1024 * 1024) { // 1MB cap
            // Convert to PNG with sharp
            const pngBuffer = await sharp(Buffer.from(arrayBuffer))
              .resize(160, 160)
              .png()
              .toBuffer();
            finalAvatarDataUri = `data:image/png;base64,${pngBuffer.toString("base64")}`;
          }
        }
      }
    } catch (e) {
      // Fallback to initials if anything fails
    }
  }

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
          padding: 80,
          textAlign: "center",
          fontFamily: fontData && theme.font === "bricolage" ? '"Bricolage"' : "sans-serif",
        }}
      >
        {finalAvatarDataUri ? (
          <img
            src={finalAvatarDataUri}
            alt=""
            width="160"
            height="160"
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              marginBottom: 24,
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: theme.button.fill,
              color: theme.button.textColor,
              fontSize: 64,
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            {(displayName || username).slice(0, 2).toUpperCase()}
          </div>
        )}

        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {page?.displayName || username}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 32,
            opacity: 0.8,
            marginBottom: 16,
          }}
        >
          @{page?.username || username}
        </div>

        {page?.bio ? (
          <div
            style={{
              display: "flex",
              fontSize: 28,
              opacity: 0.9,
              maxWidth: 800,
            }}
          >
            {page.bio}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 22,
            fontWeight: 700,
            opacity: 0.5,
            letterSpacing: 2,
          }}
        >
          MYLINKS
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "Bricolage",
              data: fontData,
              weight: 700,
              style: "normal",
            },
          ]
        : undefined,
    }
  );
}
