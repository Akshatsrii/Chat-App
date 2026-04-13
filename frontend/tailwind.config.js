/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#060810",
        deep: "#0a0d16",
        surface: "#0f1520",
        panel: "#131a28",
        panel2: "#172030",
        border: "#1a2840",
        text: "#b8cde8",
        textDim: "#7a9cc4",
        textBright: "#e2eeff",
        cyan: "#00d4ff",
        emerald: "#00e5a0",
        amber: "#ffb800",
        rose: "#ff3366",
        violet: "#9966ff",
      },
      fontFamily: {
        mono: ["'Space Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};