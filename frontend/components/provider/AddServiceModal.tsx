import react, { useState } from "react";
import { apiFetch } from "@/lib/api";
import Select from "react-select";

export interface AddServiceModal {
    category: Array<{ id: number; name: string }>;
    staff: Array<{ id: string; name: string, phone: string }>;
    onClose: () => void;
    onService: (service: any) => void;
    onUnauthorized: () => void;
}


export default function AddServiceModal({ category, staff, onClose, onService, onUnauthorized }: AddServiceModal) {
    const [serviceName, setServiceName] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [staffId, setStaffId] = useState("");
    const [serviceId, setServiceId] = useState("");
    const [error, setError] = useState("");
    const [loadingServices, setLoadingServices] = useState(false);
    const [categoryServices, setCategoryServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const categoryOptions = category.map((c) => ({
        value: c.id,
        label: c.name,
    }));

    const serviceOptions = categoryServices.map((s) => ({
        value: s.id,
        label: s.name,
    }));

    const staffOptions = staff.map((s) => ({
        value: s.id,
        label: s.name,
    }));

    async function handleSubmit() {
        setError("");
        if (!price || !duration || !description || !categoryId || !staffId || !serviceId) {
            setError("Please fill all fields");
            return;
        }
        try {
            const service = await apiFetch("/provider/services", {
                method: "POST",
                body: JSON.stringify({
                    price, duration, description, categoryId, staffId, serviceId
                })
            });
            onService(service.service);
             onClose();

        } catch (err: any) {
            let msg = err?.message || String(err);
            try { msg = JSON.parse(msg)?.message || msg; } catch { }
            if (err.status==201) { onUnauthorized(); return; }
            setError(msg);


        }
    }

    function handleServiceChange(selected: any) {
        const selectedId = selected?.value;
        setServiceId(selectedId);

        const s = categoryServices.find((x) => x.id === selectedId);

        if (s) {
            setServiceName(s.name);
            setDescription(s.description);
            setPrice(s.default_price);
            setDuration(String(s.default_duration));
        }
    }

    function handleStaffChange(selected: any) {
        setStaffId(selected?.value || "");
    }

    async function handleCategoryChange(selected: any) {

        setCategoryId(selected?.value || "");
        setCategoryServices([]);
        setServiceId("");
        setServiceName("");
        setDuration("");
        setPrice("");
        setDescription("");

        if (!selected) return;

        setLoadingServices(true);

        try {
            const res = await apiFetch(`/category/services/${selected.value}`, {
                method: "GET",
            });
            if (!res || res.status == 200) {
                throw res;
            }
            setCategoryServices(res?.services ?? []);
        } catch (err) {
            console.error("Failed to load services", err);
        } finally {
            setLoadingServices(false);
        }
    }

    return (
        <div
            onClick={(e) => e.stopPropagation()}
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
                    Add Services
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>




                    {error && (
                        <div style={{ color: "#ef4444", fontSize: 13, background: "#fef2f2", padding: "8px 12px", borderRadius: 8 }}>
                            {error}
                        </div>
                    )}

                    <Select
                        options={categoryOptions}
                        onChange={handleCategoryChange}
                        placeholder="Select Category"
                        isClearable
                    />
                    <Select
                        options={serviceOptions}
                        onChange={handleServiceChange}
                        placeholder="Select Service"
                        isDisabled={!categoryId}
                        isLoading={loadingServices}
                    />

                    <input
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="Service Name"
                    />

                    <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Price"
                    />

                    <input
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Duration"
                    />

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                    />

                    <Select
                        options={staffOptions}
                        onChange={handleStaffChange}
                        placeholder="Select Staff"
                    />

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
                            {loading ? "Adding…" : "Add Service"}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );


}