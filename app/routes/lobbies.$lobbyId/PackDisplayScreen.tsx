import Card, { CARD_WIDTH_SCALED } from "~/components/Card";
import ResponsiveGrid from "~/components/ResponsiveGrid";
import { usePacksStore } from "~/hooks/lobby/usePacks";

const PackDisplayScreen = () => {
  const cards = usePacksStore((state) => state.cards);
  const selectedCard = usePacksStore((state) => state.selectedCard);

  const handleConfirmSelection = () => {
    if (!selectedCard) return;
    console.log("confirming selection");
  };

  return (
    <div className="flex flex-col flex-1 pl-8 pb-8 relative">
      <ResponsiveGrid itemWidth={CARD_WIDTH_SCALED}>
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </ResponsiveGrid>
      {selectedCard && (
        <div className="sticky bottom-2 flex justify-end mt-4 z-20">
          <button
            className="btn btn-primary px-8"
            onClick={handleConfirmSelection}
          >
            Pick Card
          </button>
        </div>
      )}
    </div>
  );
};

export default PackDisplayScreen;
