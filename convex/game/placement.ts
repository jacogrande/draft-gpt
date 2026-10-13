export type Position = { x: number; y: number };
export type Size = { width: number; height: number };

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export const parsePosition = (point: Position): Position | null =>
  Number.isFinite(point.x) && Number.isFinite(point.y)
    ? { x: clamp(point.x), y: clamp(point.y) }
    : null;

export const defaultPosition = (index: number): Position => ({
  x: (index % 5) / 4,
  y: (Math.floor(index / 5) % 3) / 2,
});

export const counterPosition = (
  point: Position,
  space: "battlefield" | undefined,
  index: number
): Position => (space === "battlefield" ? point : defaultPosition(index));

export const viewPosition = (point: Position, opponent: boolean): Position =>
  opponent ? { x: 1 - point.x, y: 1 - point.y } : point;

export const toPixels = (
  point: Position,
  area: Size,
  piece: Size
): Position => ({
  x: point.x * Math.max(0, area.width - piece.width),
  y: point.y * Math.max(0, area.height - piece.height),
});

export const fromPixels = (
  point: Position,
  area: Size,
  piece: Size
): Position => ({
  x: area.width > piece.width ? clamp(point.x / (area.width - piece.width)) : 0,
  y:
    area.height > piece.height
      ? clamp(point.y / (area.height - piece.height))
      : 0,
});
