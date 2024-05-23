/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    transitionDuration: {
      DEFAULT: "200ms",
    },
    transitionTimingFunction: {
      DEFAULT: "ease-in-out",
    },
  },
  plugins: [],
};
