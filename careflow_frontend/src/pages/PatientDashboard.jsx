import React, { useState, useEffect } from 'react';
import {
  CalendarPlus, Activity, Building2, Stethoscope,
  Clock, CheckCircle2, XCircle, CalendarCheck, ClipboardList, ChevronRight
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────
const STATUS_LABELS = {
  waiting:         'Waiting',
  in_consultation: 'In Consultation',
  completed:       'Completed',
  cancelled:       'Cancelled',
};

function StatusBadge({ status }) {
  const dotColors = {
    waiting:         '#fbbf24',
    in_consultation: '#67e8f9',
    completed:       '#34d399',
    cancelled:       '#fb7185',
  };
  return (
    <span className={`badge badge-${status}`}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: dotColors[status] || '#a1a1aa',
        display: 'inline-block', flexShrink: 0
      }} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ─── Stat Card ─────────────────────────────────────────────
function StatCard({ label, value, color, iconBg, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg }}>
        <Icon size={20} color={color} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
    </div>
  );
}

// ─── Booking Form Modal ────────────────────────────────────
const DEPARTMENTS = [
  'Cardiology', 'General Practice', 'Pediatrics',
  'Neurology', 'Orthopedics', 'Dermatology', 'ENT', 'Oncology',
];

function BookingModal({ onClose, onSuccess, userId }) {
  const [department,       setDepartment]       = useState('');
  const [doctorName,       setDoctorName]       = useState('');
  const [appointmentDate,  setAppointmentDate]  = useState(
    new Date().toISOString().split('T')[0]
  );
  const [symptoms, setSymptoms] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!department) { setError('Please select a department.'); return; }
    if (!doctorName.trim()) { setError('Please enter the doctor\'s name.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: userId,
          department,
          doctor_name: doctorName.trim(),
          appointment_date: appointmentDate,
          symptoms: symptoms.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      onSuccess(data.appointment);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-panel modal-panel animate-fade">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16
          }}>
            <CalendarPlus size={24} color="#f43f5e" />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: 4 }}>
            Physician Booking Form
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Fill in the details below. A queue token will be issued automatically.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
            color: '#fb7185', padding: '12px 16px', borderRadius: 10, marginBottom: 20,
            fontSize: '0.88rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Department */}
          <div className="form-group">
            <label className="form-label">Medical Department</label>
            <div style={{ position: 'relative' }}>
              <Building2 size={17} color="var(--text-muted)"
                style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <select
                className="form-input"
                style={{ paddingLeft: 44 }}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="">— Select Department —</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Doctor Name & Slot */}
          <div className="form-group">
            <label className="form-label">Select Doctor/Slot</label>
            <div style={{ position: 'relative' }}>
              <Stethoscope size={17} color="var(--text-muted)"
                style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 44 }}
                placeholder="e.g. Dr. Ananya Rao (Morning Slot 10:00 AM)"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Date Row */}
          <div className="form-group">
            <label className="form-label">Appointment Date</label>
            <input
              type="date"
              className="form-input"
              value={appointmentDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
            />
          </div>

          {/* Symptoms */}
          <div className="form-group" style={{ marginBottom: 8 }}>
            <label className="form-label">Symptoms / Reason for Visit</label>
            <textarea
              className="form-input"
              style={{ minHeight: 92, resize: 'vertical' }}
              placeholder="Briefly describe your symptoms or reason (e.g. fever for 3 days, follow-up…)"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button type="button" onClick={onClose} className="btn"
              style={{ flex: 1, background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#64748b', fontWeight: '600' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
              {loading ? 'Issuing Token…' : 'Confirm & Get Token'}
              {!loading && <ChevronRight size={17} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Patient Dashboard ─────────────────────────────────────
export default function PatientDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [showModal,    setShowModal]    = useState(false);
  const [fetching,     setFetching]     = useState(true);

  const fetchMyAppointments = async () => {
    if (!user) return;
    try {
      const res  = await fetch(`http://localhost:5000/api/appointments/my/${user.id}`);
      const data = await res.json();
      if (res.ok) setAppointments(data.appointments || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchMyAppointments(); }, [user]);

  const handleBookingSuccess = () => {
    setShowModal(false);
    fetchMyAppointments();
  };

  // ── Derived stats ──
  const total      = appointments.length;
  const waiting    = appointments.filter(a => a.status === 'waiting').length;
  const active     = appointments.find(a => a.status === 'waiting' || a.status === 'in_consultation');
  const completed  = appointments.filter(a => a.status === 'completed').length;
  const cancelled  = appointments.filter(a => a.status === 'cancelled').length;

  return (
    <div className="page-container animate-fade">

      {/* ── Page Header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Patient Dashboard</h1>
          <p className="page-subtitle">
            Book outpatient consultations and track your live queue token status.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ padding: '12px 22px' }}>
          <CalendarPlus size={19} />
          Book New
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-grid">
        <StatCard
          label="Total Appointments"
          value={total}
          color="#1e293b"
          iconBg="rgba(244, 63, 94, 0.12)"
          icon={ClipboardList}
        />
        <StatCard
          label="Waiting in Queue"
          value={waiting}
          color="#fbbf24"
          iconBg="rgba(245,158,11,0.12)"
          icon={Clock}
        />
        <StatCard
          label="Completed Visits"
          value={completed}
          color="#34d399"
          iconBg="rgba(16,185,129,0.12)"
          icon={CheckCircle2}
        />
        <StatCard
          label="Cancelled"
          value={cancelled}
          color="#fb7185"
          iconBg="rgba(244,63,94,0.12)"
          icon={XCircle}
        />
      </div>

      {/* ── Live Queue Tracker ── */}
      {active ? (
        <div className="queue-tracker glass-panel" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span className="pulse-dot" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              View Booked Queue #
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 28 }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Department</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{active.department}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Physician</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#a1a1aa' }}>{active.doctor_name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Date</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{active.appointment_date}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Your Token</div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
                #{active.queue_number}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Status</div>
              <StatusBadge status={active.status} />
            </div>
          </div>
        </div>
      ) : !fetching && (
        <div className="glass-panel" style={{ padding: '22px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
          <CalendarCheck size={22} color="var(--text-muted)" />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.93rem' }}>
            No active queue token. Click <strong style={{ color: '#1e293b' }}>Book New</strong> to get one.
          </span>
        </div>
      )}

      {/* ── Appointment History Table ── */}
      <div className="glass-panel" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Appointment History</h2>
          {total > 0 && (
            <span style={{ fontSize: '0.82rem', color: '#be185d', background: 'rgba(244, 63, 94, 0.1)', padding: '4px 12px', borderRadius: 20, fontWeight: '600' }}>
              {total} record{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {fetching ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>Loading…</p>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ClipboardList size={26} color="var(--text-muted)" />
            </div>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>No appointments yet</p>
            <p style={{ fontSize: '0.88rem' }}>Your consultation history will appear here after you book.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Department</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Symptoms</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => (
                  <tr key={appt.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1.05rem' }}>
                        #{appt.queue_number}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{appt.department}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{appt.doctor_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{appt.appointment_date}</td>
                    <td style={{ maxWidth: 260, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                      {appt.symptoms || '—'}
                    </td>
                    <td><StatusBadge status={appt.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Booking Modal ── */}
      {showModal && (
        <BookingModal
          onClose={() => setShowModal(false)}
          onSuccess={handleBookingSuccess}
          userId={user?.id}
        />
      )}
    </div>
  );
}
