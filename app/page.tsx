"use client";

import { useEffect, useState } from "react";
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
    async function load() {
      const hash = window.location.hash;
      const decoded = decodeRosterFromHash(hash);

      if (!decoded) {
        setLoading(false);
        return;
      }

      const names = decoded.split("\n").filter(Boolean);
      const roster = names.map((name: string) => ({
        name: name.trim(),
      }));

      const map = await buildGolferMapFromESPN();

      const updated = roster.map((g) => {
        const live = findGolferLive(g.name, map);
        return {
          name: g.name,
          position: live?.position || "-",
          score: live?.score || "-",
        };
      });

      setGolfers(updated);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Fantasy Leaderboard</h1>

      {golfers.length === 0 ? (
        <p>No roster loaded.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {golfers.map((g) => (
              <tr key={g.name}>
                <td>{g.name}</td>
                <td>{g.position}</td>
                <td>{g.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
