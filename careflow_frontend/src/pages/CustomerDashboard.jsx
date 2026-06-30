import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Briefcase, Calendar, CheckCircle2, Clock, AlertCircle, PlusCircle, TrendingUp, ShieldCheck, RefreshCw } from 'lucide-react';

export default function CustomerDashboard({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('Medical Surgery & Procedure');
  const [monthlyIncome, setMonthlyIncome] = useState('');

  const token = localStorage.getItem('token');

  const fetchMyApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/v1/loans/my-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data.applications || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch loan applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyApplications();
    }
  }, [token]);

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/v1/loans/apply',
        {
          amount: parseFloat(amount),
          purpose,
          monthly_income: parseFloat(monthlyIncome)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg(response.data.message || 'Loan application submitted!');
      setAmount('');
      setMonthlyIncome('');
      fetchMyApplications(); // Refresh table
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting loan application');
    } finally {
      setSubmitting(false);
    }
  };

  // Summary calculation
  const totalApplied = applications.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const approvedCount = applications.filter(a => a.status === 'Approved').length;
  const pendingCount = applications.filter(a => a.status === 'Pending Review').length;

  return (
    <div className="page-container animate-fade" style={{ padding: '32px 0' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(255,241,242,0.9), rgba(255,255,255,0.95))', padding: '32px', borderRadius: '24px', border: '1px solid rgba(244, 63, 94, 0.25)', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 12px 36px rgba(244, 63, 94, 0.1)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <ShieldCheck size={28} color="#f43f5e" />
            <span style={{ color: '#f43f5e', fontWeight: '700', fontSize: '0.95rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>CareFlow Financial Portal</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', background: 'linear-gradient(135deg, #be185d, #1e293b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Healthcare Financing & Loans
          </h1>
          <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: '1rem', fontWeight: '500' }}>Manage your treatment financing, submit healthcare loan applications, and track approval status in real time.</p>
        </div>
        <button onClick={fetchMyApplications} className="btn" style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', color: '#be185d', cursor: 'pointer', fontWeight: '600' }}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Summary Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: '#ffffff', border: '1px solid rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', gap: '18px', boxShadow: '0 6px 20px rgba(244, 63, 94, 0.06)' }}>
          <div style={{ background: 'rgba(244, 63, 94, 0.12)', padding: '16px', borderRadius: '16px', color: '#f43f5e' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>Total Financing Applied</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: '4px 0 0' }}>${totalApplied.toLocaleString()}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: '#ffffff', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', gap: '18px', boxShadow: '0 6px 20px rgba(245, 158, 11, 0.06)' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.12)', padding: '16px', borderRadius: '16px', color: '#d97706' }}>
            <Clock size={28} />
          </div>
          <div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>Pending Review</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: '4px 0 0' }}>{pendingCount} Applications</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: '#ffffff', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', gap: '18px', boxShadow: '0 6px 20px rgba(16, 185, 129, 0.06)' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '16px', borderRadius: '16px', color: '#059669' }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>Approved Loans</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: '4px 0 0' }}>{approvedCount} Approved</h3>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e', color: '#fb7185', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#6ee7b7', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle2 size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Form on left, Table on right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* Loan Application Form Card */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', background: '#ffffff', border: '1px solid rgba(244, 63, 94, 0.2)', boxShadow: '0 16px 40px rgba(244, 63, 94, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(244, 63, 94, 0.15)' }}>
            <PlusCircle size={24} color="#f43f5e" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Apply for New Loan</h2>
          </div>

          <form onSubmit={handleApplyLoan}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', color: '#1e293b', marginBottom: '8px', fontWeight: '600' }}>Requested Loan Amount ($)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input 
                  type="number" 
                  step="any"
                  className="form-input" 
                  style={{ width: '100%', padding: '12px 12px 12px 40px' }}
                  placeholder="e.g. 15000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', color: '#1e293b', marginBottom: '8px', fontWeight: '600' }}>Loan Purpose</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <select 
                  className="form-input"
                  style={{ width: '100%', padding: '12px 12px 12px 40px' }}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                >
                  <option value="Medical Surgery & Procedure">Medical Surgery & Procedure</option>
                  <option value="Hospital Inpatient Care">Hospital Inpatient Care</option>
                  <option value="Emergency Treatment Financing">Emergency Treatment Financing</option>
                  <option value="Maternity & Childcare">Maternity & Childcare</option>
                  <option value="Home Improvement & Rehab">Home Improvement & Rehab</option>
                  <option value="General Health Expenses">General Health Expenses</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label" style={{ display: 'block', color: '#1e293b', marginBottom: '8px', fontWeight: '600' }}>Monthly Income ($)</label>
              <div style={{ position: 'relative' }}>
                <TrendingUp size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input 
                  type="number" 
                  step="any"
                  className="form-input" 
                  style={{ width: '100%', padding: '12px 12px 12px 40px' }}
                  placeholder="e.g. 5000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  required
                />
              </div>
              {amount && monthlyIncome && (
                <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(244, 63, 94, 0.08)', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.2)', fontSize: '0.85rem', color: '#be185d', fontWeight: '600' }}>
                  💡 Estimated DTI Impact: ~{( (parseFloat(amount) / 36) / parseFloat(monthlyIncome) * 100 ).toFixed(1)}% monthly commitment over 3 years.
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting}
              style={{ width: '100%', padding: '16px', borderRadius: '14px', fontWeight: '700', fontSize: '1.05rem', border: 'none', cursor: 'pointer' }}
            >
              {submitting ? 'Submitting Application...' : 'Submit Loan Request'}
            </button>
          </form>
        </div>

        {/* My Applications Table / List */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', background: '#ffffff', border: '1px solid rgba(244, 63, 94, 0.2)', boxShadow: '0 16px 40px rgba(244, 63, 94, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(244, 63, 94, 0.15)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>My Applications</h2>
            <span style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', color: '#be185d', fontWeight: '600' }}>
              {applications.length} Records
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading loan records...</div>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: 'rgba(244, 63, 94, 0.04)', borderRadius: '16px', border: '1 dashed rgba(244, 63, 94, 0.2)' }}>
              <AlertCircle size={36} color="#f43f5e" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#1e293b', fontWeight: '700', margin: '0 0 6px' }}>No Loan Applications Found</p>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Submit your first loan request using the form on the left.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {applications.map((app) => {
                let statusColor = '#d97706';
                let statusBg = 'rgba(245, 158, 11, 0.15)';
                if (app.status === 'Approved') {
                  statusColor = '#059669';
                  statusBg = 'rgba(16, 185, 129, 0.15)';
                } else if (app.status === 'Rejected') {
                  statusColor = '#e11d48';
                  statusBg = 'rgba(244, 63, 94, 0.15)';
                }

                return (
                  <div key={app.id} style={{ padding: '20px', background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(244, 63, 94, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(244, 63, 94, 0.04)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#1e293b' }}>${app.amount.toLocaleString()}</span>
                        <span style={{ background: statusBg, color: statusColor, padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                          {app.status}
                        </span>
                      </div>
                      <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                        <Briefcase size={14} color="#f43f5e" /> {app.purpose}
                      </p>
                      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                        Reported Income: ${app.monthly_income.toLocaleString()} / mo
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                        <Calendar size={13} />
                        <span>{app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Just now'}</span>
                      </div>
                      <span>App #{app.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
