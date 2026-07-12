import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  label: string;
  name: string;
  register: any;
  error?: string;
}

const PasswordInput = ({ label, name, register, error }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="text-left">
      <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          {...register(name)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-3 text-slate-500 hover:text-slate-200 cursor-pointer"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-rose-500 text-xs mt-1.5 font-mono">{error}</p>}
    </div>
  );
};

export default PasswordInput;
