import { useEffect } from "react";
import { create } from "zustand";
import { DaisyColor } from "~/util/types";

/******** CONSTANTS AND TYPES ********/
const TOAST_TIMEOUT = 5 * 1000; // 5 seconds

type Toast = {
  message: string;
  type?: DaisyColor;
};

export type ToastFunction = (message: string, type?: DaisyColor) => void;

type ToastStore = {
  currentToast: Toast;
  toast: ToastFunction;
  clearToast: () => void;
};

/******** IMPLEMENTATION ********/
export const useToast = create<ToastStore>((set) => ({
  currentToast: { message: "" },
  toast: (message: string, type?: DaisyColor) => {
    set({ currentToast: { message, type } });
  },
  clearToast: () => {
    set({ currentToast: { message: "" } });
  },
}));

/**
 * Toast provider that displays toasts as they are set
 * must be added to the root of the app
 */
export const ToastProvider = () => {
  const { currentToast, clearToast } = useToast();

  useEffect(() => {
    if (!currentToast) return;
    const timer = setTimeout(() => {
      clearToast();
    }, TOAST_TIMEOUT);
    return () => clearTimeout(timer);
  }, [currentToast, clearToast]);

  if (!currentToast.message) return null;
  return (
    <div className="toast toast-end">
      <div className={`alert alert-${currentToast.type || "info"}`}>
        <span>{currentToast.message}</span>
      </div>
    </div>
  );
};
