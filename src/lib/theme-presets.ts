import { ThemeConfig } from "./theme";

export interface ThemePreset {
  id: string;
  name: string;
  theme: ThemeConfig;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "lime",
    name: "Lime",
    theme: {
      background: { type: "solid", value: "#D4E83A" },
      textColor: "#1F4D1A",
      button: {
        shape: "pill",
        style: "solid",
        fill: "#FFFFFF",
        textColor: "#14181F",
      },
      font: "bricolage",
      layout: { align: "center", avatarShape: "circle", spacing: "normal" },
    },
  },
  {
    id: "cobalt",
    name: "Cobalt",
    theme: {
      background: { type: "solid", value: "#2563D9" },
      textColor: "#FFFFFF",
      button: {
        shape: "pill",
        style: "solid",
        fill: "#FFFFFF",
        textColor: "#14181F",
      },
      font: "bricolage",
      layout: { align: "center", avatarShape: "circle", spacing: "normal" },
    },
  },
  {
    id: "maroon",
    name: "Maroon",
    theme: {
      background: { type: "solid", value: "#7A0A1E" },
      textColor: "#FBE9EC",
      button: {
        shape: "rounded",
        style: "solid",
        fill: "#EBC4EE",
        textColor: "#3B0A14",
      },
      font: "bricolage",
      layout: { align: "center", avatarShape: "circle", spacing: "normal" },
    },
  },
  {
    id: "lilac",
    name: "Lilac",
    theme: {
      background: { type: "solid", value: "#EBC4EE" },
      textColor: "#3B1A4A",
      button: {
        shape: "pill",
        style: "solid",
        fill: "#3B1A4A",
        textColor: "#FFFFFF",
      },
      font: "dm-sans",
      layout: { align: "center", avatarShape: "circle", spacing: "normal" },
    },
  },
  {
    id: "mustard",
    name: "Mustard",
    theme: {
      background: { type: "solid", value: "#E0A92E" },
      textColor: "#2A1B00",
      button: {
        shape: "rounded",
        style: "solid",
        fill: "#2A1B00",
        textColor: "#FFF4D6",
      },
      font: "bricolage",
      layout: { align: "center", avatarShape: "circle", spacing: "normal" },
    },
  },
  {
    id: "cream",
    name: "Cream",
    theme: {
      background: { type: "solid", value: "#F5F4EF" },
      textColor: "#14181F",
      button: {
        shape: "rounded",
        style: "outline",
        fill: "#14181F",
        textColor: "#14181F",
      },
      font: "dm-sans",
      layout: { align: "center", avatarShape: "circle", spacing: "normal" },
    },
  },
  {
    id: "forest",
    name: "Forest",
    theme: {
      background: { type: "solid", value: "#1F4D1A" },
      textColor: "#D4E83A",
      button: {
        shape: "pill",
        style: "solid",
        fill: "#D4E83A",
        textColor: "#1F4D1A",
      },
      font: "bricolage",
      layout: { align: "center", avatarShape: "circle", spacing: "normal" },
    },
  },
  {
    id: "tomato",
    name: "Tomato",
    theme: {
      background: { type: "solid", value: "#FF5A36" },
      textColor: "#14181F",
      button: {
        shape: "square",
        style: "hard-shadow",
        fill: "#FFFFFF",
        textColor: "#14181F",
      },
      font: "bricolage",
      layout: { align: "center", avatarShape: "circle", spacing: "normal" },
    },
  },
  {
    id: "mint",
    name: "Mint",
    theme: {
      background: { type: "solid", value: "#BFEBD6" },
      textColor: "#0F3D2E",
      button: {
        shape: "rounded",
        style: "solid",
        fill: "#0F3D2E",
        textColor: "#FFFFFF",
      },
      font: "dm-sans",
      layout: { align: "center", avatarShape: "circle", spacing: "normal" },
    },
  },
  {
    id: "ink",
    name: "Ink",
    theme: {
      background: { type: "solid", value: "#14181F" },
      textColor: "#FFFFFF",
      button: {
        shape: "pill",
        style: "solid",
        fill: "#FFFFFF",
        textColor: "#14181F",
      },
      font: "bricolage",
      layout: { align: "center", avatarShape: "circle", spacing: "normal" },
    },
  },
  // Step 5C new presets:
  {
    id: "polka",
    name: "Polka",
    theme: {
      background: {
        type: "pattern",
        base: "#BFEBD6",
        color: "#0F3D2E",
        kind: "dots",
        size: "medium",
      },
      textColor: "#0F3D2E",
      button: {
        shape: "rounded",
        style: "solid",
        fill: "#0F3D2E",
        textColor: "#FFFFFF",
      },
      font: "dm-sans",
      layout: { align: "center", avatarShape: "circle", spacing: "normal" },
    },
  },
  {
    id: "stripes",
    name: "Stripes",
    theme: {
      background: {
        type: "pattern",
        base: "#1D4ED8",
        color: "#FFFFFF",
        kind: "stripes",
        size: "medium",
      },
      textColor: "#FFFFFF",
      button: {
        shape: "pill",
        style: "hard-shadow",
        fill: "#FFFFFF",
        textColor: "#14181F",
      },
      font: "archivo",
      layout: { align: "center", avatarShape: "circle", spacing: "normal" },
    },
  },
  {
    id: "grid",
    name: "Grid",
    theme: {
      background: {
        type: "pattern",
        base: "#F5F4EF",
        color: "#14181F",
        kind: "grid",
        size: "small",
      },
      textColor: "#14181F",
      button: {
        shape: "rounded",
        style: "outline",
        fill: "#14181F",
        textColor: "#14181F",
      },
      font: "dm-mono",
      layout: { align: "center", avatarShape: "circle", spacing: "normal" },
    },
  },
  {
    id: "sunrise",
    name: "Sunrise",
    theme: {
      background: {
        type: "gradient",
        from: "#FFD84D",
        to: "#FF5A36",
        direction: "diagonal",
      },
      textColor: "#14181F",
      button: {
        shape: "pill",
        style: "solid",
        fill: "#FFFFFF",
        textColor: "#14181F",
      },
      font: "bricolage",
      layout: { align: "center", avatarShape: "circle", spacing: "normal" },
    },
  },
];
