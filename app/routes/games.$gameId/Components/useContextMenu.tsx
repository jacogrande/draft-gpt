import { useCallback, useRef, useState } from "react";

const useContextMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLUListElement>(null);

  const handleRightClick = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    e.preventDefault();
    const { target, clientX, clientY } = e;
    const rect = (target as HTMLElement).getBoundingClientRect();
    const ulRect = ref.current.getBoundingClientRect();
    const xDiff = clientX - rect.x - ulRect.width;
    const yDiff = clientY - rect.y + ulRect.height;
    setPos({ x: xDiff, y: yDiff });
    // setPos({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  }, []);

  const contextMenu = (
    <ul
      className="absolute menu bg-base-200 rounded-box w-56 z-20"
      ref={ref}
      style={{
        top: pos.y,
        left: pos.x,
        display: isOpen ? "block" : "none",
      }}
    >
      <li>
        <button>a</button>
      </li>
      <li>
        <a>Item 2</a>
      </li>
      <li>
        <a>Item 3</a>
      </li>
    </ul>
  );

  return { handleRightClick, contextMenu };
};

export default useContextMenu;
