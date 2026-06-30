import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, User, ArrowRight, HeartPulse, ShieldCheck } from 'lucide-react';

export default function LoginPage({ setUser }) {
  const [username, setUsername] = useState('customer');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token || 'demo-bearer-token');
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('loan_user', JSON.stringify(data.user));
      setUser(data.user);

      if (data.user.role === 'customer') {
        navigate('/customer-dashboard');
      } else if (data.user.role === 'patient') {
        navigate('/patient-dashboard');
      } else {
        navigate('/doctor-dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickDemo = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="page-container animate-fade" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '42px', background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,241,242,0.9))', border: '1px solid rgba(244, 63, 94, 0.25)', boxShadow: '0 20px 50px rgba(244, 63, 94, 0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)', width: '64px', height: '64px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 8px 24px rgba(244, 63, 94, 0.3)' }}>
            <HeartPulse size={36} color="#ffffff" />
          </div>
          <h1 className="page-title" style={{ fontSize: '1.9rem', background: 'linear-gradient(135deg, #be185d, #1e293b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Auth/Login Page</h1>
          <p className="page-subtitle" style={{ color: '#64748b', marginBottom: '8px' }}>Hospital Appointment & Queue Engine</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', color: '#be185d' }}>
            <ShieldCheck size={14} /> [Checks User Role Token]
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid var(--accent-rose)', color: '#e11d48', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '44px' }}
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '44px' }}
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px', padding: '15px' }} disabled={loading}>
            <span>{loading ? 'Authenticating...' : 'Clinical Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(244, 63, 94, 0.15)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px', fontWeight: '600' }}>Instant Demo Access:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button type="button" onClick={() => quickDemo('customer', 'demo123')} className="btn" style={{ background: 'rgba(244, 63, 94, 0.08)', color: '#be185d', border: '1px solid rgba(244, 63, 94, 0.25)', fontSize: '0.82rem', padding: '10px 8px', fontWeight: '600' }}>
              Financial Portal
            </button>
            <button type="button" onClick={() => quickDemo('patient', 'demo123')} className="btn" style={{ background: 'rgba(244, 63, 94, 0.08)', color: '#be185d', border: '1px solid rgba(244, 63, 94, 0.25)', fontSize: '0.82rem', padding: '10px 8px', fontWeight: '600' }}>
              Patient Demo
            </button>
            <button type="button" onClick={() => quickDemo('doctor', 'demo123')} className="btn" style={{ background: 'rgba(244, 63, 94, 0.08)', color: '#be185d', border: '1px solid rgba(244, 63, 94, 0.25)', fontSize: '0.82rem', padding: '10px 8px', fontWeight: '600' }}>
              Doctor Demo
            </button>
            <button type="button" onClick={() => quickDemo('receptionist', 'demo123')} className="btn" style={{ background: 'rgba(244, 63, 94, 0.08)', color: '#be185d', border: '1px solid rgba(244, 63, 94, 0.25)', fontSize: '0.82rem', padding: '10px 8px', fontWeight: '600' }}>
              Staff Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
