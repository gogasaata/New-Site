import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F8F7F3",
        ink: "#141414",
        wine: { DEFAULT: "#8B0D1E", dark: "#6F0A18" },
        slate2: "#4A4A4A",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: { eyebrow: "0.32em", nav: "0.08em" },
    },
  },
  plugins: [],
};
export default config;
