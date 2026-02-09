"use client";

import { useEffect, useMemo, useState } from "react";
import { decodeRosterFromHash } from "@/lib/shareLink";
import {
  buildGolferMapFromESPN,
  findGolferLive,
  parseRosterGridText,
  scoreGolfer,
  top3Total
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
        return {
          pick: p.name,
          liveName: live.name,
          pos: live.placeText ?? (live.placeNum ? String(live.placeNum) : "—"),
          status: live.status,
          points
        };
      });
      const { top3, total } = top3Total(scoredGolfers.map((g) => ({ name: g.pick, points: g.points })));
      return { person: r.person, scoredGolfers, top3, total };
    });

    out.sort((a, b) => b.total - a.total);
    return out;
  }, [rows, golferMap]);

  return (
    <main style={{ padding: 20, maxWidth: 1100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Fantasy Leaderboard</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="/admin"><button>Edit roster</button></a>
          <button onClick={refresh}>Refresh now</button>
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
        {data?.event?.name ? <>Event: <b>{data.event.name}</b> • </> : null}
        Data: ESPN JSON • Last updated: {data?.fetchedAt ?? "—"}
      </div>

      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}
      {!grid && (
        <p>
          No roster found. Go to <a href="/admin">/admin</a> and paste your roster.
        </p>
      )}

      <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%", marginTop: 12 }}>
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
              <td><b>{r.person}</b></td>
              <td><b>{r.total}</b></td>
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

      <h2 style={{ marginTop: 20 }}>Details</h2>
      {scored.map((r) => (
        <section key={r.person} style={{ marginBottom: 18 }}>
          <h3 style={{ marginBottom: 8 }}>{r.person} — Total {r.total}</h3>
          <table cellPadding={6} style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                <th>Pick</th>
                <th>Live name</th>
                <th>Pos</th>
                <th>Status</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {r.scoredGolfers.map((g) => (
                <tr key={g.pick} style={{ borderBottom: "1px solid #f7f7f7" }}>
                  <td>{g.pick}</td>
                  <td>{g.liveName}</td>
                  <td>{g.pos}</td>
                  <td>{g.status}</td>
                  <td><b>{g.points}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </main>
  );
}
