"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from "react";

import { Toast, ToastVariant } from "@/components/ui";

interface ToastOptions {
  message: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastConfig, setToastConfig] = useState<ToastOptions | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timersRef = useRef<{
    show?: NodeJS.Timeout;
    hide?: NodeJS.Timeout;
    clear?: NodeJS.Timeout;
  }>({});

  const showToast = useCallback((options: ToastOptions) => {
    // Clear any existing timers
    if (timersRef.current.show) clearTimeout(timersRef.current.show);
    if (timersRef.current.hide) clearTimeout(timersRef.current.hide);
    if (timersRef.current.clear) clearTimeout(timersRef.current.clear);

    setToastConfig(options);

    // Show with delay for animation
    timersRef.current.show = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    // Auto-hide after duration
    const duration = options.duration ?? 5000;
    timersRef.current.hide = setTimeout(() => {
      setIsVisible(false);
      // Clear config after animation completes
      timersRef.current.clear = setTimeout(() => {
        setToastConfig(null);
      }, 300);
    }, duration + 100);
  }, []);

  const hideToast = useCallback(() => {
    if (timersRef.current.show) clearTimeout(timersRef.current.show);
    if (timersRef.current.hide) clearTimeout(timersRef.current.hide);
    if (timersRef.current.clear) clearTimeout(timersRef.current.clear);

    setIsVisible(false);
    // Clear config after animation completes
    timersRef.current.clear = setTimeout(() => {
      setToastConfig(null);
    }, 300);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      if (timers.show) clearTimeout(timers.show);
      if (timers.hide) clearTimeout(timers.hide);
      if (timers.clear) clearTimeout(timers.clear);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Global Toast Instance */}
      {toastConfig && (
        <Toast
          message={toastConfig.message}
          description={toastConfig.description}
          variant={toastConfig.variant}
          duration={toastConfig.duration}
          isVisible={isVisible}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
