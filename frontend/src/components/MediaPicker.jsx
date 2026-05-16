import React, { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import api from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";

/**
 * MediaPicker — input field that supports either pasting a URL OR uploading a file.
 * Value is always a string (URL or /api/media/{id}).
 */
export default function MediaPicker({ value, onChange, label = "Image", testid }) {
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const onFile = async (file) => {
        if (!file) return;
        setError("");
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const { data } = await api.post("/admin/media", fd);
            onChange(data.url);
        } catch (err) {
            setError(err.response?.data?.detail || "Upload gagal");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const preview = resolveMediaUrl(value);

    return (
        <div className="space-y-2" data-testid={testid}>
            {label && <span className="text-xs font-bold uppercase tracking-widest text-ink-steel block">{label}</span>}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-28 h-20 rounded-lg border border-hairline bg-surface-soft overflow-hidden flex items-center justify-center shrink-0">
                    {preview ? (
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-6 h-6 text-ink-stone" />
                    )}
                </div>
                <div className="flex-1 space-y-2">
                    <input
                        type="text"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="https://… atau /api/media/…"
                        className="w-full bg-canvas text-ink border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cobalt focus:border-2"
                        data-testid={testid ? `${testid}-url` : undefined}
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            disabled={uploading}
                            className="btn-pill-ghost text-xs disabled:opacity-60"
                            data-testid={testid ? `${testid}-upload-btn` : undefined}
                        >
                            <Upload className="w-3.5 h-3.5 mr-1" />
                            {uploading ? "Mengunggah…" : "Unggah gambar"}
                        </button>
                        {value && (
                            <button
                                type="button"
                                onClick={() => onChange("")}
                                className="btn-pill-ghost text-xs"
                            >
                                <X className="w-3.5 h-3.5 mr-1" />
                                Hapus
                            </button>
                        )}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => onFile(e.target.files?.[0])}
                        />
                    </div>
                    {error && <p className="text-xs text-critical font-bold">{error}</p>}
                </div>
            </div>
        </div>
    );
}
