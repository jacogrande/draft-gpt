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
  const createCounter = useMutation(api.game.counters.create);

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent the default context menu from appearing
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
    const position = contextMenuPosition || { x: 0, y: 0 };
    await createCounter({ gameId, position });
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
        showTokenModal={showTokenModal}
        setShowTokenModal={setShowTokenModal}
      />
    </>
  );

  return { handleContextMenu, component };
};

export default useContextMenu;
