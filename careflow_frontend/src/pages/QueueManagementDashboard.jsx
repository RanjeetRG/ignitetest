import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, Users, ShieldAlert, FileText, BellRing, UserCheck } from 'lucide-react';

export default function QueueManagementDashboard({ user }) {
  const [queue, setQueue] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'audit'
  const [loading, setLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/appointments/queue');
      const data = await res.json();
      if (res.ok) setQueue(data.queue || []);
    } catch (err) {
      console.error("Failed to fetch queue:", err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/audit/');
      const data = await res.json();
      if (res.ok) setAuditLogs(data.audit_logs || []);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchAuditLogs();
  }, []);

  const handleStatusUpdate = async (apptId, newStatus) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${apptId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: user.id, status: newStatus })
      });
      if (res.ok) {
        fetchQueue();
        fetchAuditLogs();
      }
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const activeConsultation = queue.find(q => q.status === 'in_consultation');

  return (
    <div className="page-container animate-fade">
      <div className="page-header">
        <h1 className="page-title">Doctor Dashboard</h1>
        <p className="page-subtitle">View Active Worklist and Live Queue Console for patient consultations.</p>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button 
            onClick={() => setActiveTab('queue')} 
            className="btn" 
            style={{ background: activeTab === 'queue' ? 'linear-gradient(135deg, #f43f5e, #ec4899)' : 'rgba(244, 63, 94, 0.08)', color: activeTab === 'queue' ? 'white' : '#64748b', border: '1px solid rgba(244, 63, 94, 0.2)' }}
          >
            <Users size={18} />
            <span>Active Patient Queue ({queue.length})</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('audit')} 
            className="btn" 
            style={{ background: activeTab === 'audit' ? 'linear-gradient(135deg, #f43f5e, #ec4899)' : 'rgba(244, 63, 94, 0.08)', color: activeTab === 'audit' ? 'white' : '#64748b', border: '1px solid rgba(244, 63, 94, 0.2)' }}
          >
            <ShieldAlert size={18} />
            <span>Compliance Event Audit Trail</span>
          </button>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <>
          {/* Live Queue Console Banner */}
          {activeConsultation && (
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px', background: 'rgba(244, 63, 94, 0.05)', border: '2px solid #f43f5e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="pulse-dot" />
                    <span style={{ fontWeight: '800', color: '#be185d', textTransform: 'uppercase', fontSize: '0.85rem' }}>Live Queue Console</span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Serving Token #{activeConsultation.queue_number}: {activeConsultation.patient_name}</h3>
                  <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '0.9rem' }}>Symptoms: {activeConsultation.symptoms}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => handleStatusUpdate(activeConsultation.id, 'completed')} 
                    className="btn btn-primary" 
                    style={{ padding: '12px 24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                    disabled={loading}
                  >
                    <CheckCircle size={18} /> Serve / Complete Task
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>View Active Worklist</h2>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Patient</th>
                    <th>Department</th>
                    <th>Assigned Doctor</th>
                    <th>Symptoms / Reason</th>
                    <th>Current Status</th>
                    <th>Clinical Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map(appt => (
                    <tr key={appt.id}>
                      <td style={{ fontWeight: '800', color: '#67e8f9', fontSize: '1.2rem' }}>#{appt.queue_number}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{appt.patient_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{appt.patient_email}</div>
                      </td>
                      <td style={{ fontWeight: '600', color: '#93c5fd' }}>{appt.department}</td>
                      <td>{appt.doctor_name}</td>
                      <td style={{ maxWidth: '280px' }}>{appt.symptoms}</td>
                      <td>
                        <span className={`badge badge-${appt.status}`}>{appt.status.replace('_', ' ')}</span>
                      </td>
                      <td>
                        {appt.status === 'waiting' ? (
                          <button 
                            onClick={() => handleStatusUpdate(appt.id, 'in_consultation')} 
                            className="btn btn-primary" 
                            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                            disabled={loading}
                          >
                            <BellRing size={16} /> Call Next
                          </button>
                        ) : appt.status === 'in_consultation' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleStatusUpdate(appt.id, 'completed')} 
                              className="btn btn-success" 
                              style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                              disabled={loading}
                            >
                              <CheckCircle size={16} /> Serve / Complete Task
                            </button>
                          <button 
                            onClick={() => handleStatusUpdate(appt.id, 'cancelled')} 
                            className="btn btn-danger" 
                            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                            disabled={loading}
                          >
                            <XCircle size={16} /> Cancel
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Visit Finalized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      ) : (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Clinical Security & Event Log</h2>
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Staff / Actor</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ fontWeight: '600', color: '#67e8f9' }}>{log.username}</td>
                    <td><span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>{log.action}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{log.details}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
