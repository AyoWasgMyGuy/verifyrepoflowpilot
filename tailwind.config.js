/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#13ecec',
        bgDark: '#102222',
        surfaceDark: '#1c2e2e',
        surfaceDarkAlt: '#253636',
        textSecondary: '#9db9b9',
        purpleAccent: '#8b5cf6',
      },
      borderRadius: {
        '2xl': 20,
      },
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
