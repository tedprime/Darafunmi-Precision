import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, className = "", ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        type="text"
        id={id}
        className={`mt-1 block w-full px-3 py-2.5 border border-gray-200 rounded-lg shadow-sm text-sm text-gray-900 placeholder-gray-400 bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
