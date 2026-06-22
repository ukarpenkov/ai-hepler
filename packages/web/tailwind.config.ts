import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          dark: "#818cf8",
        },
        surface: {
          bg: "var(--bg-primary)",
          card: "var(--bg-secondary)",
          secondary: "var(--glass-bg)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
      },
      borderRadius: {
        glass: "24px",
        card: "16px",
        button: "16px",
      },
      backdropBlur: {
        glass: "30px",
      },
      boxShadow: {
        glass: "0 20px 60px var(--shadow)",
        button: "0 8px 25px rgba(99, 102, 241, 0.3)",
      },
      animation: {
        "slide-up": "slideUp 0.6s ease",
        float: "float 20s infinite ease-in-out",
        "slide-up-bottom-sheet": "slideUpBottomSheet 0.3s ease-in-out",
        "slide-down-bottom-sheet": "slideDownBottomSheet 0.3s ease-in-out",
        "fade-in-overlay": "fadeInOverlay 0.3s ease",
      },
      keyframes: {
        slideUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -30px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
        slideUpBottomSheet: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        slideDownBottomSheet: {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
        fadeInOverlay: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
