import { NextResponse } from "next/server";

type ESPNEvent = { id: string; name?: string; status?: any };
type ESPNScoreboard = { events?: ESPNEvent[] };

function pickLikelyCurrentEvent(events: ESPNEvent[]): ESPNEvent | null {
  const ranked = [...events].sort((a, b) => {
    const sa = a.status?.type?.state ?? "";
    const sb = b.status?.type?.state ?? "";
    const score = (s: string) => (s === "in" ? 0 : s === "pre" ? 1 : s === "post" ? 2 : 3);
    return score(sa) - score(sb);
  });
  return ranked[0] ?? null;
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { "user-agent": "pga-fantasy-live/1.0" }, cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return res.json();
}

export async function GET() {
  const scoreboardUrl = "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard";
  const scoreboard = (await fetchJson(scoreboardUrl)) as ESPNScoreboard;
  const events = scoreboard.events ?? [];
  const current = pickLikelyCurrentEvent(events);

  if (!current?.id) {
    return NextResponse.json({ ok: false, error: "No ESPN PGA events found." }, { status: 502 });
  }

  const lbUrl = `https://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard?event=${encodeURIComponent(current.id)}`;
  const lb = await fetchJson(lbUrl);

  return NextResponse.json({
    ok: true,
    event: { id: current.id, name: current.name ?? lb?.name ?? "PGA Event" },
    leaderboard: lb,
    fetchedAt: new Date().toISOString(),
  });
}
