import Card, { CARD_WIDTH_SCALED } from "~/components/Card";
import Heading from "~/components/Heading";
import ResponsiveGrid from "~/components/ResponsiveGrid";
import { useLobbyStore } from "~/hooks/lobby/useLobby";
import { usePacksStore } from "~/hooks/lobby/usePacks";
import { useToast } from "~/hooks/useToast";
import { useUser } from "~/hooks/useUser";
import { nextRound, pickCard } from "~/model/draft";
import { ROUND_COUNT } from "~/util/constants";

const PackDisplayScreen = () => {
  const { toast } = useToast();
  const { lobby } = useLobbyStore();
  const { user } = useUser();
  const cards = usePacksStore((state) => state.cards);
  const selectedCard = usePacksStore((state) => state.selectedCard);
  const packs = usePacksStore((state) => state.packs);

  const handleConfirmSelection = async () => {
    if (!selectedCard || !lobby || !user) return;
    try {
      await pickCard(lobby.id, selectedCard.packId, user.uid, selectedCard.id);
    } catch (error) {
      console.error(error);
      toast("Unable to pick card", "error");
    }
  };

  const isNewRound = () => {
    if (!lobby) return false;
    if (lobby.currentRound === ROUND_COUNT) return false;
    if (packs.some((pack) => pack.currentHolder)) return false; // packs are still being distributed
    return true;
  };

  const isDraftFinished = () => {
    if (!lobby) return false;
    if (lobby.currentRound !== ROUND_COUNT) return false;
    if (packs.some((pack) => pack.currentHolder)) return false; // packs are still being distributed
    return true;
  };

  const handleNextRoundClick = async () => {
    if (!lobby || !user) return;
    try {
      // TODO: Figure out if there's a potential race condition here
      await nextRound(lobby.id, lobby.currentRound + 1);
    } catch (error) {
      console.error(error);
      toast("Unable to start round", "error");
    }
  };

  if (lobby?.creatingPacks)
    return (
      <div className="flex flex-col gap-8 flex-1 items-center justify-center">
        <Heading>
          <div className="flex flex items-center gap-4">
            <span className="loading loading-dots loading-lg"></span>
            Draft Starting
          </div>
        </Heading>
      </div>
    );
  return (
    <div className="flex flex-col items-center justify-center flex-1 pl-8 pb-8 relative">
      <ResponsiveGrid itemWidth={CARD_WIDTH_SCALED}>
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </ResponsiveGrid>
      {selectedCard && (
        <div className="sticky w-full bottom-2 flex justify-end mt-4 z-20">
          <button
            className="btn btn-primary px-8"
            onClick={handleConfirmSelection}
          >
            Pick Card
          </button>
        </div>
      )}
      {isNewRound() && lobby && (
        <button className="btn btn-primary" onClick={handleNextRoundClick}>
          Start Round {lobby.currentRound + 1}
        </button>
      )}
      {isDraftFinished() && (
        <div className="flex flex-col items-center gap-4">
          <Heading>Draft Finished</Heading>
          <p className="prose">
            Head over to the deck editor to finish building your deck.
          </p>
        </div>
      )}
    </div>
  );
};

export default PackDisplayScreen;
