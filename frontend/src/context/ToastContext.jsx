import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const timer = useRef();
  const toast = useCallback((m) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2200);
  }, []);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className={`fixed bottom-6 right-6 z-[100] bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-lg shadow-lg text-sm transition-all ${msg ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        {msg}
      </div>
    </ToastCtx.Provider>
  );
}
