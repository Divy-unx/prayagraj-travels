/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',
          400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',
          800:'#1e40af',900:'#1e3a8a',950:'#172554',
        },
        accent: {
          50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',
          400:'#fb923c',500:'#f97316',600:'#ea580c',700:'#c2410c',
        },
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
      backgroundImage: {
        'hero-grad':'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 50%,#2563eb 100%)',
        'card-grad':'linear-gradient(145deg,rgba(255,255,255,.9),rgba(255,255,255,.7))',
        'orange-grad':'linear-gradient(135deg,#f97316,#ea580c)',
      },
      boxShadow: {
        card:'0 4px 20px -4px rgba(0,0,0,.08),0 1px 3px rgba(0,0,0,.05)',
        'card-hover':'0 16px 40px -8px rgba(37,99,235,.15),0 4px 12px rgba(0,0,0,.08)',
        glass:'0 8px 32px rgba(0,0,0,.1)',
        btn:'0 4px 14px rgba(37,99,235,.35)',
      },
      animation: {
        'float':'float 6s ease-in-out infinite',
        'slide-up':'slideUp .4s ease-out',
        'fade-in':'fadeIn .3s ease-out',
        'bounce-slow':'bounce 2s infinite',
        'waking-progress':'wakingProgress 2s ease-in-out infinite',
      },
      keyframes: {
        float:{'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-12px)'}},
        slideUp:{'0%':{opacity:0,transform:'translateY(20px)'},'100%':{opacity:1,transform:'translateY(0)'}},
        fadeIn:{'0%':{opacity:0},'100%':{opacity:1}},
        wakingProgress:{'0%':{width:'0%',marginLeft:'0%'},'50%':{width:'60%',marginLeft:'20%'},'100%':{width:'0%',marginLeft:'100%'}},
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}


