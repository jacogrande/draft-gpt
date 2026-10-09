import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { GameToken } from "~/hooks/game/useGame";
import TokenFace from "~/routes/games.$gameId/Components/TokenFace";

type DraggableGameTokenProps = { token: GameToken; scale: number };

const HIDDEN = { isVisible: false, x: 0, y: 0 };

const DraggableGameToken = ({ token, scale }: DraggableGameTokenProps) => {
  const setTapped = useMutation(api.game.tokens.setTapped);
  const remove = useMutation(api.game.tokens.remove);
  const [contextMenu, setContextMenu] = useState(HIDDEN);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ isVisible: true, x: e.clientX, y: e.clientY });
  };

  const handleDelete = () => {
    void remove({ tokenId: token.id });
    setContextMenu(HIDDEN);
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
      <Draggable>
        <div
          onContextMenu={handleContextMenu}
          onDoubleClick={() =>
            setTapped({ tokenId: token.id, tapped: !token.tapped })
          }
        >
          <TokenFace token={token} scale={scale} />
        </div>
      </Draggable>

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
