"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";

export default function AuthLayout({ children, role, title }: { children: React.ReactNode; role: string; title?: string }) {
  const router=useRouter();
  

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', background: 'var(--cream)' }}>
     
      <div style={{ width: '100%', maxWidth: 720, display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'stretch' }}>
         <button
      onClick={() => router.push("/")}
      className="
        fixed bottom-6 right-6
        bg-black text-white
        p-4 rounded-full
        shadow-lg
        hover:scale-105
        transition-all duration-200
      "
    >
      <Home size={24} />
    </button>
        <div style={{ background: 'white', borderRadius: 12, padding: '2.5rem', boxShadow: '0 30px 80px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600 }}>Lumière</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Salon management for admins, providers & customers</div>
            </div>
          </div>

          <h2 style={{ fontSize: 28, marginBottom: 8 }}>{title || `Welcome ${role}`}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 18 }}>Securely sign in or create an account for the {role} workspace.</p>

          <div style={{ marginTop: 12 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
