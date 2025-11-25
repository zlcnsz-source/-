
import React from 'react';

export const Label: React.FC<{ children: React.ReactNode, required?: boolean }> = ({ children, required }) => (
  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className, ...props }) => (
  <div className="mb-4">
    {label && <Label required={props.required}>{label}</Label>}
    <input
      className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none placeholder-gray-400 ${className || ''}`}
      {...props}
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, options: string[] }> = ({ label, options, className, ...props }) => (
  <div className="mb-4">
    {label && <Label required={props.required}>{label}</Label>}
    <div className="relative">
      <select
        className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none ${className || ''}`}
        {...props}
      >
        <option value="">请选择...</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className, ...props }) => (
  <div className="mb-4">
    {label && <Label required={props.required}>{label}</Label>}
    <textarea
      className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${className || ''}`}
      rows={3}
      {...props}
    />
  </div>
);

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center mb-4 mt-6 pb-2 border-b border-gray-100">
    <div className="w-1 h-5 bg-blue-600 rounded-full mr-3"></div>
    <h3 className="text-base font-bold text-gray-800">
      {children}
    </h3>
  </div>
);

export const ReadOnlyField: React.FC<{ label: string, value?: string | number, fullWidth?: boolean }> = ({ label, value, fullWidth }) => (
  <div className={`mb-3 ${fullWidth ? 'col-span-2' : ''}`}>
    <span className="text-gray-400 text-xs block mb-0.5 font-medium uppercase">{label}</span>
    <span className="text-gray-800 text-sm font-medium break-words leading-relaxed block bg-gray-50 p-2 rounded border border-gray-100 min-h-[36px] flex items-center">
        {value || <span className="text-gray-300 italic">无</span>}
    </span>
  </div>
);
