import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} - ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          backgroundColor: "#D4E83A", // lime
          color: "#1F4D1A", // forest
          padding: "40px",
        }}
      >
        <div
          style={{
            fontSize: "160px",
            fontWeight: "900",
            letterSpacing: "-0.05em",
            lineHeight: 1,
            marginBottom: "20px",
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            fontSize: "48px",
            fontWeight: "600",
            opacity: 0.8,
            letterSpacing: "-0.02em",
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
