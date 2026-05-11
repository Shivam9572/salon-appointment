"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";

type Mode = "login" | "register";

export default function AuthForm({ role, mode = "login" }: { role: 'Admin' | 'Provider' | 'Customer'; mode?: Mode }) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [salonName, setSalonName] = useState("");
  const [salonAddress, setSalonAddress] = useState("");
  const [salonContact, setSalonContact] = useState("");

  const simpleRole = role.toLowerCase() as 'admin' | 'provider' | 'customer';

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(simpleRole, { email, password });
        // on successful login -> role home
        router.push(`/${simpleRole}`);
      } else {
        await register(simpleRole, { name, email, password, salonName, salonAddress, salonContact });
        // after successful register -> show OTP entry for provider/customer
        if (simpleRole === 'provider' || simpleRole === 'customer') {
          setInfo('OTP sent to your email. Enter the 6-digit code below to verify your account.');
          setAwaitingOtp(true);
        } else {
          router.push(`/${simpleRole}/auth/login`);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {mode === 'register' && (
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Full name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }} />
        </label>
      )}

      {mode === 'register' && simpleRole === 'provider' && (
        <>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Salon name</span>
            <input value={salonName} onChange={(e) => setSalonName(e.target.value)} placeholder="Salon XYZ" required style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Salon address</span>
            <input value={salonAddress} onChange={(e) => setSalonAddress(e.target.value)} placeholder="123 Main St" required style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Salon contact</span>
            <input value={salonContact} onChange={(e) => setSalonContact(e.target.value)} placeholder="(+1) 555-0123" required style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }} />
          </label>
        </>
      )}

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Email</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" type="email" required style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }} />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Password</span>
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" required style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }} />
      </label>

      {error && <div style={{ color: 'var(--rose)', fontSize: 13 }}>{error}</div>}

      {!awaitingOtp && (
        <button disabled={loading} style={{ marginTop: 6, background: 'var(--gold)', border: 'none', padding: '10px 12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
          {loading ? 'Please wait…' : mode === 'login' ? `Sign in as ${role}` : `Create ${role} account`}
        </button>
      )}

      {awaitingOtp && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {info && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{info}</div>}
          <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit code" maxLength={6} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={async (e) => {
                e.preventDefault();
                setError(null);
                setLoading(true);
                try {
                  await apiFetch(`/verify/register/${simpleRole}`, {
                    method: 'POST',
                    body: JSON.stringify({ email, otp }),
                  });
                  router.push(`/${simpleRole}/auth/login`);
                } catch (err: any) {
                  setError(err?.message || 'Invalid or expired OTP');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              style={{ background: 'var(--gold)', border: 'none', padding: '10px 12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
            >
              Verify
            </button>

            <button
              onClick={async (e) => {
                e.preventDefault();
                setError(null);
                setLoading(true);
                try {
                  // resend register to trigger OTP resend
                  await register(simpleRole, { name, email, password });
                  setInfo('OTP resent to your email.');
                } catch (err: any) {
                  setError(err?.message || 'Failed to resend OTP');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              style={{ background: 'transparent', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
            >
              Resend
            </button>
          </div>
        </div>
      )}

      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {mode === 'login' ? (
          <>
            Don’t have an account?{' '}
            <Link href={`/${simpleRole}/auth/register`} style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>
              Create account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href={`/${simpleRole}/auth/login`} style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>
              Sign in
            </Link>
          </>
        )}
      </div>
    </form>
  );
}
