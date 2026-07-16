import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="text-left">
        <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
        <input
          ref={ref}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
          {...props}
        />
        {error && <p className="text-rose-500 text-xs mt-1.5 font-mono">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
