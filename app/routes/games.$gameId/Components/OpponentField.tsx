import { GameSide } from "~/hooks/game/useGame";
import Battlefield from "./Battlefield";
const OpponentField = (props: { ownerId: string; side: GameSide }) => (
  <Battlefield {...props} opponent />
);
export default OpponentField;
