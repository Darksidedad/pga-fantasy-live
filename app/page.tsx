"use client";

import { useEffect, useMemo, useState } from "react";
import { decodeRosterFromHash } from "../lib/shareLink";
import {
  buildGolferMapFromESPN,
  findGolferLive,
} from "../lib/scoring";

type Golfer = {
  name: string;
  position?: string;
  score?: string;
};

export default function Home() {
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    const decoded = decodeRosterFromHash(hash);

    if (decoded) {
      const names = decoded.split("\n").filter(Boolean);
      const roster = names.map((name: string) => ({
        name: name.trim(),
      }));
      setGolfers(roster);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    async function fetchLive() {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        const golferMap = buildGolferMapFromESPN(data);

        setGolfers((prev) =>
          prev.map((g) => {
            const live = findGolferLive(g.name, golferMap);
            return live
              ? {
                  ...g,
                  position: live.position,
                  score: live.score,
                }
              : g;
          })
        );
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      }
    }

    fetchLive();
    const interval = setInterval(fetchLive, 60000);
    return () => clearInterval(interval);
  }, []);

  const sortedGolfers = useMemo(() => {
    return [...golfers].sort((a, b) => {
      const pa = parseInt(a.position || "999");
      const pb = parseInt(b.position || "999");
      return pa - pb;
    });
  }, [golfers]);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading roster...</div>;
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Fantasy PGA Leaderboard</h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 20,
        }}
      >
        <thead>
          <tr>
            <th style={th}>Player</th>
            <th style={th}>Position</th>
            <th style={th}>Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedGolfers.map((g, i) => (
            <tr key={i}>
              <td style={td}>{g.name}</td>
              <td style={td}>{g.position || "-"}</td>
              <td style={td}>{g.score || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = {
  borderBottom: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};

const td: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "8px",
};
