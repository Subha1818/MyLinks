import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyLinks",
    short_name: "MyLinks",
    description: "Your link in bio, built your way.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F5F4EF",
    theme_color: "#D4E83A",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
