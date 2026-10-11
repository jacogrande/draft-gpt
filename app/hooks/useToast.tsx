import { useEffect } from "react";
import { create } from "zustand";

const TOAST_TIMEOUT = 5 * 1000;

export type ToastType = "info" | "success" | "warning" | "error";

const ALERT_CLASSES: Record<ToastType, string> = {
  info: "alert alert-info",
  success: "alert alert-success",
  warning: "alert alert-warning",
  error: "alert alert-error",
};

type Toast = {
  message: string;
  type?: ToastType;
};

export type ToastFunction = (message: string, type?: ToastType) => void;

type ToastStore = {
  currentToast: Toast;
  toast: ToastFunction;
  clearToast: () => void;
};

export const useToast = create<ToastStore>((set) => ({
  currentToast: { message: "" },
  toast: (message, type) => {
    set({ currentToast: { message, type } });
  },
  clearToast: () => {
    set({ currentToast: { message: "" } });
  },
}));

export const ToastProvider = () => {
  const currentToast = useToast((state) => state.currentToast);
  const clearToast = useToast((state) => state.clearToast);

  useEffect(() => {
    if (!currentToast.message) return;
    const timer = setTimeout(clearToast, TOAST_TIMEOUT);
    return () => clearTimeout(timer);
  }, [currentToast, clearToast]);

  if (!currentToast.message) return null;
  return (
    <div className="toast toast-end z-30">
      <div className={ALERT_CLASSES[currentToast.type ?? "info"]}>
        <span>{currentToast.message}</span>
      </div>
    </div>
  );
};
