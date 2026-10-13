import { GameSide } from "~/hooks/game/useGame";
import Battlefield from "./Battlefield";
const PlayerField = (props: { ownerId: string; side: GameSide }) => (
  <Battlefield {...props} />
);
export default PlayerField;
