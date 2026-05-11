"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import { useRouter } from "next/navigation";

interface Service {
  name: string;
  description: string;
  default_price: string;
  default_duration: number;
}

interface Category {
  id:string;
  name: string;
  description: string;
  image: string | null;
  Services: Service[];
}

const chip = (color: string) => ({
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  background: color === "amber" ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.15)",
  color: color === "amber" ? "#f59e0b" : "#818cf8",
} as React.CSSProperties);

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router=useRouter();
  useEffect(() => {
    apiFetch("/admin/category",{method:"GET"})
      .then((res) =>{ 
        console.log(res.message);
        setCategories(res.message || [])})
      .catch((err:any)=>{
        if(err.status==401){
          router.push("/admin/auth/login");
        }
      })
      .finally(() => setLoading(false));
      
  }, []);

  const handleDelete = async (id: string,name:string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    setDeleting(name);
    try {
      console.log(id);
      await apiFetch(`/category/remove/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch(err:any){
        if(err.status==401){
          router.push("/admin/auth/login");
        }
        alert("delete failed");
      } finally {
      setDeleting(null);
    }
  };

  const toggleServices = (name: string) => {
    setExpanded((prev) => (prev === name ? null : name));
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Categories", value: categories.length, icon: "🗂️" },
          { label: "Total Services", value: categories.reduce((a, c) => a + c.Services.length, 0), icon: "✂️" },
          { label: "Avg Services/Category", value: categories.length ? Math.round(categories.reduce((a, c) => a + c.Services.length, 0) / categories.length) : 0, icon: "📊" },
        ].map((s) => (
          <div key={s.label} style={statCard}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {categories.map((cat) => {
          const isOpen = expanded === cat.name;
          return (
            <div key={cat.name} style={card}>
              {/* Card Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(239,68,68,0.2))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20,
                  }}>🏷️</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{cat.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{cat.description}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={chip("indigo")}>{cat.Services.length} services</span>

                  {/* Services toggle button */}
                  <button
                    onClick={() => toggleServices(cat.name)}
                    style={{
                      ...btnOutline,
                      color: isOpen ? "#f59e0b" : "#9ca3af",
                      borderColor: isOpen ? "rgba(245,158,11,0.4)" : "#3f3f52",
                      background: isOpen ? "rgba(245,158,11,0.08)" : "transparent",
                    }}
                  >
                    {isOpen ? "Hide Services ▲" : "Services ▼"}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(cat.id,cat.name)}
                    disabled={deleting === cat.name}
                    style={{ ...btnDanger, opacity: deleting === cat.name ? 0.5 : 1 }}
                  >
                    {deleting === cat.name ? "..." : "🗑 Delete"}
                  </button>
                </div>
              </div>

              {/* Services Slide-in */}
              <div style={{
                maxHeight: isOpen ? 600 : 0,
                overflow: "hidden",
                transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
              }}>
                <div style={{ borderTop: "1px solid #2a2a3a", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", letterSpacing: "0.06em", marginBottom: 4 }}>
                    SERVICES IN THIS CATEGORY
                  </div>
                  {cat.Services.map((svc) => (
                    <div key={svc.name} style={serviceRow}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#e5e7eb" }}>{svc.name}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{svc.description}</div>
                      </div>
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>₹{svc.default_price}</div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>{svc.default_duration} min</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ ...card, height: 80, animation: "pulse 1.5s infinite" }} />
      ))}
    </div>
  );
}

const statCard: React.CSSProperties = {
  background: "#17171f",
  border: "1px solid #2a2a3a",
  borderRadius: 14,
  padding: "20px 24px",
};

const card: React.CSSProperties = {
  background: "#17171f",
  border: "1px solid #2a2a3a",
  borderRadius: 14,
  overflow: "hidden",
  transition: "border-color 0.2s",
};

const serviceRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  background: "#0f0f13",
  borderRadius: 10,
  border: "1px solid #2a2a3a",
};

const btnOutline: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 8,
  border: "1px solid #3f3f52",
  background: "transparent",
  color: "#9ca3af",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s",
  fontFamily: "inherit",
};

const btnDanger: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 8,
  border: "1px solid rgba(239,68,68,0.3)",
  background: "rgba(239,68,68,0.08)",
  color: "#ef4444",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};
