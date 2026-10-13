import { api } from "@convex/_generated/api";
import { Position, Size } from "@convex/game/placement";
import { useMutation } from "convex/react";
import { useState } from "react";
import { GameToken } from "~/hooks/game/useGame";
import { useToast } from "~/hooks/useToast";
import { GAME_SCALE } from "~/util/constants";
import CustomContextMenu from "./CustomContextMenu";
import PositionedPiece from "./PositionedPiece";
import TokenFace from "./TokenFace";

const DraggableGameToken = ({
  token,
  area,
  position,
  opponent,
}: {
  token: GameToken;
  area: Size;
  position: Position;
  opponent: boolean;
}) => {
  const setTapped = useMutation(api.game.tokens.setTapped);
  const remove = useMutation(api.game.tokens.remove);
  const move = useMutation(api.game.tokens.move);
  const toast = useToast((state) => state.toast);
  const [menu, setMenu] = useState<Position | null>(null);
  const act = (operation: Promise<unknown>) =>
    operation.catch(() => toast("Could not update token", "error"));
  return (
    <PositionedPiece
      label="token"
      position={position}
      area={area}
      size={{ width: 170, height: 170 }}
      opponent={opponent}
      onMove={
        opponent
          ? undefined
          : (position) => move({ tokenId: token.id, position })
      }
    >
      <div
        className={opponent ? "rotate-180" : ""}
        onDoubleClick={
          opponent
            ? undefined
            : () =>
                void act(
                  setTapped({ tokenId: token.id, tapped: !token.tapped })
                )
        }
        onContextMenu={
          opponent
            ? undefined
            : (event) => {
                event.preventDefault();
                event.stopPropagation();
                setMenu({ x: event.clientX, y: event.clientY });
              }
        }
      >
        <TokenFace token={token} scale={GAME_SCALE} />
      </div>
      <CustomContextMenu
        x={menu?.x ?? 0}
        y={menu?.y ?? 0}
        isVisible={menu !== null}
        onClose={() => setMenu(null)}
        menuItems={[
          {
            label: token.tapped ? "Untap token" : "Tap token",
            action: () =>
              void act(setTapped({ tokenId: token.id, tapped: !token.tapped })),
          },
          {
            label: "Delete token",
            action: () => void act(remove({ tokenId: token.id })),
          },
        ]}
      />
    </PositionedPiece>
  );
};
export default DraggableGameToken;
