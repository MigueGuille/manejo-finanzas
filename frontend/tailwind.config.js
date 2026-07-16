export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        surface: "#f6f7fb",
        line: "#d8dde8",
        mint: "#10b981",
        coral: "#ef6351",
        gold: "#f59e0b"
      },
      boxShadow: {
        panel: "0 16px 45px rgba(24, 33, 47, 0.08)"
      }
    }
  },
  plugins: []
};

