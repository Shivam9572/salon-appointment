import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { StaffMember } from "./StaffPanel";

export default AddStaffModal;

function AddStaffModal({
    onClose,
    onSuccess,
    onUnauthorized,
}: {
    onClose: () => void;
    onSuccess: (staff: StaffMember) => void;
    onUnauthorized: () => void;
}) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit() {
        if (!name.trim() || !phone.trim()) {
            setError("Name and phone are required.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch("/staff", {
                method: "POST",
                body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
            });



            if (!res?.staff) throw new Error(res?.message || "Failed to add staff");
            onSuccess(res.staff);
            onClose();
        } catch (err: any) {
            if (err.status === 401) {
                onUnauthorized();
                return;
            }
            let msg = err?.message || "Something went wrong";
            try { msg = JSON.parse(msg)?.message || msg; } catch { }
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === e.currentTarget) onClose();
    }

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "9px 12px",
        border: "1.5px solid #e5e7eb", borderRadius: 8,
        fontSize: 14, outline: "none",
        boxSizing: "border-box", transition: "border-color 0.15s",
    };

    return (
        <div
            onClick={handleBackdrop}
            style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000, backdropFilter: "blur(2px)",
            }}
        >
            <div
                style={{
                    background: "#fff", borderRadius: 14,
                    padding: "28px 28px 24px", width: 360,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
                    position: "relative",
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute", top: 14, right: 14,
                        background: "none", border: "none",
                        cursor: "pointer", fontSize: 20,
                        color: "#9ca3af", lineHeight: 1, padding: 4,
                    }}
                >
                    ✕
                </button>

                <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>
                    Add Staff Member
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                            Full Name
                        </label>
                        <input
                            type="text" placeholder="e.g. Rahul Sharma"
                            value={name} onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            style={inputStyle}
                            onFocus={(e) => (e.target.style.borderColor = "var(--gold, #f59e0b)")}
                            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                            Phone Number
                        </label>
                        <input
                            type="tel" placeholder="e.g. +91 98765 43210"
                            value={phone} onChange={(e) => setPhone(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            style={inputStyle}
                            onFocus={(e) => (e.target.style.borderColor = "var(--gold, #f59e0b)")}
                            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                        />
                    </div>

                    {error && (
                        <div style={{ color: "#ef4444", fontSize: 13, background: "#fef2f2", padding: "8px 12px", borderRadius: 8 }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1, padding: "10px 0",
                                border: "1.5px solid #e5e7eb", borderRadius: 8,
                                background: "#fff", cursor: "pointer",
                                fontWeight: 600, fontSize: 14, color: "#6b7280",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit} disabled={loading}
                            style={{
                                flex: 2, padding: "10px 0",
                                border: "none", borderRadius: 8,
                                background: "var(--gold, #f59e0b)",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontWeight: 700, fontSize: 14, color: "#fff",
                                opacity: loading ? 0.7 : 1, transition: "opacity 0.15s",
                            }}
                        >
                            {loading ? "Adding…" : "Add Staff"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}