import React, { useState, useRef, useEffect } from "react";
import Draggable, { DraggableEventHandler } from "react-draggable";
import colors from "tailwindcss/colors";
import { DefaultColors } from "tailwindcss/types/generated/colors";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { GameCounter as CounterType } from "~/hooks/game/useGame";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { useToast } from "~/hooks/useToast";

const HIDDEN = { isVisible: false, x: 0, y: 0 };

const Counter = ({ counter }: { counter: CounterType }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(counter.value);
  const [contextMenu, setContextMenu] = useState(HIDDEN);
  const [position, setPosition] = useState(counter.position);

  const bgColor = colors[counter.color as keyof DefaultColors][500];

  const setValue = useMutation(api.game.counters.setValue);
  const move = useMutation(api.game.counters.move);
  const remove = useMutation(api.game.counters.remove);
  const setPauseCommands = useGlobalStore((state) => state.setPauseCommands);
  const toast = useToast((state) => state.toast);

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) setDraftValue(counter.value);
  }, [counter.value, isEditing]);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleDragStop: DraggableEventHandler = (_e, data) => {
    const { x, y } = data;
    setPosition({ x, y });
    move({ counterId: counter.id, position: { x, y } }).catch(() =>
      toast("Could not move counter", "error")
    );
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ isVisible: true, x: e.clientX, y: e.clientY });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setContextMenu(HIDDEN);
  };

  const handleDelete = () => {
    remove({ counterId: counter.id }).catch(() =>
      toast("Could not delete counter", "error")
    );
    setContextMenu(HIDDEN);
  };

  const handleFocus = () => {
    setPauseCommands(true);
  };

  const handleBlur = () => {
    setPauseCommands(false);
    setIsEditing(false);
    if (draftValue !== counter.value) {
      setValue({ counterId: counter.id, value: draftValue }).catch(() => {
        setDraftValue(counter.value);
        toast("Could not update counter", "error");
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  useEffect(() => {
    if (!contextMenu.isVisible) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(HIDDEN);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenu]);

  return (
    <>
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
              ref={inputRef}
              type="text"
              aria-label="Counter value"
              value={draftValue}
              maxLength={4}
              className="bg-transparent text-center w-full outline-none"
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) => setDraftValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <span>{counter.value}</span>
          )}
        </div>
      </Draggable>

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
