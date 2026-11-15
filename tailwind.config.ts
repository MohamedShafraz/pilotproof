import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        paper: "#f4f1e8",
        moss: "#315c43",
        mint: "#dce9da",
        amber: "#e6a84a",
        coral: "#d9694c",
      },
      boxShadow: {
        card: "0 18px 50px rgba(39, 49, 42, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
