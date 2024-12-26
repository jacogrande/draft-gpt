import React, { useState, useRef, useEffect } from "react";
import Draggable, { DraggableEventHandler } from "react-draggable";
import colors from "tailwindcss/colors";
import { DefaultColors } from "tailwindcss/types/generated/colors";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { useGameStore } from "~/hooks/game/useGame";
import {
  deleteCounter,
  updateCounterPosition,
  updateCounterValue,
} from "~/model/game/extras";
import { Counter as CounterType } from "~/util/types";

const Counter = ({ counter }: { counter: CounterType }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    isVisible: false,
    x: 0,
    y: 0,
  });

  // Position state so that we can show the counters in their last known position
  const [position, setPosition] = useState(counter.position);

  const bgColor = colors[counter.color as keyof DefaultColors][500];

  const { game } = useGameStore();
  const setPauseCommands = useGlobalStore((state) => state.setPauseCommands);

  const menuRef = useRef<HTMLDivElement>(null);

  const handleDragStop: DraggableEventHandler = (_e, data) => {
    if (!game) return;
    const { x, y } = data;
    setPosition({ x, y });
    updateCounterPosition(game.id, counter.id, { x, y });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Show the custom menu at the mouse location
    setContextMenu({
      isVisible: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Close the context menu
    setContextMenu({ ...contextMenu, isVisible: false });
  };

  const handleDelete = () => {
    if (!game) return;
    deleteCounter(game.id, counter.id);

    // Close the context menu
    setContextMenu({ ...contextMenu, isVisible: false });
  };

  const handleFocus = () => {
    // Pause commands so user can type
    setPauseCommands(true);
  };

  const handleBlur = () => {
    // Resume commands and exit editing mode
    setPauseCommands(false);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!game) return;
    const newValue = e.target.value;
    updateCounterValue(game.id, counter.id, newValue);
  };

  // Optionally, close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu({ ...contextMenu, isVisible: false });
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

  return (
    <>
      {/* The Counter itself */}
      <Draggable
        position={position}
        onStop={handleDragStop}
        cancel={isEditing ? "input" : ""}
      >
        <div
          tabIndex={0}
          role="button"
          style={{ backgroundColor: bgColor }}
          className="rounded-full w-6 h-6 absolute font-bold text-center text-sm 
                     flex items-center justify-center cursor-move text-white"
          onContextMenu={handleContextMenu}
          onDoubleClick={handleEdit}
        >
          {isEditing ? (
            <input
              type="text"
              value={counter.value}
              className="bg-transparent text-center w-full outline-none"
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              autoFocus
            />
          ) : (
            <span>{counter.value}</span>
          )}
        </div>
      </Draggable>

      {/* The custom context menu. */}
      {contextMenu.isVisible && (
        <div
          ref={menuRef}
          className="fixed bg-white border rounded-md gap-0 border-gray-300 shadow-md z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <ul className="flex flex-col">
            <li>
              <button
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer w-full flex items-center gap-2"
                onClick={handleEdit}
              >
                Edit
              </button>
            </li>
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

export default Counter;
