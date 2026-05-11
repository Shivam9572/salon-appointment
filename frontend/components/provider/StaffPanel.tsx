"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import EditStaffModal from "./editStaffmodal";
import AddStaffModal from "./addStaffModal";
// ─── Types ───────────────────────────────────────────────────────────────────

export interface StaffMember {
    id: string;
    name: string;
    phone: string;
    available: boolean;
}

interface StaffPanelProps {
    staff: StaffMember[];
    onAdd: (member: StaffMember) => void;
    onUnauthorized: () => void;
    deleteStaff: (id: string) => void
    isProviderConnected: boolean; // ✅ provider connected hai ya nahi
    socket: Socket | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string) {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function Avatar({ name }: { name: string }) {
    const colors = [
        "#e07b39", "#3b82f6", "#10b981", "#8b5cf6",
        "#f59e0b", "#ef4444", "#06b6d4", "#ec4899",
    ];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
        <div
            style={{
                width: 40, height: 40, borderRadius: "50%",
                background: color, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 14, flexShrink: 0, letterSpacing: 0.5,
            }}
        >
            {getInitials(name)}
        </div>
    );
}

// ─── Add Staff Modal ──────────────────────────────────────────────────────────



// ─── Staff Panel (exported) ───────────────────────────────────────────────────

export default function StaffPanel({ staff, onAdd, onUnauthorized, deleteStaff, isProviderConnected, socket }: StaffPanelProps) {
    const [showModal, setShowModal] = useState(false);
    const [editStaffModal, setEditStaffModal] = useState(false);
    const [localStaff, setLocalStaff] = useState(staff);
    const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    async function handleDelete(id: string, phone: string) {
        try {
            const confirmDelte = confirm("are you for delete this staff?");
            if (!confirmDelte) {
                return;
            }
            await apiFetch(`/staff/${id}`, {
                method: "DELETE",
            });
            alert("delete successfull");
            // UI update
            setLocalStaff((prev) => prev.filter((s) => s.id !== id));
            deleteStaff(phone);

        } catch (err: any) {
            if (err.status === 401) {
                onUnauthorized();
                return;
            }
            alert(err);
            console.error(err);
        }
    }

    useEffect(() => {
        if (!socket) return;

        // Success — DB update ho gaya
        socket.on('staff_toggle_success', ({ staffId, available }) => {
            setLocalStaff(prev =>
                prev.map(s => s.id === staffId ? { ...s, available } : s)
            );
            setTogglingId(null);
        });

        // Error — rollback karo
        socket.on('staff_toggle_error', ({ staffId }) => {
            setTogglingId(null);
            alert('Failed to update staff availability');
        });

        return () => {
            socket.off('staff_toggle_success');
            socket.off('staff_toggle_error');
        };
    }, [socket]);

    function handleStaffToggle(staffId: string, currentAvailable: boolean) {
        if (!socket || !isProviderConnected) return;

        setTogglingId(staffId); // loading start

        // Optimistic UI update
        setLocalStaff(prev =>
            prev.map(s => s.id === staffId
                ? { ...s, available: !currentAvailable }
                : s
            )
        );

        // Socket emit
        socket.emit('staff_toggle', {
            staffId,
            available: !currentAvailable
        });
    }

    useEffect(() => {
        setLocalStaff(staff);
    }, [staff]);
    return (
        <div style={{ background: "white", padding: 16, borderRadius: 8 }}>
            {showModal && (
                <AddStaffModal
                    onClose={() => setShowModal(false)}
                    onSuccess={onAdd}
                    onUnauthorized={onUnauthorized}
                />
            )}
            {editStaffModal && editStaff && (
                <EditStaffModal
                    staff={editStaff}
                    onClose={() => setEditStaffModal(false)}
                    onSuccess={(updatedStaff) => {

                        setLocalStaff((prev) => prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s)));
                        setEditStaffModal(false);
                        setEditStaff(null);
                    }}
                    onUnauthorized={onUnauthorized}
                />
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>Staff</h2>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        background: "var(--gold, #f59e0b)", border: "none",
                        padding: "7px 14px", borderRadius: 8,
                        fontWeight: 600, fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                    }}
                >
                    <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Staff
                </button>
            </div>

            {localStaff.length === 0 ? (
                <div style={{ color: "var(--text-muted, #6b7280)" }}>No staff found.</div>
            ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 360, overflowY: "auto" }}>
                    {localStaff.map((s) => (
                        <li key={s.id} style={{ display: "flex", justifyContent: "space-between" }}>

                            <div style={{ display: "flex", gap: 12 }}>
                                <Avatar name={s.name} />
                                <div>
                                    <div>{s.name}</div>
                                    <div>{s.phone}</div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 8 }}>

                                <div
                                    title={
                                        !isProviderConnected
                                            ? "Pehle Connect System ON karo"
                                            : s.available ? "Available" : "Unavailable"
                                    }
                                    onClick={() => {
                                        if (!isProviderConnected || togglingId === s.id) return;
                                        handleStaffToggle(s.id, s.available);
                                    }}
                                    style={{
                                        width: 40,
                                        height: 22,
                                        borderRadius: 11,
                                        background: !isProviderConnected
                                            ? "#e5e7eb"                          // grey — disabled
                                            : s.available ? "#10b981" : "#d1d5db", // green/grey
                                        position: "relative",
                                        cursor: isProviderConnected ? "pointer" : "not-allowed",
                                        transition: "background 0.2s",
                                        opacity: togglingId === s.id ? 0.6 : 1,
                                        flexShrink: 0,
                                    }}
                                >
                                    <div style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "white",
                                        position: "absolute",
                                        top: 3,
                                        left: s.available ? 21 : 3,
                                        transition: "left 0.2s",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                    }} />
                                </div>

                                <span style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: s.available ? "#10b981" : "#9ca3af",
                                    minWidth: 60,
                                }}>
                                    {togglingId === s.id
                                        ? "Updating..."
                                        : s.available ? "Available" : "Unavailable"
                                    }
                                </span>

                                {/* Edit */}
                                <button onClick={() => { setEditStaff(s); setEditStaffModal(true); }}
                                    style={{
                                        background: "var(--gold, #f59e0b)", border: "none",
                                        padding: "7px 10px", borderRadius: 8,
                                        fontWeight: 600, cursor: "pointer",
                                    }}>
                                    ✏️
                                </button>

                                {/* EDIT */}
                               

                                {/* DELETE */}
                                <button onClick={() => handleDelete(s.id, s.phone)}>
                                    🗑️
                                </button>
                            </div>

                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
