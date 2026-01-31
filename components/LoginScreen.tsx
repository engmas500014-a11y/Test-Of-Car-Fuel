
import React, { useState } from 'react';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
  users: User[];
}

const LoginScreen: React.FC<Props> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('اسم المستخدم أو كلمة السر غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-600 flex flex-col justify-center items-center p-6 font-['Cairo']">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl text-white mx-auto mb-4 backdrop-blur-md">
            <i className="fas fa-car-side"></i>
          </div>
          <h1 className="text-3xl font-black text-white">توفير البنزين</h1>
          <p className="text-emerald-100 opacity-80 mt-2">نظام الإدارة المتكامل</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-8 rounded-[2.5rem] shadow-2xl space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold text-center animate-bounce">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest mr-1 text-right">اسم المستخدم</label>
            <input 
              type="text" 
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 text-right"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest mr-1 text-right">كلمة السر</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 text-right"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-200 active:scale-95 transition-transform"
          >
            تسجيل الدخول
          </button>
        </form>
        
        {/* Hint removed for security as requested */}
        <p className="text-center text-emerald-100 text-[10px] mt-8 opacity-40">
          نظام مشفر لإدارة استهلاك الوقود
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
