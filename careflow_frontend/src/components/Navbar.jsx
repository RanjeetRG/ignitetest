import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, LogOut, UserCheck } from 'lucide-react';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('loan_user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)', padding: '8px', borderRadius: '12px', display: 'flex', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 12px rgba(244, 63, 94, 0.25)' }}>
          <Activity size={24} color="#ffffff" />
        </div>
        <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#1e293b' }}>Care<span style={{ color: '#f43f5e' }}>Flow</span></span>
      </div>

      <div className="navbar-links">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user.role === 'customer' && (
              <button onClick={() => navigate('/customer-dashboard')} className="btn" style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#be185d', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '6px 12px', fontSize: '0.85rem', fontWeight: '600' }}>
                Financing Portal
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(244, 63, 94, 0.08)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              <UserCheck size={16} color="#f43f5e" />
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{user.username}</span>
              <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#be185d', textTransform: 'uppercase', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', marginLeft: '4px' }}>
                {user.role}
              </span>
            </div>

            <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>CareFlow Clinical & Financing Portal</span>
        )}
      </div>
    </nav>
  );
}
