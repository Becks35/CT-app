
import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../../types';
import { storageService } from '../../services/storageService';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const users = storageService.getUsers();
    
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: UserRole.CLIENT,
      status: UserStatus.PENDING,
      isFirstLogin: true,
      registrationDate: new Date().toISOString(),
    };

    storageService.saveUsers([...users, newUser]);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 1000);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md text-center">
        <div className="bg-green-100 text-green-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Registration Submitted</h2>
        <p className="text-gray-600 mt-2 mb-6">
          Thank you! A manager will review your application. Once approved, you'll receive your Jersey Number and temporary password.
        </p>
        <button
          onClick={onNavigateToLogin}
          className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Back to Login
        </button>
      </div>
    );
  }

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
        <h2 className="text-3xl font-bold text-gray-800">Join the Team</h2>
        <p className="text-gray-500 mt-2">Request access to the contribution system</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Register'}
        </button>
      </form>

      <div className="mt-8 text-center border-t pt-6">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onNavigateToLogin}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login Here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
