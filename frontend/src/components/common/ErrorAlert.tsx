import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => (
  <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 flex items-start justify-between gap-3 text-sm text-rose-800 my-4 shadow-sm">
    <div className="flex items-start gap-2.5">
      <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold">Attention Required</p>
        <p className="mt-0.5 text-rose-700">{message}</p>
      </div>
    </div>
    {onClose && (
      <button
        onClick={onClose}
        className="text-rose-500 hover:text-rose-700 p-1 rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);
