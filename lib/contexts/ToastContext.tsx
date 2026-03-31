"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
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

  const showToast = useCallback((options: ToastOptions) => {
    setToastConfig(options);
    setIsVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setIsVisible(false);
    // Clear config after animation completes
    setTimeout(() => {
      setToastConfig(null);
    }, 300);
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
          show={isVisible}
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
