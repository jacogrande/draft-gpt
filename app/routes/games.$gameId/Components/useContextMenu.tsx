import { useState } from "react";
import CustomContextMenu from "~/routes/games.$gameId/Components/CustomContextMenu";

const useContextMenu = () => {
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);

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
      label: "Option 1",
      action: () => {
        console.log("Option 1 selected");
      },
    },
    {
      label: "Option 2",
      action: () => {
        console.log("Option 2 selected");
      },
    },
    // Add more menu items as needed
  ];

  const component = (
    <CustomContextMenu
      x={contextMenuPosition?.x || 0}
      y={contextMenuPosition?.y || 0}
      isVisible={isContextMenuVisible}
      menuItems={menuItems}
      onClose={handleCloseContextMenu}
    />
  );

  return { handleContextMenu, component };
};

export default useContextMenu;
