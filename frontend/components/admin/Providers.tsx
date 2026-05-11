"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import { useRouter } from "next/navigation"; 

interface Provider {
  id: string;
  email: string;
  salonName: string;
  salonAddress: string;
  salonContact: string;
  servicesOffered: string | null;
  status: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export default function ProvidersTab() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [approving, setApproving] = useState<string | null>(null);
  const router=useRouter();
  const fetchProviders = async (p: number) => {
    setLoading(true);
    try {
      const res = await apiFetch("/admin/provider/all", {
        method: "POST",
        body: JSON.stringify({ page: String(p) }),
      });
      setProviders(res.message || res || []);
    } catch (e:any) {
      console.error(e);
      if(e.status==401){
        router.push("/admin/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(page); }, [page]);

  const handleApprove = async (email: string) => {
    setApproving(email);
    try {
      await apiFetch(`/admin/approve/${encodeURIComponent(email)}`, { method: "PUT" ,body:JSON.stringify({status:"approved"})});
      setProviders((prev) =>
        prev.map((p) => p.email === email ? { ...p, status: "approved" } : p)
      );
    } catch(e:any) {
      if(e.status==401){
        router.push("/admin/auth/login");
      }
      alert("Approve failed");

    } finally {
      setApproving(null);
    }
  };

  const statusBadge = (status: string) => {
    const approved = status === "approved";
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600,
        background: approved ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
        color: approved ? "#10b981" : "#f59e0b",
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: approved ? "#10b981" : "#f59e0b",
          display: "inline-block",
        }} />
        {status}
      </span>
    );
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Providers", value: providers.length, icon: "🏪" },
          { label: "Approved", value: providers.filter((p) => p.status === "approved").length, icon: "✅" },
          { label: "Pending", value: providers.filter((p) => p.status !== "approved").length, icon: "⏳" },
        ].map((s) => (
          <div key={s.label} style={statCard}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={tableWrap}>
        <div style={tableHeader}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>All Providers</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Page {page}</div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Loading...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2a3a" }}>
                  {["Salon", "Email", "Contact", "Status", "Verified", "Action"].map((h) => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #1e1e2a", transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1e1e2a")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 8,
                          background: "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(239,68,68,0.2))",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, color: "#f59e0b",
                        }}>
                          {p.salonName?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>{p.salonName}</div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>{p.salonAddress?.slice(0, 30)}...</div>
                        </div>
                      </div>
                    </td>
                    <td style={td}><span style={{ fontSize: 13, color: "#9ca3af" }}>{p.email}</span></td>
                    <td style={td}><span style={{ fontSize: 13, color: "#9ca3af" }}>{p.salonContact}</span></td>
                    <td style={td}>{statusBadge(p.status)}</td>
                    <td style={td}>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: p.isVerified ? "#10b981" : "#ef4444",
                      }}>
                        {p.isVerified ? "✓ Yes" : "✗ No"}
                      </span>
                    </td>
                    <td style={td}>
                      {p.status !== "approved" ? (
                        <button
                          onClick={() => handleApprove(p.email)}
                          disabled={approving === p.email}
                          style={{
                            padding: "6px 14px", borderRadius: 8,
                            border: "none",
                            background: approving === p.email ? "#374151" : "linear-gradient(135deg,#f59e0b,#ef4444)",
                            color: "#fff", fontSize: 12, fontWeight: 600,
                            cursor: approving === p.email ? "not-allowed" : "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {approving === p.email ? "..." : "Approve"}
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: "#374151" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "16px 20px", borderTop: "1px solid #2a2a3a" }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>← Prev</button>
          <span style={{ padding: "6px 14px", fontSize: 13, color: "#9ca3af" }}>Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)} style={pageBtn}>Next →</button>
        </div>
      </div>
    </div>
  );
}

const statCard: React.CSSProperties = {
  background: "#17171f", border: "1px solid #2a2a3a", borderRadius: 14, padding: "20px 24px",
};
const tableWrap: React.CSSProperties = {
  background: "#17171f", border: "1px solid #2a2a3a", borderRadius: 14, overflow: "hidden",
};
const tableHeader: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "18px 20px", borderBottom: "1px solid #2a2a3a",
};
const th: React.CSSProperties = {
  padding: "10px 16px", fontSize: 11, fontWeight: 600,
  color: "#6b7280", textAlign: "left", letterSpacing: "0.05em",
};
const td: React.CSSProperties = {
  padding: "12px 16px", fontSize: 13, color: "#9ca3af", verticalAlign: "middle",
};
const pageBtn: React.CSSProperties = {
  padding: "6px 14px", borderRadius: 8, border: "1px solid #3f3f52",
  background: "transparent", color: "#9ca3af", fontSize: 12,
  cursor: "pointer", fontFamily: "inherit",
};
