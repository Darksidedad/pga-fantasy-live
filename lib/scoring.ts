export type LiveGolfer = {
  name: string;
  position: string;
  score: string;
};

export async function buildGolferMapFromESPN() {
  const res = await fetch(
    "https://site.web.api.espn.com/apis/v2/sports/golf/pga/leaderboard"
  );
  const data = await res.json();

  const map: Record<string, LiveGolfer> = {};

  const players = data?.events?.[0]?.competitions?.[0]?.competitors || [];

  for (const p of players) {
    const name = p?.athlete?.displayName;
    if (!name) continue;

    map[name.toLowerCase()] = {
      name,
      position: p?.status?.position || "-",
      score: p?.score || "-",
    };
  }

  return map;
}

export function findGolferLive(
  name: string,
  map: Record<string, LiveGolfer>
) {
  return map[name.toLowerCase()];
}
