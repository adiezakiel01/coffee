import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "#2b2420",
        card: {
          DEFAULT: "#f0e6da",
          title: "#3d2a1f",
          muted: "#6b5d50",
          faint: "#a89888",
          "card-ink": "#3d2a1f",
          "card-ink-muted": "#6b5d50",
        },
        accent: {
          DEFAULT: "#c89666",
          strong: "#d4a574",
          roast: "#8b5a2b",
        },
        ink: {
          DEFAULT: "#f5efe6",
          muted: "#a89888",
        },
      },
    },
  },
  plugins: [],
};

export default config;
