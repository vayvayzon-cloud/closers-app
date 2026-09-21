import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: "#F97316",
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
        },
        surface: {
          DEFAULT: "#111111",
          50: "#1A1A1A",
          100: "#141414",
          200: "#0D0D0D",
          card: "#181818",
          border: "#2A2A2A",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(249, 115, 22, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
