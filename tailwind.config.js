/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // BrightSide warm palette
        cream: "#FFFBF5",
        charcoal: "#1A1814",
        peach: {
          DEFAULT: "#FFF5EB",
          light: "#F4D0C4",
        },
        coral: {
          DEFAULT: "#C45C3E",
          bright: "#E8644B",
        },
        amber: {
          DEFAULT: "#F4A261",
        },
        warmgrey: "#8A8178",
        borderlight: "#F0E6D8",
      },
      fontFamily: {
        display: ['Oranienbaum', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
        card: "16px",
        "card-lg": "20px",
        button: "32px",
        pill: "48px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 12px 32px rgba(232,100,75,0.08)",
        "card-hover": "0 16px 40px rgba(26,24,20,0.1)",
        featured: "0 20px 60px rgba(26,24,20,0.12)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "score-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "50%": { backgroundPosition: "0% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "shimmer-slide": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(50%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "score-pulse": "score-shimmer 4s ease-in-out infinite",
        "score-pulse-fast": "score-shimmer 2s ease-in-out infinite",
        "shimmer": "shimmer-slide 2.5s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
