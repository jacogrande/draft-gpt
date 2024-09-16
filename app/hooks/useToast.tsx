import { useEffect } from "react";
import { create } from "zustand";
import { DaisyColor } from "~/util/types";

type Toast = {
  message: string;
  type?: DaisyColor;
};

type ToastStore = {
  currentToast: Toast;
  toast: (message: string, type?: DaisyColor) => void;
  clearToast: () => void;
};

export const useToast = create<ToastStore>((set) => ({
  currentToast: { message: "" },
  toast: (message: string, type?: DaisyColor) => {
    set({ currentToast: { message, type } });
  },
  clearToast: () => {
    set({ currentToast: { message: "" } });
  },
}));

export const ToastProvider = () => {
  const { currentToast, clearToast } = useToast();
  useEffect(() => {
    if (!currentToast) return;
    const timer = setTimeout(() => {
      clearToast();
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentToast, clearToast]);

  const alertColor: string = currentToast.type
    ? `alert-${currentToast.type}`
    : "alert-info";

  if (!currentToast.message) return null;
  return (
    <div className="toast toast-end">
      <div className={`alert ${alertColor}`}>
        <span>{currentToast.message}</span>
      </div>
    </div>
  );
};
