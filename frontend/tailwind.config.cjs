/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        ink: "#0C1020",
        slate: "#4B5165",
        stone: "#F6F1EA",
        paper: "#FFFBF6",
        mist: "#EEF1F7",
        brand: "#1E5EFF",
        accent: "#FF8A3D",
        danger: "#B42318",
        success: "#0F766E"
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 40px rgba(12, 16, 32, 0.12)"
      }
    }
  },
  plugins: []
};
