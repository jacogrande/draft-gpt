import React, { useEffect } from "react";

type MenuItem = {
  label: string;
  action: () => void;
};

type CustomContextMenuProps = {
  x: number;
  y: number;
  isVisible: boolean;
  menuItems: MenuItem[];
  onClose: () => void;
};

const CustomContextMenu: React.FC<CustomContextMenuProps> = ({
  x,
  y,
  isVisible,
  menuItems,
  onClose,
}) => {
  useEffect(() => {
    const handleClickOutside = () => {
      onClose();
    };

    if (isVisible) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <ul
      className="fixed bg-white border rounded-md gap-0 border-gray-300 shadow-md z-50"
      style={{ top: y, left: x }}
    >
      {menuItems.map((item, index) => (
        <li key={index}>
          <button
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer w-full"
            onClick={() => {
              item.action();
              onClose();
            }}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default CustomContextMenu;
