import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
export type ContextMenuItem = {
  label: string;
  icon?: ReactNode;
  action: () => void;
};
type Props = {
  x: number;
  y: number;
  isVisible: boolean;
  menuItems: ContextMenuItem[];
  onClose: () => void;
};

const CustomContextMenu = ({ x, y, isVisible, menuItems, onClose }: Props) => {
  const ref = useRef<HTMLUListElement>(null);
  const [point, setPoint] = useState({ x, y });
  useLayoutEffect(() => {
    if (!isVisible || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPoint({
      x: Math.max(8, Math.min(x, window.innerWidth - rect.width - 8)),
      y: Math.max(8, Math.min(y, window.innerHeight - rect.height - 8)),
    });
    ref.current.querySelector("button")?.focus();
  }, [x, y, isVisible]);
  useEffect(() => {
    if (!isVisible) return;
    const outside = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", key);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", onClose);
    };
  }, [isVisible, onClose]);
  if (!isVisible) return null;
  return createPortal(
    <ul
      role="menu"
      ref={ref}
      className="fixed z-[100] menu rounded-box bg-base-100 text-base-content border border-base-300 shadow-lg"
      style={{ left: point.x, top: point.y }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {menuItems.map((item) => (
        <li key={item.label}>
          <button
            onClick={() => {
              item.action();
              onClose();
            }}
          >
            {item.icon}
            {item.label}
          </button>
        </li>
      ))}
    </ul>,
    document.body
  );
};
export default CustomContextMenu;
