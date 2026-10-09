import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import Card, { CARD_WIDTH_SCALED } from "~/components/Card";
import Heading from "~/components/Heading";
import ResponsiveGrid from "~/components/ResponsiveGrid";
import { useCurrentPack, usePacksStore } from "~/hooks/draft/usePacks";
import { LobbyView } from "~/hooks/lobby/useLobby";
import { useToast } from "~/hooks/useToast";

const PackDisplayScreen = ({ lobby }: { lobby: LobbyView }) => {
  const pack = useCurrentPack(lobby.id);
  const pick = useMutation(api.draft.picks.pick);
  const selectedCard = usePacksStore((state) => state.selectedCard);
  const setSelectedCard = usePacksStore((state) => state.setSelectedCard);
  const { toast } = useToast();
  const [picking, setPicking] = useState<boolean>(false);
  const packId = pack?.packId;

  useEffect(() => setSelectedCard(null), [packId, setSelectedCard]);

  const handleConfirmSelection = useCallback(async () => {
    if (!selectedCard || picking) return;
    setPicking(true);
    try {
      await pick({ cardId: selectedCard.id as Id<"cards"> });
    } catch {
      toast("Unable to pick card", "error");
    } finally {
      setPicking(false);
    }
  }, [selectedCard, picking, pick, toast]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") void handleConfirmSelection();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleConfirmSelection]);

  if (pack === undefined) return <div className="flex-1"></div>;
  if (pack === null)
    return (
      <div className="flex flex-col gap-8 flex-1 items-center justify-center">
        <Heading>Waiting for a pack</Heading>
      </div>
    );
  return (
    <div className="flex flex-col items-center justify-center flex-1 pl-8 pb-8 relative">
      <ResponsiveGrid itemWidth={CARD_WIDTH_SCALED}>
        {pack.cards.map((card) => (
          <Card key={card.id} card={card} showPickHighlight />
        ))}
      </ResponsiveGrid>
      <div className="sticky w-full bottom-2 flex justify-end mt-4 z-20">
        <button
          className="btn btn-primary px-8"
          onClick={handleConfirmSelection}
          disabled={picking || !selectedCard}
        >
          Pick Card
        </button>
      </div>
    </div>
  );
};

export default PackDisplayScreen;
