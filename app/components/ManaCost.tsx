import { SYMBOL_MAP } from "~/util/constants";

interface ManaCostProps {
  manaCost: string;
  scale?: number;
}

const ManaCost = ({ manaCost, scale = 1 }: ManaCostProps) => {
  const styles = {
    iconDiameter: 14,
    fontSize: 10,
    lineHeight: 14,
  };

  const ColorlessValue = ({ value }: { value: string }) => {
    return (
      <div
        className="rounded-full bg-zinc-400 text-center font-bold text-black"
        style={{
          width: styles.iconDiameter * scale,
          height: styles.iconDiameter * scale,
          lineHeight: `${styles.lineHeight * scale}px`,
        }}
      >
        <p>{value}</p>
      </div>
    );
  };

  const ManaSymbol = ({ symbol }: { symbol: string }) => {
    const icon = SYMBOL_MAP[symbol.toLowerCase()];
    return (
      <img
        src={`/mana/${icon}.png`}
        alt={symbol}
        style={{
          width: styles.iconDiameter * scale,
          height: styles.iconDiameter * scale,
        }}
      />
    );
  };

  const characters = manaCost.split("");
  const getComponents = () => {
    const components = [];
    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      // check if the character is a number
      if (char.match(/^\d$/) || char === "X") {
        components.push(<ColorlessValue key={char + i} value={char} />);
      } else {
        components.push(<ManaSymbol key={char + i} symbol={char} />);
      }
    }
    return components;
  };
  return <div className="flex items-center gap-1">{getComponents()}</div>;
};

export default ManaCost;
