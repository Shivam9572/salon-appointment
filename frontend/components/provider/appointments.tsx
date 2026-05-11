import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Staff { name: string; phone: string; available: boolean; }
interface Customer { name: string; email: string; address: string | null; mobile: string | null; }
interface Service { name: string; }
interface Category { name: string; }
interface ProviderService {
  custom_price: string; custom_duration: number; custom_description: string;
  Service: Service; Category: Category;
}
interface Appointment {
  id: string; start_time: string; end_time: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string; staff: Staff; customer: Customer; ProviderService: ProviderService;
}
interface Pagination { currentPage: number; totalPages: number; totalItems: number; itemsPerPage: number; }
interface AppointmentHistoryProps { onUnauthorized?: () => void; }

// ─── Time Helpers ─────────────────────────────────────────────────────────────
// start_time / end_time: stored as IST, read raw UTC fields — no conversion
const formatAppointmentDate = (iso: string): string => {
  const d = new Date(iso);
  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${days[d.getUTCDay()]}, ${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
const formatAppointmentTime = (iso: string): string => {
  const d = new Date(iso);
  const h = d.getUTCHours(), m = String(d.getUTCMinutes()).padStart(2,'0');
  return `${h % 12 || 12}:${m} ${h >= 12 ? 'pm' : 'am'}`;
};
// createdAt: real UTC — shift to IST (UTC+5:30)
const formatCreatedAt = (iso: string): string =>
  new Date(iso).toLocaleString('en-IN', {
    weekday:'short', day:'numeric', month:'short', year:'numeric',
    hour:'2-digit', minute:'2-digit', timeZone:'Asia/Kolkata',
  });

const formatCurrency = (v: string) => '₹' + parseFloat(v).toLocaleString('en-IN');

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS: Record<string, { label:string; bg:string; color:string; dot:string; border:string }> = {
  pending:   { label:'Pending',   bg:'#FFFBEB', color:'#92400E', dot:'#F59E0B', border:'#FDE68A' },
  confirmed: { label:'Confirmed', bg:'#F0FDF4', color:'#166534', dot:'#22C55E', border:'#BBF7D0' },
  completed: { label:'Completed', bg:'#EFF6FF', color:'#1E40AF', dot:'#3B82F6', border:'#BFDBFE' },
  cancelled: { label:'Cancelled', bg:'#F9FAFB', color:'#6B7280', dot:'#9CA3AF', border:'#E5E7EB' },
  rejected:  { label:'Rejected',  bg:'#FEF2F2', color:'#991B1B', dot:'#EF4444', border:'#FECACA' },
};

// ─── Reusable small components ────────────────────────────────────────────────
const Highlight: React.FC<{ text: string; term: string }> = ({ text, term }) => {
  if (!term.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'));
  return <>{parts.map((p,i) =>
    p.toLowerCase() === term.toLowerCase()
      ? <mark key={i} style={{ background:'#FEF9C3', color:'#92400E', borderRadius:2, padding:'0 2px' }}>{p}</mark>
      : p
  )}</>;
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS[status] ?? STATUS.pending;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:20,
      fontSize:11, fontWeight:500, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background:cfg.dot, flexShrink:0 }} />
      {cfg.label}
    </span>
  );
};

const SuccessToast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position:'fixed', bottom:20, right:20, zIndex:9999, background:'#111827', color:'white',
      fontSize:13, padding:'10px 16px', borderRadius:10, display:'flex', alignItems:'center', gap:8,
      boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
      <svg width="15" height="15" fill="none" stroke="#4ADE80" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
      {message}
    </div>
  );
};

const ErrorAlert: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
    background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'10px 16px',
    marginBottom:16, fontSize:13, color:'#991B1B' }}>
    <span>{message}</span>
    <button onClick={onRetry} style={{ padding:'4px 12px', borderRadius:6, border:'1px solid #FECACA',
      background:'#FEE2E2', color:'#991B1B', fontSize:12, cursor:'pointer' }}>Retry</button>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div>
    <style>{`@keyframes apt-pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    {[1,2,3,4].map(i => (
      <div key={i} style={{ display:'flex', gap:16, padding:'16px 20px', borderBottom:'1px solid #F3F4F6',
        animation:'apt-pulse 1.5s ease-in-out infinite' }}>
        {[130,120,160,100,80,90].map((w,j) => (
          <div key={j} style={{ width:w, height:14, background:'#F3F4F6', borderRadius:6, flexShrink:0 }}/>
        ))}
      </div>
    ))}
  </div>
);

const EmptyState: React.FC<{ onRefresh: () => void; hasSearch: boolean }> = ({ onRefresh, hasSearch }) => (
  <div style={{ textAlign:'center', padding:'48px 16px' }}>
    <svg width="40" height="40" fill="none" stroke="#D1D5DB" strokeWidth="1.5" viewBox="0 0 24 24"
      style={{ margin:'0 auto 12px', display:'block' }}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
    <p style={{ fontSize:14, fontWeight:500, color:'#6B7280', margin:0 }}>
      {hasSearch ? 'No results found' : 'No appointments'}
    </p>
    <p style={{ fontSize:12, color:'#9CA3AF', marginTop:4 }}>
      {hasSearch ? 'Try a different search or filter.' : 'No appointments found for this provider.'}
    </p>
    {!hasSearch && (
      <button onClick={onRefresh} style={{ marginTop:16, padding:'7px 18px', borderRadius:8,
        border:'none', background:'#2563EB', color:'white', fontSize:13, cursor:'pointer' }}>
        Refresh
      </button>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AppointmentHistory: React.FC<AppointmentHistoryProps> = ({ onUnauthorized }) => {
  const [appointments, setAppointments]     = useState<Appointment[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [currentPage, setCurrentPage]       = useState(1);
  const [pagination, setPagination]         = useState<Pagination | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter]                 = useState('all');
  const [searchTerm, setSearchTerm]         = useState('');
  const [hoveredRow, setHoveredRow]         = useState<string | null>(null);

  const filteredAppointments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter(a =>
      a.customer.name.toLowerCase().includes(q) ||
      a.ProviderService.Service.name.toLowerCase().includes(q) ||
      a.staff.name.toLowerCase().includes(q)
    );
  }, [appointments, searchTerm]);

  const statCounts = useMemo(() => {
    const c: Record<string,number> = { pending:0, confirmed:0, completed:0, cancelled:0, rejected:0 };
    appointments.forEach(a => { if (c[a.status] !== undefined) c[a.status]++; });
    return c;
  }, [appointments]);

  const fetchAppointments = useCallback(async (page: number, statusFilter?: string) => {
    setLoading(true); setError(null);
    try {
      let url = `/appointment/provider?page=${page}&offset=10`;
      if (statusFilter && statusFilter !== 'all') url += `&status=${statusFilter}`;
      const response = await apiFetch(url, { method: 'GET' });
      if (response.success) {
        setAppointments(response.message);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch appointments');
        if (response.status === 401 && onUnauthorized) onUnauthorized();
      }
    } catch (err: any) {
      setError('An error occurred while fetching appointments');
      if (err?.status === 401 && onUnauthorized) onUnauthorized();
    } finally { setLoading(false); }
  }, [onUnauthorized]);

  useEffect(() => { fetchAppointments(currentPage, filter); }, [currentPage, filter, fetchAppointments]);
  useEffect(() => { setSearchTerm(''); }, [filter]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(id);
    try {
      const response = await apiFetch(`/appointment/${id}/status-set?status=${newStatus}`, { method: 'PATCH' });
      if (response.success) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as Appointment['status'] } : a));
        setSuccessMessage(`Appointment ${newStatus} successfully`);
        if (filter !== 'all' && filter !== newStatus) fetchAppointments(currentPage, filter);
      } else {
        setError('Failed to update appointment status');
        if (response.status === 401 && onUnauthorized) onUnauthorized();
      }
    } catch (err: any) {
      setError('An error occurred while updating status');
      if (err?.status === 401 && onUnauthorized) onUnauthorized();
    } finally { setUpdatingStatus(null); }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const FILTERS = [
    { value:'all', label:'All' }, { value:'pending', label:'Pending' },
    { value:'confirmed', label:'Confirmed' }, { value:'completed', label:'Completed' },
    { value:'cancelled', label:'Cancelled' }, { value:'rejected', label:'Rejected' },
  ];

  // ── Action Buttons ──────────────────────────────────────────────────────────
  const ActionButtons: React.FC<{ appointment: Appointment }> = ({ appointment: { id, status } }) => {
    if (updatingStatus === id) return (
      <div style={{ display:'flex', justifyContent:'center' }}>
        <style>{`@keyframes apt-spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width:18, height:18, border:'2px solid #BFDBFE', borderTopColor:'#2563EB',
          borderRadius:'50%', animation:'apt-spin 0.7s linear infinite' }}/>
      </div>
    );
    if (status === 'pending') return (
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        <button onClick={() => updateStatus(id,'confirmed')} style={{
          display:'inline-flex', alignItems:'center', gap:4, padding:'5px 11px', fontSize:12,
          fontWeight:500, borderRadius:7, background:'#F0FDF4', color:'#166534',
          border:'1px solid #BBF7D0', cursor:'pointer', whiteSpace:'nowrap' }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Confirm
        </button>
        <button onClick={() => updateStatus(id,'rejected')} style={{
          display:'inline-flex', alignItems:'center', gap:4, padding:'5px 11px', fontSize:12,
          fontWeight:500, borderRadius:7, background:'#FEF2F2', color:'#991B1B',
          border:'1px solid #FECACA', cursor:'pointer', whiteSpace:'nowrap' }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Reject
        </button>
      </div>
    );
    if (status === 'confirmed') return (
      <button onClick={() => updateStatus(id,'completed')} style={{
        display:'inline-flex', alignItems:'center', gap:4, padding:'5px 11px', fontSize:12,
        fontWeight:500, borderRadius:7, background:'#EFF6FF', color:'#1E40AF',
        border:'1px solid #BFDBFE', cursor:'pointer', whiteSpace:'nowrap' }}>
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Complete
      </button>
    );
    return (
      <span style={{ fontSize:12, color:'#9CA3AF' }}>
        {status === 'completed' && 'Service done'}
        {status === 'rejected'  && 'Rejected'}
        {status === 'cancelled' && 'Cancelled'}
      </span>
    );
  };

  // ── Pagination ──────────────────────────────────────────────────────────────
  const PaginationControls: React.FC = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const { currentPage: cp, totalPages, totalItems, itemsPerPage } = pagination;
    const start = (cp - 1) * itemsPerPage + 1;
    const end   = Math.min(cp * itemsPerPage, totalItems);
    let nums: number[] = [];
    if (totalPages <= 5) { for (let i=1;i<=totalPages;i++) nums.push(i); }
    else if (cp <= 3)            { nums = [1,2,3,4,5]; }
    else if (cp >= totalPages-2) { for (let i=totalPages-4;i<=totalPages;i++) nums.push(i); }
    else                         { for (let i=cp-2;i<=cp+2;i++) nums.push(i); }

    const arrowStyle = (dis: boolean): React.CSSProperties => ({
      minWidth:60, height:32, padding:'0 12px', borderRadius:7,
      border:'1px solid #E5E7EB', background:'white', color: dis ? '#D1D5DB' : '#6B7280',
      fontSize:12, cursor: dis ? 'not-allowed' : 'pointer', opacity: dis ? 0.5 : 1
    });
    const numStyle = (active: boolean): React.CSSProperties => ({
      minWidth:32, height:32, padding:'0 8px', borderRadius:7,
      border: `1px solid ${active ? '#2563EB' : '#E5E7EB'}`,
      background: active ? '#2563EB' : 'white',
      color: active ? 'white' : '#6B7280',
      fontSize:12, fontWeight: active ? 600 : 400, cursor:'pointer'
    });

    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:20,
        flexWrap:'wrap', gap:12 }}>
        <span style={{ fontSize:12, color:'#9CA3AF' }}>
          Showing {start}–{end} of {totalItems} appointments
        </span>
        <div style={{ display:'flex', gap:4 }}>
          <button style={arrowStyle(cp===1)} disabled={cp===1} onClick={() => handlePageChange(cp-1)}>← Prev</button>
          {nums.map(n => (
            <button key={n} style={numStyle(cp===n)} onClick={() => handlePageChange(n)}>{n}</button>
          ))}
          <button style={arrowStyle(cp===totalPages)} disabled={cp===totalPages} onClick={() => handlePageChange(cp+1)}>Next →</button>
        </div>
      </div>
    );
  };

  // ── Table Row ───────────────────────────────────────────────────────────────
  const AppointmentRow: React.FC<{ appointment: Appointment }> = ({ appointment: apt }) => {
    const q      = searchTerm.trim();
    const date   = formatAppointmentDate(apt.start_time);
    const tStart = formatAppointmentTime(apt.start_time);
    const tEnd   = formatAppointmentTime(apt.end_time);
    const booked = formatCreatedAt(apt.createdAt);
    const isHov  = hoveredRow === apt.id;
    const TD: React.CSSProperties = {
      padding:'14px 20px', fontSize:13, color:'#111827',
      verticalAlign:'top', borderBottom:'1px solid #F3F4F6'
    };

    return (
      <tr style={{ background: isHov ? '#F9FAFB' : 'white', transition:'background 0.1s' }}
        onMouseEnter={() => setHoveredRow(apt.id)}
        onMouseLeave={() => setHoveredRow(null)}>

        {/* Service */}
        <td style={TD}>
          <div style={{ fontWeight:500, fontSize:13, color:'#111827' }}>
            <Highlight text={apt.ProviderService.Service.name} term={q}/>
          </div>
          <div style={{ fontSize:11, color:'#9CA3AF', marginTop:2 }}>
            {apt.ProviderService.Category.name}
          </div>
          <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>
            <span style={{ fontWeight:500 }}>{formatCurrency(apt.ProviderService.custom_price)}</span>
            <span style={{ color:'#9CA3AF' }}> · {apt.ProviderService.custom_duration} min</span>
          </div>
        </td>

        {/* Customer */}
        <td style={TD}>
          <div style={{ fontWeight:500, fontSize:13 }}>
            <Highlight text={apt.customer.name} term={q}/>
          </div>
          {apt.customer.email && (
            <div style={{ fontSize:11, color:'#9CA3AF', marginTop:2,
              maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {apt.customer.email}
            </div>
          )}
          {apt.customer.mobile && (
            <div style={{ fontSize:11, color:'#9CA3AF', marginTop:1 }}>{apt.customer.mobile}</div>
          )}
        </td>

        {/* Date & Time */}
        <td style={TD}>
          <div style={{ fontWeight:500, fontSize:13 }}>{date}</div>
          <div style={{ fontSize:12, color:'#6B7280', marginTop:3 }}>{tStart} – {tEnd}</div>
          <div style={{ fontSize:11, color:'#9CA3AF', marginTop:4 }}>Booked: {booked}</div>
        </td>

        {/* Staff */}
        <td style={TD}>
          <div style={{ fontWeight:500, fontSize:13 }}>
            <Highlight text={apt.staff.name} term={q}/>
          </div>
          {apt.staff.phone && (
            <div style={{ fontSize:11, color:'#9CA3AF', marginTop:2 }}>{apt.staff.phone}</div>
          )}
          <span style={{
            display:'inline-block', marginTop:4, fontSize:10, padding:'2px 8px',
            borderRadius:20, fontWeight:500,
            background:  apt.staff.available ? '#F0FDF4' : '#F9FAFB',
            color:       apt.staff.available ? '#166534' : '#9CA3AF',
            border:     `1px solid ${apt.staff.available ? '#BBF7D0' : '#E5E7EB'}`
          }}>
            {apt.staff.available ? 'Available' : 'Unavailable'}
          </span>
        </td>

        {/* Status */}
        <td style={TD}><StatusBadge status={apt.status}/></td>

        {/* Actions */}
        <td style={TD}><ActionButtons appointment={apt}/></td>
      </tr>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'#F9F8F5',
      fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,sans-serif' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:28 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:'#2563EB',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v5h5M12 7v5l4 2"/>
                </svg>
              </div>
              <h1 style={{ fontSize:20, fontWeight:600, color:'#111827', margin:0 }}>Appointment History</h1>
            </div>
            <p style={{ fontSize:13, color:'#6B7280', marginTop:2, marginLeft:44 }}>
              Manage and track all customer appointments
            </p>
          </div>
          <button onClick={() => fetchAppointments(currentPage, filter)} style={{
            display:'flex', alignItems:'center', gap:6, padding:'7px 14px',
            border:'1px solid #E5E7EB', borderRadius:8, background:'white',
            color:'#6B7280', fontSize:13, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Toasts */}
        {successMessage && <SuccessToast message={successMessage} onClose={() => setSuccessMessage(null)}/>}
        {error && <ErrorAlert message={error} onRetry={() => fetchAppointments(currentPage, filter)}/>}

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:20 }}>
          {[
            { label:'Total',     val: pagination?.totalItems ?? appointments.length },
            { label:'Pending',   val: statCounts.pending },
            { label:'Confirmed', val: statCounts.confirmed },
            { label:'Completed', val: statCounts.completed },
            { label:'Cancelled', val: statCounts.cancelled },
          ].map(s => (
            <div key={s.label} style={{ background:'white', border:'1px solid #E5E7EB',
              borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:600, color:'#111827' }}>{s.val}</div>
              <div style={{ fontSize:11, color:'#9CA3AF', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + filter bar */}
        <div style={{ background:'white', border:'1px solid #E5E7EB', borderRadius:12,
          padding:'12px 16px', marginBottom:16, display:'flex', flexWrap:'wrap', gap:12, alignItems:'center' }}>

          {/* Search input */}
          <div style={{ position:'relative', flex:1, minWidth:220 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
              color:'#9CA3AF', pointerEvents:'none', lineHeight:1 }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by customer, service, or staff…"
              style={{ width:'100%', padding:'8px 32px 8px 34px', border:'1px solid #E5E7EB',
                borderRadius:8, fontSize:13, background:'#F9FAFB', color:'#111827',
                outline:'none', boxSizing:'border-box' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ position:'absolute', right:8, top:'50%',
                transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer',
                color:'#9CA3AF', lineHeight:1, padding:2 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {FILTERS.map(f => {
              const active = filter === f.value;
              return (
                <button key={f.value}
                  onClick={() => { setFilter(f.value); setCurrentPage(1); }}
                  style={{ padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer',
                    border: `1px solid ${active ? '#2563EB' : '#E5E7EB'}`,
                    background: active ? '#2563EB' : 'transparent',
                    color: active ? 'white' : '#6B7280' }}>
                  {f.label}
                  {f.value === 'all' && pagination && (
                    <span style={{ marginLeft:4, opacity:0.75 }}>({pagination.totalItems})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search result info */}
        {searchTerm && !loading && (
          <p style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>
            {filteredAppointments.length} result{filteredAppointments.length !== 1 ? 's' : ''} for{' '}
            <strong style={{ color:'#374151' }}>"{searchTerm}"</strong>
            {filter !== 'all' && <> in <strong style={{ color:'#374151' }}>{filter}</strong></>}
          </p>
        )}

        {/* Table */}
        <div style={{ background:'white', border:'1px solid #E5E7EB', borderRadius:12, overflow:'hidden' }}>
          {loading ? (
            <LoadingSkeleton/>
          ) : filteredAppointments.length === 0 ? (
            <EmptyState hasSearch={!!searchTerm} onRefresh={() => fetchAppointments(1, filter)}/>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', minWidth:860, borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#F9FAFB', borderBottom:'1px solid #E5E7EB' }}>
                    {['Service','Customer','Date & Time','Staff','Status','Actions'].map(h => (
                      <th key={h} style={{ padding:'10px 20px', fontSize:11, fontWeight:600,
                        color:'#9CA3AF', textAlign:'left', letterSpacing:'0.05em',
                        textTransform:'uppercase', whiteSpace:'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map(apt => (
                    <AppointmentRow key={apt.id} appointment={apt}/>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <PaginationControls/>
      </div>
    </div>
  );
};

export default AppointmentHistory;
