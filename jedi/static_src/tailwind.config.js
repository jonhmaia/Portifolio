/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../../../**/*.{html,js,py}',
    '../../../templates/**/*.html',
    '../../../**/templates/**/*.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        modern: {
          "primary": "#152026",
          "secondary": "#253840",
          "accent": "#516973",
          "neutral": "#92A4A6",
          "base-100": "#0D0D0D",
          "base-200": "#152026",
          "base-300": "#253840",
          "base-content": "#92A4A6",
          "info": "#516973",
          "success": "#516973",
          "warning": "#253840",
          "error": "#152026",
        },
      },
      "dark",
      "light",
    ],
  },
}