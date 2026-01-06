
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="bg-white/80 backdrop-blur-md text-gray-900 shadow-sm sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4 group cursor-pointer">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-tr from-orange-400 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <img 
                  src="logo.png" 
                  alt="Logo" 
                  className="relative w-12 h-12 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-2xl font-black tracking-tight bg-gradient-to-br from-orange-400 via-indigo-500 to-indigo-800 bg-clip-text text-transparent drop-shadow-sm select-none">
                Contribution Team
              </span>
            </div>
            
            {user && (
              <div className="flex items-center space-x-6">
                <div className="hidden md:flex flex-col items-end">
                  <p className="text-sm font-black text-slate-800 leading-none mb-1">{user.name}</p>
                  <div className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center group"
                >
                  <span>Logout</span>
                  <svg className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-3 opacity-60 grayscale hover:grayscale-0 transition-all cursor-default">
              <img src="logo.png" alt="" className="w-8 h-8 object-contain" />
              <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Contribution Team</span>
            </div>
            <div className="flex space-x-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Security</a>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Global Enterprise Solutions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
