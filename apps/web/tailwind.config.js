/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        desert: {
          dark: '#07090E',
          card: '#111625',
          border: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(59, 130, 246, 0.3)',
          yellow: '#FFE600',
          cyan: '#00F0FF',
          magenta: '#FF2E93',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
