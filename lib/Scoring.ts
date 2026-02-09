export type GolferPick = { name: string };
export type PersonRow = { person: string; picks: GolferPick[] };

function normalizeName(s: string) {
  return s
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[\u2019']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Scoring: 1st=50, 2nd=49, 3rd=48, then -1 per place
export function pointsForPlace(place: number): number {
  if (place <= 0) return 0;
  return Math.max(0, 51 - place);
}

export type GolferStatus = "OK" | "CUT" | "WD" | "DQ" | "UNK";

export type GolferLive = {
  name: string;
  placeNum?: number;
  placeText?: string;
  status: GolferStatus;
};

export function scoreGolfer(g: GolferLive): number {
  if (g.status !== "OK") return 0;
  if (!g.placeNum || g.placeNum <= 0) return 0;
  return pointsForPlace(g.placeNum);
}

export function top3Total(golfers: { name: string; points: number }[]) {
  const top3 = [...golfers]
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);
  return {
    top3,
    total: top3.reduce((sum, g) => sum + g.points, 0),
  };
}

export function parseRosterGridText(grid: string): PersonRow[] {
  const lines = grid.split("\n").map(l => l.trim()).filter(Boolean);
  const rows: PersonRow[] = [];

  for (const line of lines) {
    const parts = line.split(/\t|,|\|/).map(p => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;
    rows.push({
      person: parts[0],
      picks: parts.slice(1).map(name => ({ name })),
    });
  }
  return rows;
}

export function buildGolferMapFromESPN(espnJson: any): Map<string, GolferLive> {
  const m = new Map<string, GolferLive>();

  const athletes =
    espnJson?.athletes ??
    espnJson?.leaderboard?.athletes ??
    espnJson?.entries ??
    [];

  for (const a of athletes) {
    const displayName: string =
      a?.athlete?.displayName ??
      a?.athlete?.fullName ??
      a?.player?.displayName ??
      a?.displayName ??
      "";

    if (!displayName) continue;

    const posText: string =
      a?.status?.position?.displayName ??
      a?.position?.displayName ??
      a?.position ??
      a?.pos ??
      a?.rank ??
      "";

    let status: GolferStatus = "OK";
    const t = String(posText).toUpperCase();
    if (t.includes("CUT")) status = "CUT";
    else if (t.includes("WD")) status = "WD";
    else if (t.includes("DQ")) status = "DQ";
    else if (!posText) status = "UNK";

    let placeNum: number | undefined;
    const match = String(posText).match(/(\d+)/);
    if (match) placeNum = parseInt(match[1], 10);

    m.set(normalizeName(displayName), {
      name: displayName,
      placeNum,
      placeText: posText ? String(posText) : undefined,
      status,
    });
  }

  return m;
}

export function findGolferLive(
  m: Map<string, GolferLive>,
  pickName: string
): GolferLive {
  const key = normalizeName(pickName);
  const exact = m.get(key);
  if (exact) return exact;

  for (const [k, v] of m.entries()) {
    if (k.includes(key) || key.includes(k)) return v;
  }

  return { name: pickName, status: "UNK" };
}
