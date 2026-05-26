import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(160 30% 4%)",
        foreground: "hsl(150 10% 96%)",
        card: "hsl(160 25% 8%)",
        primary: {
          DEFAULT: "hsl(152 76% 40%)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(160 20% 14%)",
          foreground: "hsl(150 8% 58%)",
        },
        destructive: "hsl(0 84% 60%)",
        border: "hsl(160 18% 18%)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
