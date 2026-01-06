
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import Layout from './components/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChangePassword from './components/Auth/ChangePassword';
import { ClientDashboard } from './frontend/components/Dashboard/ClientDashboard';
import { ManagerDashboard } from './frontend/components/Dashboard/ManagerDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [view, setView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('hub_session');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('hub_session', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    setImpersonatedUser(null);
    localStorage.removeItem('hub_session');
    setView('LOGIN');
  };

  const handleImpersonate = (client: User) => {
    setImpersonatedUser(client);
  };

  const handleStopImpersonating = () => {
    setImpersonatedUser(null);
  };

  if (loading) return null;

  // Use the impersonated user if one exists, otherwise use the logged-in user
  const activeUser = impersonatedUser || user;

  return (
    <Layout user={user} onLogout={handleLogout}>
      {!user ? (
        view === 'LOGIN' ? (
          <Login onLoginSuccess={handleLogin} onNavigateToRegister={() => setView('REGISTER')} />
        ) : (
          <Register onRegisterSuccess={() => setView('LOGIN')} onNavigateToLogin={() => setView('LOGIN')} />
        )
      ) : activeUser && activeUser.isFirstLogin && activeUser.role === UserRole.CLIENT && !impersonatedUser ? (
        <ChangePassword user={activeUser} onSuccess={handleLogin} />
      ) : impersonatedUser ? (
        <ClientDashboard 
          user={impersonatedUser} 
          isManagerPreview={true} 
          onBackToManager={handleStopImpersonating} 
        />
      ) : user.role === UserRole.MANAGER ? (
        <ManagerDashboard onImpersonateClient={handleImpersonate} />
      ) : (
        <ClientDashboard user={user} />
      )}
    </Layout>
  );
};

export default App;
