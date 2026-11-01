import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#D4E83A",
          borderRadius: "50%",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="#1F4D1A"
        >
          <path d="M12 2L13.8 8.4L20.2 6.6L16 12L20.2 17.4L13.8 15.6L12 22L10.2 15.6L3.8 17.4L8 12L3.8 6.6L10.2 8.4L12 2Z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
