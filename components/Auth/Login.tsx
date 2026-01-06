
import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../../types';
import { storageService } from '../../services/storageService';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = storageService.getUsers();
    const user = users.find(u => u.jerseyNumber?.toUpperCase() === jerseyNumber.toUpperCase());

    if (!user) {
      setError('Invalid Jersey Number or User not found.');
      return;
    }

    if (user.password !== password) {
      setError('Incorrect password.');
      return;
    }

    if (user.status !== UserStatus.APPROVED) {
      setError('Your registration is pending approval from the Manager.');
      return;
    }

    onLoginSuccess(user);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <img 
            src="logo.png" 
            alt="Logo" 
            className="w-20 h-20 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-gray-500 mt-2">Sign in to manage your contributions</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-100">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Jersey Number / ID</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all uppercase"
            placeholder="E.G. JSY-123"
            value={jerseyNumber}
            onChange={(e) => setJerseyNumber(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
        >
          Login
        </button>
      </form>

      <div className="mt-8 text-center border-t pt-6">
        <p className="text-sm text-gray-600">
          New to the team?{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Register Here
          </button>
        </p>
        <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-xs text-indigo-700">
          <p>Manager Default: <strong>ADMIN / admin</strong></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
