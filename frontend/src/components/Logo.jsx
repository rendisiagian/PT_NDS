import React from "react";

/**
 * NR mark — recreated based on the NURI DWI SUKSES PDF logo.
 * Blue circular band with orange sunburst rays + bold NR monogram.
 */
export default function Logo({ size = 40, withWordmark = false, className = "" }) {
    return (
        <div className={`flex items-center gap-3 ${className}`} data-testid="nds-logo">
            <img
                src="/logo_nds.jpg"
                alt="PT. NURI DWI SUKSES"
                width={size}
                height={size}
                className="object-contain"
            />
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
