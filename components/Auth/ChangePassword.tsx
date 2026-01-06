
import React, { useState } from 'react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';

interface ChangePasswordProps {
  user: User;
  onSuccess: (updatedUser: User) => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ user, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    const users = storageService.getUsers();
    const updatedUser = { ...user, password, isFirstLogin: false };
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    
    storageService.saveUsers(updatedUsers);
    storageService.setCurrentUser(updatedUser);
    onSuccess(updatedUser);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border-t-4 border-indigo-600">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">First Login Security</h2>
      <p className="text-gray-600 mb-6 text-sm">Please update your temporary password to a secure one of your choice.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-xs font-medium border border-red-100">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
