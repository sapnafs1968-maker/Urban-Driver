import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#142B45", // Deep Navy brand primary
          navyLight: "#1e3a5f",
          teal: "#13A89E", // Accent Teal
          tealLight: "#17c4b8",
          tealDark: "#0e7c75",
          softBlue: "#EAF2FF", // Secondary accent soft blue
          accent: "#10b981", // soft green
          accentLight: "#34d399",
          slate: "#F6F8FA", // Secondary background
          text: "#171A21", // Primary text
          textMuted: "#667085", // Secondary text
          amber: "#f59e0b",
          coral: "#ef4444"
        },
        senior: {
          bg: "#ffffff",
          card: "#f6f8fa",
          border: "#cbd5e1",
          text: "#171a21",
          btnPrimary: "#0e7c75",
          btnWarning: "#c2410c",
          btnSuccess: "#15803d"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        senior: ["var(--font-lexend)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
