const flowbite = require("flowbite-react/tailwind");
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
  theme: {
    extend: {
      backgroundImage: {
        hero: "url('/src/assets/hero-background.png')",
      },
    },
  },
  plugins: [
    // ...
    require('tailwind-scrollbar-hide'),
    flowbite.plugin(),
  ],
};
