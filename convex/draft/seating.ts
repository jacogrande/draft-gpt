const rotate = <U>(seats: U[], by: number): U[] => [
  ...seats.slice(by),
  ...seats.slice(0, by),
];

export const packOrders = <U>(participants: U[], round: number): U[][] => {
  const direction =
    round % 2 === 0 ? [...participants].reverse() : participants;
  return direction.map((_, seat) => rotate(direction, seat));
};
