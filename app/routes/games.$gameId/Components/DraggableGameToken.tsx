import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { useGameStore } from "~/hooks/game/useGame";
import { deleteToken, tapToken } from "~/model/game/extras";
import { Token } from "~/util/types";

type DraggableGameTokenProps = {
  token: Token;
  scale: number;
  disabled?: boolean;
};

const DraggableGameToken: React.FC<DraggableGameTokenProps> = ({
  token,
  scale,
}) => {
  const { game } = useGameStore();
  const [contextMenu, setContextMenu] = useState<{
    isVisible: boolean;
    x: number;
    y: number;
  }>({
    isVisible: false,
    x: 0,
    y: 0,
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // Handle right-click to show context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("epic");
    setContextMenu({
      isVisible: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleDelete = () => {
    if (!game) return;
    deleteToken(game.id, token.id);
    setContextMenu({ isVisible: false, x: 0, y: 0 }); // Hide the menu after deleting
  };

  // Close the context menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu({ isVisible: false, x: 0, y: 0 });
      }
    };

    if (contextMenu.isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu]);

  const handleDoubleClick = () => {
    if (!game) return;
    tapToken(game.id, token.id, !token.tapped);
  };

  const DIMENSIONS = {
    width: 250 * scale,
    height: 350 * scale,
  };
  console.log(token);

  return (
    <>
      <Draggable>
        <div
          className={
            "border border-gray-400 bg-white rounded p-1 text-center text-sm flex flex-col justify-between"
          }
          style={DIMENSIONS}
          onContextMenu={handleContextMenu} // Right-click to show context menu
          onDoubleClick={handleDoubleClick}
        >
          <div className="w-full text-left">{token.name}</div>
          {token.power != null && token.toughness != null && (
            <div className="text-sm text-right">
              {token.power}/{token.toughness}
            </div>
          )}
        </div>
      </Draggable>

      {/* Context Menu */}
      {contextMenu.isVisible && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white border border-gray-300 rounded shadow p-2"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <ul className="flex flex-col">
            <li>
              <button
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer w-full flex items-center gap-2"
                onClick={handleDelete}
              >
                Delete
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default DraggableGameToken;
