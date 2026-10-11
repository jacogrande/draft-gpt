import { SYMBOL_MAP } from "~/util/constants";

interface ManaCostProps {
  manaCost: string;
  scale?: number;
}

const SIZE = { iconDiameter: 14, fontSize: 10, lineHeight: 14 };

const tokenize = (manaCost: string): string[] => {
  const tokens: string[] = [];
  const pattern = /\{([^}]*)\}|./g;
  for (const match of manaCost.matchAll(pattern)) {
    const token = (match[1] ?? match[0]).trim();
    if (token !== "") tokens.push(token);
  }
  return tokens;
};

const isGeneric = (token: string) => /^\d+$/.test(token) || token === "X";

const ManaCost = ({ manaCost, scale = 1 }: ManaCostProps) => {
  const diameter = SIZE.iconDiameter * scale;

  const Badge = ({ value, wide }: { value: string; wide?: boolean }) => (
    <div
      className="rounded-full bg-zinc-400 text-center font-bold text-black"
      style={{
        minWidth: diameter,
        height: diameter,
        lineHeight: `${SIZE.lineHeight * scale}px`,
        fontSize: `${SIZE.fontSize * scale}px`,
        padding: wide ? `0 ${3 * scale}px` : 0,
      }}
    >
      <p>{value}</p>
    </div>
  );

  const Symbol = ({ token }: { token: string }) => {
    const icon = SYMBOL_MAP[token.toLowerCase()];
    if (!icon) return <Badge value={token} wide={token.length > 1} />;
    return (
      <img
        src={`/mana/${icon}.png`}
        alt={token}
        style={{ width: diameter, height: diameter }}
      />
    );
  };

  return (
    <div className="flex items-center gap-1">
      {tokenize(manaCost).map((token, i) =>
        isGeneric(token) ? (
          <Badge key={token + i} value={token} />
        ) : (
          <Symbol key={token + i} token={token} />
        )
      )}
    </div>
  );
};

export default ManaCost;
