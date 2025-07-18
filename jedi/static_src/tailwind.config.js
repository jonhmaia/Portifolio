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
}