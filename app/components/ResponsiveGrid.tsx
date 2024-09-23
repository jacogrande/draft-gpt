import React, { useEffect, useRef, useState } from "react";

type ResponsiveGridProps = {
  itemWidth: number;
  children: React.ReactNode;
};

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  itemWidth,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);
  const [gap, setGap] = useState(0);

  const updateLayout = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const columnsThatFit = Math.floor(containerWidth / itemWidth) || 1;
      const totalItemWidth = columnsThatFit * itemWidth;
      const remainingSpace = containerWidth - totalItemWidth;
      const gapBetweenItems =
        columnsThatFit > 1 ? remainingSpace / (columnsThatFit - 1) : 0;

      setColumns(columnsThatFit);
      setGap(gapBetweenItems);
    }
  };

  useEffect(() => {
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => {
      window.removeEventListener("resize", updateLayout);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="grid w-full"
      style={{
        gridTemplateColumns: `repeat(${columns}, ${itemWidth}px)`,
        columnGap: `${gap}px`,
        rowGap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;
