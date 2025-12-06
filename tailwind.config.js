const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        corporate: {
          900: "#051342",
          800: "#202e5e",
        },
        success: {
          100: "#C9F9CD",
          200: "#96F3A6",
          300: "#5DDB80",
          400: "#33B765",
          500: "#068744",
          600: "#047445",
          700: "#036143",
          800: "#014E3D",
          900: "#014039",
        },
        // Columna 'rojo' de la tabla
        red: {
          100: "#F9D8D0",
          200: "#F3ABAA",
          300: "#DD6F6F",
          400: "#BB4752",
          500: "#8E192F",
          600: "#7A122F",
          700: "#660C2E",
          800: "#52072B",
          900: "#440428",
        },
        // Columna 'amarillo' de la tabla
        yellow: {
          100: "#FAEDC8",
          200: "#F6D794",
          300: "#E3B35C",
          400: "#C98C33",
          500: "#A55B01",
          600: "#8D4700",
          700: "#763600",
          800: "#5F2700",
          900: "#4F1D00",
        },
        blue: {
          50: "#f0f6fe",
          100: "#ddeafc",
          200: "#c3dbfa",
          300: "#9ac5f6",
          400: "#6ba6ef",
          500: "#4884e9",
          600: "#3367dd",
          700: "#2a53cb",
          800: "#2845a5",
          900: "#253e83",
          950: "#202e5e",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

module.exports = config;
