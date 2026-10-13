import { fromPixels } from "@convex/game/placement";
import { useToast } from "~/hooks/useToast";
import { useState } from "react";
import { GiToken } from "react-icons/gi";
import { GrStatusPlaceholderSmall } from "react-icons/gr";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { useGameId } from "~/hooks/game/useGame";
import CustomContextMenu from "~/routes/games.$gameId/Components/CustomContextMenu";
import TokenModal from "~/routes/games.$gameId/Components/TokenModal";

const useContextMenu = () => {
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const gameId = useGameId();
  const toast = useToast((state) => state.toast);
  const [placement, setPlacement] = useState({ x: 0.5, y: 0.5 });
  const createCounter = useMutation(api.game.counters.create);

  const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const area = event.currentTarget
      .closest("[data-field]")
      ?.querySelector("[data-piece-area]")
      ?.getBoundingClientRect();
    if (area)
      setPlacement(
        fromPixels(
          { x: event.clientX - area.x, y: event.clientY - area.y },
          area,
          { width: 32, height: 32 }
        )
      );
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setIsContextMenuVisible(true);
  };

  const handleCloseContextMenu = () => {
    setIsContextMenuVisible(false);
  };

  const menuItems = [
    {
      label: "Create Token",
      icon: <GrStatusPlaceholderSmall />,
      action: () => {
        setShowTokenModal(true);
      },
    },
    {
      label: "Create Counter",
      icon: <GiToken />,
      action: () => handleCounterCreation(),
    },
  ];

  const handleCounterCreation = async () => {
    try {
      await createCounter({ gameId, position: placement });
    } catch {
      toast("Could not create counter", "error");
    }
  };

  const component = (
    <>
      <CustomContextMenu
        x={contextMenuPosition?.x || 0}
        y={contextMenuPosition?.y || 0}
        isVisible={isContextMenuVisible}
        menuItems={menuItems}
        onClose={handleCloseContextMenu}
      />
      <TokenModal
        position={placement}
        showTokenModal={showTokenModal}
        setShowTokenModal={setShowTokenModal}
      />
    </>
  );

  return { handleContextMenu, component };
};

export default useContextMenu;
