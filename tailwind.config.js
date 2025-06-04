/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'w-16', 'w-24', 'w-80', 'bg-white', 'shadow-lg', 'p-4', 'text-xl', 'font-bold', 
    'text-green-700', 'grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 
    'gap-4', 'border', 'rounded-md', 'px-3', 'py-2', 'bg-green-600', 'text-white'
  ]
}