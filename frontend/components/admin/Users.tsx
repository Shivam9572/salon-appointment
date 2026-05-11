"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  address: string | null;
  mobile: string | null;
}

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const router=useRouter();
  const fetchUsers = async (p: number) => {
    setLoading(true);
    try {
      const res = await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({ page: p }),
      });
      setUsers(res.message || res || []);
    } catch (e:any) {
      if(e.status==401){
        router.push("/admin/auth/login");
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(page); }, [page]);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role: string) => (
    <span style={{
      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: role === "customer" ? "rgba(99,102,241,0.12)" : "rgba(245,158,11,0.12)",
      color: role === "customer" ? "#818cf8" : "#f59e0b",
    }}>
      {role}
    </span>
  );

  const avatarColor = (name: string) => {
    const colors = ["#f59e0b", "#10b981", "#818cf8", "#ef4444", "#06b6d4"];
    return colors[name?.charCodeAt(0) % colors.length] || "#f59e0b";
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Users", value: users.length, icon: "👥" },
          { label: "Customers", value: users.filter((u) => u.role === "customer").length, icon: "🛍️" },
          { label: "With Mobile", value: users.filter((u) => u.mobile).length, icon: "📱" },
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
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>All Users</div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "7px 14px", borderRadius: 8,
              border: "1px solid #3f3f52", background: "#0f0f13",
              color: "#e5e7eb", fontSize: 13, outline: "none",
              fontFamily: "inherit", width: 240,
            }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Loading...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2a3a" }}>
                  {["User", "Email", "Mobile", "Address", "Role"].map((h) => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    style={{ borderBottom: "1px solid #1e1e2a", transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1e1e2a")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%",
                          background: avatarColor(u.name) + "22",
                          border: `1.5px solid ${avatarColor(u.name)}44`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, color: avatarColor(u.name),
                        }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={td}><span style={{ fontSize: 13, color: "#9ca3af" }}>{u.email}</span></td>
                    <td style={td}><span style={{ fontSize: 13, color: "#9ca3af" }}>{u.mobile || "—"}</span></td>
                    <td style={td}><span style={{ fontSize: 12, color: "#6b7280" }}>{u.address || "—"}</span></td>
                    <td style={td}>{roleBadge(u.role)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#6b7280", fontSize: 13 }}>
                      No users found
                    </td>
                  </tr>
                )}
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
  padding: "12px 16px", verticalAlign: "middle",
};
const pageBtn: React.CSSProperties = {
  padding: "6px 14px", borderRadius: 8, border: "1px solid #3f3f52",
  background: "transparent", color: "#9ca3af", fontSize: 12,
  cursor: "pointer", fontFamily: "inherit",
};
