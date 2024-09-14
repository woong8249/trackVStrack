/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      textShadow: {
        // 커스텀 텍스트 그림자 정의
        default: '2px 2px 4px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.text-shadow': {
          'text-shadow': '2px 2px 4px rgba(0, 0, 0, 0.3)', // 기본 텍스트 그림자
        },
        '.text-shadow-md': {
          'text-shadow': '4px 4px 6px rgba(0, 0, 0, 0.5)', // 더 강한 텍스트 그림자
        },
        '.text-shadow-lg': {
          'text-shadow': '6px 6px 8px rgba(0, 0, 0, 0.7)', // 매우 강한 텍스트 그림자
        },
      });
    },
  ],
};
