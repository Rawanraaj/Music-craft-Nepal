/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        mcn: {
          blue: '#1A1A1A',
          'blue-dark': '#000000',
          'blue-light': '#333333',
          mint: '#3DDC97',
          'mint-dark': '#2bc783',
          red: '#D0021B',
          'red-dark': '#a80115',
          dark: '#111111',
          'charcoal': '#1A1A1A',
          'gray-50': '#f8f9fa',
          'gray-100': '#f1f3f5',
          'gray-200': '#e9ecef',
          'gray-300': '#dee2e6',
          'gray-400': '#adb5bd',
          'gray-500': '#868e96',
          'gray-600': '#495057',
          'gray-700': '#343a40',
          'gray-800': '#212529',
          'gray-900': '#1A1A1A',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'carousel-fade': 'carouselFade 1s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        carouselFade: {
          '0%': { opacity: '0.4' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
};
