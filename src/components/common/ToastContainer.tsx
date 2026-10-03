import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
            error: <AlertCircle className="w-5 h-5 text-rose-500" />,
            info: <Info className="w-5 h-5 text-blue-500" />,
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className="pointer-events-auto bg-white dark:bg-[#0f1714] border border-slate-200 dark:border-[#1c2e27] shadow-xl rounded-xl p-4 flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {toast.title}
                </h4>
                {toast.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-0.5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
