import { GameToken } from "~/hooks/game/useGame";

type TokenFaceProps = { token: GameToken; scale: number };

const TokenFace = ({ token, scale }: TokenFaceProps) => (
  <div
    className={`border border-gray-400 bg-white rounded p-1 text-center text-sm flex flex-col justify-between transition-transform ${
      token.tapped ? "rotate-90" : ""
    }`}
    style={{ width: 250 * scale, height: 350 * scale }}
    data-tapped={token.tapped}
  >
    <div className="w-full text-left">{token.name}</div>
    {token.power != null && token.toughness != null && (
      <div className="text-sm text-right">
        {token.power}/{token.toughness}
      </div>
    )}
  </div>
);

export default TokenFace;
