import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button = ({ children, disabled, className = '', ...props }: ButtonProps) => {
  return (
    <button
      disabled={disabled}
      className={`w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-slate-950 transition cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
