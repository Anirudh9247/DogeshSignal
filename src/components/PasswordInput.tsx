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
    <div>
      <label className="text-sm text-gray-300">{label}</label>
      <div className="relative mt-2">
        <input
          type={showPassword ? 'text' : 'password'}
          {...register(name)}
          className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-3 text-gray-400 hover:text-gray-300"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default PasswordInput;
