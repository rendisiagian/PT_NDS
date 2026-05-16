import React from "react";

/**
 * Stylized illustration depicting polymer plate / printing process.
 * Stable (no external network dep), brand-aligned (cobalt blue + warm accent),
 * never breaks. Replace via admin Media Library to swap with real photo.
 */
export default function HeroIllustration({ className = "" }) {
    return (
        <svg
            viewBox="0 0 600 600"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            preserveAspectRatio="xMidYMid slice"
            aria-label="PT. NURI DWI SUKSES — polymer plate printing"
        >
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#152D85" />
                    <stop offset="55%" stopColor="#1E3FAD" />
                    <stop offset="100%" stopColor="#2A4CCB" />
                </linearGradient>
                <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F4F8FF" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#E8F0FF" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="roll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#C9D4F0" />
                </linearGradient>
                <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.4" fill="#4A78E8" opacity="0.55" />
                </pattern>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="14" />
                </filter>
            </defs>

            {/* Background */}
            <rect width="600" height="600" fill="url(#bg)" />

            {/* Soft glow blobs */}
            <circle cx="120" cy="120" r="160" fill="#4A78E8" opacity="0.35" filter="url(#glow)" />
            <circle cx="500" cy="500" r="180" fill="#2A4CCB" opacity="0.45" filter="url(#glow)" />

            {/* Subtle grid */}
            <g opacity="0.10" stroke="#FFFFFF" strokeWidth="1">
                {Array.from({ length: 12 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} />
                ))}
                {Array.from({ length: 12 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600" />
                ))}
            </g>

            {/* Polymer plate (rotated rectangle) */}
            <g transform="rotate(-12 300 320)">
                <rect x="120" y="200" width="360" height="240" rx="16" fill="url(#plate)" stroke="#FFFFFF" strokeWidth="2" />
                {/* Raster dot pattern on plate */}
                <rect x="140" y="220" width="320" height="200" rx="8" fill="url(#dots)" />
                {/* Engraved title hint */}
                <rect x="160" y="240" width="120" height="14" rx="4" fill="#1E3FAD" opacity="0.65" />
                <rect x="160" y="266" width="200" height="8" rx="3" fill="#1E3FAD" opacity="0.35" />
                <rect x="160" y="282" width="160" height="8" rx="3" fill="#1E3FAD" opacity="0.35" />
                {/* Color registration marks */}
                <circle cx="445" cy="235" r="6" fill="#1E3FAD" />
                <circle cx="445" cy="235" r="3" fill="#FFFFFF" />
                <circle cx="155" cy="405" r="6" fill="#1E3FAD" />
                <circle cx="155" cy="405" r="3" fill="#FFFFFF" />
            </g>

            {/* Paper roll cylinder, lower left */}
            <g transform="translate(60 420)">
                <ellipse cx="80" cy="0" rx="80" ry="22" fill="url(#roll)" />
                <rect x="0" y="0" width="160" height="100" fill="url(#roll)" />
                <ellipse cx="80" cy="100" rx="80" ry="22" fill="#FFFFFF" opacity="0.7" />
                <ellipse cx="80" cy="0" rx="80" ry="22" fill="none" stroke="#152D85" strokeWidth="2" opacity="0.4" />
                {/* Line pattern around the roll */}
                {[18, 38, 58, 78].map((y) => (
                    <line key={y} x1="0" y1={y} x2="160" y2={y} stroke="#152D85" strokeWidth="1" opacity="0.15" />
                ))}
            </g>

            {/* Laser beam — represents CTP imaging */}
            <g opacity="0.85">
                <line x1="540" y1="60" x2="320" y2="280" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4,4" />
                <circle cx="540" cy="60" r="6" fill="#FFFFFF" />
                <circle cx="540" cy="60" r="14" fill="#FFFFFF" opacity="0.25" />
            </g>

            {/* CMYK dots indicator */}
            <g transform="translate(420 460)">
                <circle cx="0" cy="0" r="14" fill="#22CFFF" opacity="0.95" />
                <circle cx="26" cy="0" r="14" fill="#FF2EA6" opacity="0.95" />
                <circle cx="52" cy="0" r="14" fill="#FFD500" opacity="0.95" />
                <circle cx="78" cy="0" r="14" fill="#0A1A3D" opacity="0.95" />
            </g>
        </svg>
    );
}
