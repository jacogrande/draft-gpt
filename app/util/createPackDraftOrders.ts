/**
 * Creates an array of "order" arrays, where each array represents a pack's player order
 * @param userIds - an array of user ids
 * @returns an array of "order" arrays, where each array represents a pack's player order
 */
export const createPackDraftOrders = (userIds: string[]): string[][] => {
  const packOrders: string[][] = [];
  for (let i = 0; i < userIds.length; i++) {
    const order: string[] = userIds.slice(i);
    for (let j = 0; j < i; j++) {
      if (i === j) continue;
      order.push(userIds[j]);
    }
    packOrders.push(order);
  }
  return packOrders;
};
