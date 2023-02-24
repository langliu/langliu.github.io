/** @type {import('tailwindcss').Config} */

module.exports = {
  mode: 'jit',
  darkMode: 'class',
  purge: {
    content: ['./public/**/*.html', './src/**/*.{astro,js,ts}'],
    options: {
      safelist: ['dark'],
    },
  },
  theme: {
    // theme extensions
  },
  plugins: [
    // plug-ins if any...
  ],
}
