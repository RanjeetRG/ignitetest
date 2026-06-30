import React from 'react';
import Navbar from './Navbar';

export default function Layout({ user, setUser, children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar user={user} setUser={setUser} />
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
