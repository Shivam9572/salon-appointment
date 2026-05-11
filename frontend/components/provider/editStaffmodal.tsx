import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { StaffMember } from "./StaffPanel";

export default function EditStaffModal({
  staff,
  onClose,
  onSuccess,
  onUnauthorized,
}: {
  staff: StaffMember;
  onClose: () => void;
  onSuccess: (staff: StaffMember) => void;
  onUnauthorized: () => void;
}) {
  const [name, setName] = useState(staff.name);
  const [phone, setPhone] = useState(staff.phone);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  // Animate open
  useEffect(() => {
    setTimeout(() => setShow(true), 10);
  }, []);

  // ESC close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  function handleClose() {
    setShow(false);
    setTimeout(onClose, 200); // match animation
  }

  async function handleUpdate() {
    setLoading(true);
    try {
      const res = await apiFetch(`/staff/${staff.id || ""}`, {
        method: "PUT",
        body: JSON.stringify({ name, phone }),
      });

      onSuccess(res.staff);
      handleClose();
    } catch (err: any) {
      if (err.status === 401) return onUnauthorized();
      alert("Failed to update staff: " + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px",
    border: "1.5px solid #e5e7eb", borderRadius: 8,
    fontSize: 14, outline: "none",
    boxSizing: "border-box", transition: "border-color 0.15s",
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 14,
          padding: "28px 28px 24px", width: 360,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Edit Staff
          </h3>
          <button
            onClick={handleClose}
            style={{
              position: "absolute", top: 14, right: 14,
              background: "none", border: "none",
              cursor: "pointer", fontSize: 20,
              color: "#9ca3af", lineHeight: 1, padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--gold, #f59e0b)")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--gold, #f59e0b)")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleClose}
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
            onClick={handleUpdate}
            style={{
              flex: 2, padding: "10px 0",
              border: "none", borderRadius: 8,
              background: "var(--gold, #f59e0b)",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 700, fontSize: 14, color: "#fff",
              opacity: loading ? 0.7 : 1, transition: "opacity 0.15s",
            }}          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Update"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}