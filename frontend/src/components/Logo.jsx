import React from "react";

/**
 * NR mark — recreated based on the NURI DWI SUKSES PDF logo.
 * Blue circular band with orange sunburst rays + bold NR monogram.
 */
export default function Logo({ size = 40, withWordmark = false, className = "" }) {
    return (
        <div className={`flex items-center gap-3 ${className}`} data-testid="nds-logo">
            <svg
                width={size}
                height={size}
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="PT. NURI DWI SUKSES"
            >
                {/* Outer ring */}
                <circle cx="32" cy="32" r="30" fill="#0A2B6B" />
                <circle cx="32" cy="32" r="30" stroke="#0A2B6B" strokeWidth="2" />
                <circle cx="32" cy="32" r="26" stroke="#FFFFFF" strokeWidth="1" opacity="0.35" />
                {/* Sunburst rays */}
                <g transform="translate(32 32)" fill="#F58220">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <rect
                            key={i}
                            x="-1.5"
                            y="-26"
                            width="3"
                            height="14"
                            transform={`rotate(${(360 / 16) * i})`}
                            opacity="0.9"
                        />
                    ))}
                </g>
                {/* Inner disc */}
                <circle cx="32" cy="32" r="14" fill="#0A2B6B" />
                {/* NR monogram */}
                <text
                    x="32"
                    y="38"
                    textAnchor="middle"
                    fontFamily="Manrope, Helvetica, Arial, sans-serif"
                    fontSize="16"
                    fontWeight="800"
                    fill="#FFFFFF"
                    stroke="#F58220"
                    strokeWidth="0.4"
                    letterSpacing="-0.5"
                >
                    NR
                </text>
            </svg>
            {withWordmark && (
                <div className="leading-tight" data-testid="nds-wordmark">
                    <div className="text-[15px] font-extrabold tracking-tight text-ink-deep">
                        NURI DWI SUKSES
                    </div>
                    <div className="text-[10px] font-semibold tracking-widest uppercase text-ink-steel">
                        Polymer Plate · Printing
                    </div>
                </div>
            )}
        </div>
    );
}
