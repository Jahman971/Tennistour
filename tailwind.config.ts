import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0C0C0C",
        surface: "#1C1C1C",
        accent: "#D7E552",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#D94A35"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Barlow Condensed", "sans-serif"]
      },
      borderRadius: {
        card: "8px"
      }
    }
  },
  plugins: []
};

export default config;
