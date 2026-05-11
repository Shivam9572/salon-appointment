"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { AuthProvider, useAuth } from "../../context/AuthContext";
import StaffPanel, { StaffMember } from "../../components/provider/StaffPanel";
import CategoryPanel from "../../components/provider/CategoryPanel";
import ServicePanel from "../../components/provider/servicePannel";
import { Service } from "../../components/provider/servicePannel";
import ProviderProfile, { ProviderProfileType } from "../../components/provider/profile";
import dynamic from "next/dynamic";

const MapModal = dynamic(
  () => import("@/components/provider/mapModal"),
  {
    ssr: false,
  }
);
import { connectSocket, disconnectSocket ,getSocket} from '../../lib/socket';


export default function ProviderHomePage() {
  return (
    <AuthProvider>
      <ProviderHomeContent />
    </AuthProvider>
  );
}

function ProviderHomeContent() {
  const router = useRouter();
  const { logout } = useAuth();

  const [showMap, setShowMap] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [providerCategories, setProviderCategories] = useState<Array<any>>([]);
  const [profile, setProfile] = useState<ProviderProfileType>();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"staff" | "categories" | "services" | "profile">("staff");
  // existing states ke neeche add karo
  const [isConnected, setIsConnected] = useState(false);
  const [chairCount, setChairCount] = useState<number>(0);
  const [chairLoading, setChairLoading] = useState(false);

  // ── Data loading ────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const s = await apiFetch(`/staff/`, { method: "GET" });
        setStaff(s?.staff ?? s ?? []);
      } catch (err: any) {
        if (err.status === 401) {
          handleLogout();
          return;
        }

        let msg = err?.message || String(err);
        try { msg = JSON.parse(msg)?.message || msg; } catch { }
        if (msg.includes("Provider not approved")) { setError(msg); return; }
        setError("Failed to load staff");
      }

      try {
        const c = await apiFetch(`/category`, { method: "GET" });
        setCategories(c?.categories ?? c ?? []);
      } catch (err: any) {
        let msg = err?.message || String(err);
        try { msg = JSON.parse(msg)?.message || msg; } catch { }
        if (msg.includes("Provider not approved")) { setError(msg); return; }
        setError((prev) => prev ? `${prev}; failed to load categories` : "Failed to load categories");
      }
      try {
        const s = await apiFetch(`/provider/services`, { method: "GET" });
        setServices(s?.services ?? s ?? []);
      } catch (err: any) {
        console.error("Failed to load services", err);
      }
      try {
        const res = await apiFetch("/provider/profile", { method: "GET" });
        if (!res) {
          alert("failed to laod profile");
          return;
        }
        setProfile(res);
        setChairCount(res?.Chair?.number ?? 0);
      } catch (error) {
        console.log("failed to load profile", error);
        alert("failed to laod profile");
      }

      await loadProviderCategories();
    }
    load();
  }, []);

  async function loadProviderCategories() {
    try {
      const res = await apiFetch(`/provider/categories`, { method: "GET" });
      setProviderCategories(res?.categories ?? res ?? []);
    } catch (err) {
      console.error("Failed to load provider categories", err);
    }
  }

  async function handleChairUpdate(newCount: number) {
    if (newCount < 0) return;
    setChairCount(newCount); // optimistic UI
    setChairLoading(true);
    try {
      await apiFetch('/provider/chair', {
        method: 'PUT',
        body: JSON.stringify({ number: newCount }),
      });
    } catch (err: any) {
      setChairCount(chairCount); // rollback on error
      if (err.status === 401) return handleLogout();
      alert('Failed to update chairs');
    } finally {
      setChairLoading(false);
    }
  }

  function handleToggleSocket(checked: boolean) {
    if (checked) {
      const s = connectSocket();
      s.on('connect', () => setIsConnected(true));
      s.on('disconnect', () => setIsConnected(false));
      s.on('connect_error', (e: any) => {
        setIsConnected(false)
        if (e === "Error:Invalid token") {
          alert("Inavlid token");
          handleLogout();
        }

      });
    } else {
      disconnectSocket();
      setIsConnected(false);
    }
  }
  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleAppendStaff(member: StaffMember) {
    setStaff((prev) => [...prev, member]);
  }

  function handleAppendService(service: Service) {
    setServices((prev) => [...prev, service]);
  }

  function handleLogout() {
    logout();
    disconnectSocket();
    router.push(`/provider/auth/login`);
  }

  async function onDeleteService(id: string) {
    try {
      let res = await apiFetch(`/provider/services/${id}`, { method: "DELETE" });
      if (!res) {
        setError("something went wrong");
        return;
      }


      alert(res.message);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {

      if (err.status == 401) {
        handleLogout()
        return;
      }
      alert(err);

    }
  }
  function deleteStaff(phone: string) {
    setServices((prev) => prev.filter(e => e.staffPhone != phone));
    setStaff((prev) => prev.filter(e => e.phone != phone));
  }

  async function onUpdateProfile(data: Partial<ProviderProfileType>) {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== null && v !== undefined && v !== "")
      );

      const res = await apiFetch("/provider/profile", { method: "PUT", body: JSON.stringify(cleanData) });
      if (!res) {
        alert("some went wrong");
        return;
      }
      alert("successful updated");
      setProfile((prev) => ({ ...prev, ...data }));
    } catch (error: any) {
      if (error.status == 401) {
        return handleLogout();
      }
      alert(error ? error : "something went wrong");
    }

  }

  // Show alert for top-level errors
  if (error != null) {
    const msg = (() => { try { return JSON.parse(error)?.message || error; } catch { return error; } })();
    alert(msg);
    setError(null);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: 24 }}>

      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Provider Dashboard</h1>

        <div style={{ display: "flex", gap: 10 }}>
          {/* ── Connect System Toggle ── */}
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            userSelect: "none",
          }}>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: isConnected ? "#10b981" : "#6b7280",
              transition: "color 0.2s",
            }}>
              {isConnected ? "🟢 Connected" : "⚫ Connect System"}
            </span>

            {/* Toggle track */}
            <div
              onClick={() => handleToggleSocket(!isConnected)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: isConnected ? "#10b981" : "#d1d5db",
                position: "relative",
                transition: "background 0.2s",
                cursor: "pointer",
              }}
            >
              {/* Toggle thumb */}
              <div style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "white",
                position: "absolute",
                top: 3,
                left: isConnected ? 23 : 3,
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </div>
          </label>

          {/* 💺 Chair Counter */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "4px 10px",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
              💺
            </span>
            <button
              onClick={() => handleChairUpdate(chairCount - 1)}
              disabled={chairLoading || chairCount <= 0}
              style={{
                width: 24, height: 24,
                borderRadius: 6,
                border: "1px solid #d1d5db",
                background: chairCount <= 0 ? "#f3f4f6" : "white",
                cursor: chairCount <= 0 ? "not-allowed" : "pointer",
                fontWeight: 700, fontSize: 14,
                color: "#6b7280",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >−</button>

            <span style={{
              minWidth: 20, textAlign: "center",
              fontSize: 14, fontWeight: 700, color: "#111827",
            }}>
              {chairCount}
            </span>

            <button
              onClick={() => handleChairUpdate(chairCount + 1)}
              disabled={chairLoading}
              style={{
                width: 24, height: 24,
                borderRadius: 6,
                border: "1px solid #d1d5db",
                background: "white",
                cursor: "pointer",
                fontWeight: 700, fontSize: 14,
                color: "#6b7280",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >+</button>
          </div>
          <button
            onClick={() => setShowMap(true)}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            📍 Set Location
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: "var(--gold)",
              border: "none",
              padding: "8px 14px",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tab Nav */}
      <nav style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "2px solid #f3f4f6" }}>
        {(["staff", "categories", "services", "profile"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px",
              border: "none", background: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 14,
              color: activeTab === tab ? "var(--gold, #f59e0b)" : "#6b7280",
              borderBottom: activeTab === tab ? "2px solid var(--gold, #f59e0b)" : "2px solid transparent",
              marginBottom: -2,
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            {tab === "staff" ? "👥 Staff" : tab === "categories" ? "🗂 Categories" : tab === "services" ? "💼 Services" : "👤 Profile"}
          </button>
        ))}
      </nav>

      {/* Panels */}
      {activeTab === "staff" && (
        <StaffPanel
          staff={staff}
          onAdd={handleAppendStaff}
          onUnauthorized={handleLogout}
          deleteStaff={deleteStaff}
          isProviderConnected={isConnected}  // ✅
        socket={getSocket()}
        />
      )}

      {activeTab === "categories" && (
        <CategoryPanel
          categories={categories}
          providerCategories={providerCategories}
          onCategoryAdded={loadProviderCategories}
          onError={(msg) => setError(msg)}
        />
      )}
      {activeTab === "services" && (
        <ServicePanel services={services} onService={handleAppendService} categories={categories} staff={staff} onUnauthorized={handleLogout} onDelete={onDeleteService} />
      )}

      {
        activeTab === "profile" && (
          <ProviderProfile data={profile} onUpdate={onUpdateProfile} onUnauthorized={handleLogout} />
        )
      }
      {showMap && (
        <MapModal
          onClose={() => setShowMap(false)}
          initialCoords={
            profile?.latitude && profile?.longitude
              ? {
                lat: profile.latitude,
                lng: profile.longitude,
              }
              : undefined
          }
          onSelect={({ latitude, longitude, address }) => {
            onUpdateProfile({
              latitude,
              longitude,
              salonAddress: address,
            });
          }}
        />
      )}

    </div>
  );
}
