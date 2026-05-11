import Link from "next/link";
import { Sparkles, ArrowRight, Calendar, Users, ShoppingBag, BarChart3, Star, Clock } from "lucide-react";

export default function HomePage() {
  const features = [
    { icon: Calendar, title: "Smart Scheduling", desc: "Intelligent booking with real-time availability and conflict prevention" },
    { icon: Users, title: "Staff Management", desc: "Assign staff to services based on verified skill qualifications" },
    { icon: ShoppingBag, title: "Service Catalog", desc: "Hierarchical categories with provider-level customization" },
    { icon: BarChart3, title: "Analytics", desc: "Revenue tracking, booking trends, and performance insights" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <nav style={{ padding: "1.25rem 3rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", background: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{ width: 32, height: 32, background: "var(--gold)", borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600 }}>Lumière</span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/" style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", padding: "0.5rem 0.75rem" }}>Providers</Link>
          <Link href="/" style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", padding: "0.5rem 0.75rem" }}>Book</Link>
          <Link href="/" className="btn-gold">Dashboard <ArrowRight size={14} /></Link>
        </div>
      </nav>

      <section style={{ padding: "6rem 3rem 5rem", maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
        <div>
          <div className="tag tag-gold" style={{ marginBottom: "1.5rem" }}>✨ Salon Management Platform</div>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 400, lineHeight: 1.05, marginBottom: "1.5rem" }}>
            Appointments,{" "}<em style={{ fontStyle: "italic", color: "var(--gold-dark)" }}>beautifully</em>{" "}managed.
          </h1>
          <p style={{ fontSize: "1.0625rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "2rem" }}>
            A complete platform for salons — admins govern the catalog, providers customize offerings, customers book with ease.
          </p>
          <div style={{ display: "flex", gap: "0.875rem" }}>
            <Link href="/dashboard" className="btn-gold" style={{ padding: "0.875rem 2rem" }}>Open Dashboard <ArrowRight size={15} /></Link>
            <Link href="/book" className="btn-outline" style={{ padding: "0.875rem 2rem" }}>Book Appointment</Link>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Today · Aura Beauty Studio
            </div>
            {[
              { time: "10:00", service: "Balayage", client: "Meera J.", staff: "Priya S.", status: "confirmed" },
              { time: "11:30", service: "Hydra Facial", client: "Sneha K.", staff: "Kavya R.", status: "confirmed" },
              { time: "14:00", service: "Classic Haircut", client: "Ritu V.", staff: "Priya S.", status: "pending" },
            ].map((appt, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr auto", gap: "0.875rem", alignItems: "center", padding: "0.75rem 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gold-dark)" }}>{appt.time}</div>
                  <div style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>60m</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{appt.client}</div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{appt.service} · {appt.staff}</div>
                </div>
                <span style={{ background: appt.status === "confirmed" ? "#EFF7F2" : "#FDF8EC", color: appt.status === "confirmed" ? "#2D7A4F" : "#9B7B2E", fontSize: "0.5625rem", fontWeight: 600, padding: "0.175rem 0.5rem", borderRadius: "2px", textTransform: "capitalize" }}>
                  {appt.status}
                </span>
              </div>
            ))}
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Today&apos;s Revenue</div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gold-dark)" }}>₹9,750</div>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: "-1.25rem", left: "-1.5rem", background: "white", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.875rem 1.125rem", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ display: "flex" }}>
              {[1,2,3,4,5].map(n => <Star key={n} size={13} fill="var(--gold)" color="var(--gold)" />)}
            </div>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>4.8</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>312 reviews</span>
          </div>
        </div>
      </section>

      <section style={{ padding: "5rem 3rem", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2.25rem", fontWeight: 400, marginBottom: "0.75rem" }}>Everything your salon needs</h2>
          <p style={{ color: "var(--text-muted)" }}>Multi-role architecture for admins, providers, and customers</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card card-hover" style={{ textAlign: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "4px", background: "#FDF8EC", border: "1px solid var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <Icon size={20} color="var(--gold)" />
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 500, marginBottom: "0.5rem" }}>{title}</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "4rem 3rem 5rem", maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
        {[
          { role: "Admin", desc: "Govern the platform — manage categories, services, and providers.", href: "/admin/auth/login", icon: "⚙️", color: "#F0F4FF", border: "#C5D0EF", text: "#3B5AA0" },
          { role: "Provider", desc: "Manage your salon — customize services, staff, and bookings.", href: "/provider/auth/login", icon: "✂️", color: "#FDF8EC", border: "var(--gold-light)", text: "var(--gold-dark)" },
          { role: "Customer", desc: "Book your appointment in seconds — find services near you.", href: "/customer/auth/login", icon: "💆", color: "#F1F5F1", border: "#C4D4C2", text: "#5A7556" },
        ].map(({ role, desc, href, icon, color, border, text }) => (
          <Link key={role} href={href} style={{ background: color, border: `1px solid ${border}`, borderRadius: "4px", padding: "1.75rem", textDecoration: "none", display: "block", transition: "all 0.2s" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.875rem" }}>{icon}</div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 500, color: "var(--charcoal)", marginBottom: "0.5rem" }}>{role}</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.25rem" }}>{desc}</p>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: text, display: "flex", alignItems: "center", gap: "0.375rem" }}>
              Enter as {role} <ArrowRight size={13} />
            </span>
          </Link>
        ))}
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", background: "white", padding: "1.5rem 3rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sparkles size={14} color="var(--gold)" />
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.0625rem", fontWeight: 600 }}>Lumière</span>
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Built with Next.js · Salon Appointment System</div>
      </footer>
    </div>
  );
}
