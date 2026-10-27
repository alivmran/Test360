/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zinc: {
          950: '#09090B', // Primary dark background
          925: '#121215', // Surface / Card / Panel
          900: '#18181B', // Elevated / Hover
          850: '#1F1F24',
          800: '#27272A', // Crisp 1px border
          700: '#3F3F46',
          600: '#52525B',
          500: '#71717A', // Muted text
          400: '#A1A1AA', // Secondary text
          300: '#D4D4D8',
          200: '#E4E4E7',
          100: '#F4F4F5',
          50: '#FAFAFA',  // Primary text
        },
        semantic: {
          emerald: '#10B981', // Passed / Mutant Killed / Healthy
          rose: '#F43F5E',    // Failed / Modified PR File / Defect Confirmed
          amber: '#F59E0B',   // Blast-Radius Affected / Self-Healing / Survived
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}
