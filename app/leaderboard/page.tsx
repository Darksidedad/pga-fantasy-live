"use client";

import { useEffect, useMemo, useState } from "react";
import { decodeRosterFromHash } from "@/lib/shareLink";
import {
  buildGolferMapFromESPN,
  findGolferLive,
  parseRosterGridText,
  scoreGolfer,
  top3Total,
} from "@/lib/scoring";

const STORAGE_KEY = "pga_fantasy_roster_grid";

export default function LeaderboardPage() {
  const [grid, setGrid] = useState("");
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const fromHash = decodeRosterFromHash(window.location.hash);
    if (fromHash) {
      setGrid(fromHash);
      return;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setGrid(saved);
  }, []);

  async function refresh() {
    setErr(null);
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Failed");
      setData(json);
    } catch (e: any) {
      setErr(e?.message ?? "Error");
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => parseRosterGridText(grid), [grid]);
  const golferMap = useMemo(
    () => (data?.leaderboard ? buildGolferMapFromESPN(data.leaderboard) : new Map()),
    [data]
  );

  const scored = useMemo(() => {
    const out = rows.map((r) => {
      const scoredGolfers = r.picks.map((p) => {
        const live = findGolferLive(golferMap, p.name);
        const points = scoreGolfer(live);
        return { name: p.name, points };
      });
      const { top3, total } = top3Total(scoredGolfers);
      return { person: r.person, top3, total };
    });

    out.sort((a, b) => b.total - a.total);
    return out;
  }, [rows, golferMap]);

  return (
    <main style={{ padding: 20, maxWidth: 1100 }}>
      <h1>Fantasy Leaderboard</h1>

      <div style={{ marginBottom: 10 }}>
        <button onClick={refresh}>Refresh now</button>
        <span style={{ marginLeft: 12, opacity: 0.8 }}>
          {data?.event?.name ? `Event: ${data.event.name}` : ""}
        </span>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Last updated: {data?.fetchedAt ?? "—"}
        </div>
      </div>

      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}
      {!grid && (
        <p>
          No roster found. Go to <a href="/admin">/admin</a> to set it.
        </p>
      )}

      <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th>Rank</th>
            <th>Person</th>
            <th>Total (Top 3)</th>
            <th>Top 3 picks</th>
          </tr>
        </thead>
        <tbody>
          {scored.map((r, idx) => (
            <tr key={r.person} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td>{idx + 1}</td>
              <td>
                <b>{r.person}</b>
              </td>
              <td>
                <b>{r.total}</b>
              </td>
              <td>
                {r.top3.map((g) => (
                  <span key={g.name} style={{ display: "inline-block", marginRight: 10 }}>
                    {g.name}: <b>{g.points}</b>
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 14 }}>
        Edit roster at <a href="/admin">/admin</a>.
      </p>
    </main>
  );
}
