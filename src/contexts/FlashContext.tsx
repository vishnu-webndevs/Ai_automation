import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Toast from '../components/ui/Toast';

export type FlashType = 'success' | 'error' | 'warning' | 'info';

type FlashItem = {
  id: string;
  message: string;
  type: FlashType;
  duration: number;
};

type FlashContextValue = {
  flash: (message: string, type?: FlashType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
};

const FlashContext = createContext<FlashContextValue | null>(null);

const randomId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const FlashProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<FlashItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const flash = useCallback((message: string, type: FlashType = 'info', duration = 3000) => {
    const id = randomId();
    setItems((prev) => [...prev.slice(-2), { id, message, type, duration }]);
  }, []);

  const value = useMemo<FlashContextValue>(
    () => ({
      flash,
      success: (message: string, duration?: number) => flash(message, 'success', duration),
      error: (message: string, duration?: number) => flash(message, 'error', duration),
      warning: (message: string, duration?: number) => flash(message, 'warning', duration),
      info: (message: string, duration?: number) => flash(message, 'info', duration),
    }),
    [flash]
  );

  return (
    <FlashContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[60] flex w-full max-w-xs flex-col gap-3">
        {items.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            duration={t.duration}
            onClose={() => remove(t.id)}
          />
        ))}
      </div>
    </FlashContext.Provider>
  );
};

export const useFlash = () => {
  const ctx = useContext(FlashContext);
  if (!ctx) throw new Error('useFlash must be used within FlashProvider');
  return ctx;
};

