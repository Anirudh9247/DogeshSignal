import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button = ({ children, disabled, className = '', ...props }: ButtonProps) => {
  return (
    <button
      disabled={disabled}
      className={`w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-white transition ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-600'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
