export const HEARTBEAT_INTERVAL_MS = 20_000;
export const AWAY_AFTER_MS = 60_000;

type Sighting = { userId: string; lastSeenAt: number };

export const presentUserIds = (sightings: Sighting[], now: number) =>
  new Set(
    sightings
      .filter((sighting) => now - sighting.lastSeenAt <= AWAY_AFTER_MS)
      .map((sighting) => sighting.userId)
  );
