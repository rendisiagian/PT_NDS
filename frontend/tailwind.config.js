/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Helvetica', 'Arial', 'sans-serif'],
                display: ['Manrope', 'Inter', 'Helvetica', 'Arial', 'sans-serif'],
            },
            colors: {
                // Brand blues (inspired by ciptasukseslabelindo + Meta)
                cobalt: {
                    DEFAULT: '#1E3FAD',  // deep royal blue (primary)
                    deep: '#152D85',     // pressed state
                    soft: '#4A78E8',     // hover/glow accent
                    bright: '#2A4CCB',   // bright accent
                    sky: '#E8F0FF',      // very light sky tint
                    mist: '#F4F8FF',     // pale background tint
                },
                ink: {
                    deep: '#0A1A3D',     // navy-tinted dark for headings
                    DEFAULT: '#1C2541',  // body text with subtle blue undertone
                    charcoal: '#444F6B',
                    slate: '#4B5570',
                    steel: '#5D6C8A',
                    stone: '#8595B4',
                },
                hairline: {
                    DEFAULT: '#D6DCE8',
                    soft: '#E6EBF3',
                },
                canvas: '#FFFFFF',
                'surface-soft': '#F4F8FF',
                // semantic
                success: '#31A24C',
                warning: '#F7B928',
                attention: '#F2A918',
                critical: '#E41E3F',
                // shadcn defaults preserved
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
                popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
                primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
                secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
                muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
                accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
                destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                '4xl': '32px',
                '5xl': '40px',
                pill: '100px',
            },
            spacing: {
                'section': '64px',
                'section-lg': '80px',
                'hero': '120px',
            },
            letterSpacing: {
                'tightish': '-0.014em',
                'tighter-md': '-0.016em',
            },
            keyframes: {
                'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
                'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
                'fade-in': 'fade-in 0.5s ease-out both',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
