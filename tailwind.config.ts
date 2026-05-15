import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B35",
          50: "#FFF0EB",
          100: "#FFD6C8",
          200: "#FFB8A0",
          300: "#FF9A78",
          400: "#FF7C50",
          500: "#FF6B35",
          600: "#E05520",
          700: "#C04015",
          800: "#A03010",
          900: "#802508",
        },
      },
    },
  },
  plugins: [],
};

export default config;
