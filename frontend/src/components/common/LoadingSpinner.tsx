import React from 'react';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading NyayaLens data...' }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-nyaya-900 animate-spin" />
    </div>
    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
  </div>
);
