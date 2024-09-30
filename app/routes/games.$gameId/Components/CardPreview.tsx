import Card from "~/components/Card";
import { useGlobalStore } from "~/hooks/useGlobalStore";

const PREVIEW_SCALE = 0.9;
const CardPreview = () => {
  const peekedCard = useGlobalStore((state) => state.peekedCard);
  return (
    <div
      style={{
        width: 250 * PREVIEW_SCALE,
        height: 350 * PREVIEW_SCALE,
      }}
    >
      {peekedCard && <Card card={peekedCard} scale={PREVIEW_SCALE} disabled />}
    </div>
  );
};

export default CardPreview;
