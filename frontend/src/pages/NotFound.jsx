import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <main className="container-page py-section-lg min-h-[60vh] flex flex-col items-center justify-center text-center" data-testid="not-found-page">
            <p className="text-xs font-bold uppercase tracking-widest text-cobalt">404</p>
            <h1 className="mt-3 text-hero text-ink-deep">Halaman tidak ditemukan</h1>
            <p className="mt-4 text-ink-charcoal">Mungkin halaman dipindahkan atau tidak pernah ada.</p>
            <Link to="/" className="mt-8 btn-pill-primary">Kembali ke Beranda</Link>
        </main>
    );
}
