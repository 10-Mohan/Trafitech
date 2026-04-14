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
                'brand': {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    900: '#14532d',
                    'dark': '#050b14', // Main background
                    'panel': '#0f172a', // Card background
                    'blue': '#1a73e8', // Material Blue
                    'purple': '#9333ea', // Deep Purple
                    'green': '#34a853', // Material Green
                    'red': '#ea4335',   // Material Red
                    'yellow': '#fbbc04', // Material Yellow
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                // Removing neon shadows, keeping defaults
            },
            animation: {
                'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                }
            }
        },
    },
    plugins: [],
}
