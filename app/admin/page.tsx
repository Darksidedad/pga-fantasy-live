"use client";

import { useEffect, useMemo, useState } from "react";
import { encodeRosterToHash } from "@/lib/shareLink";

const STORAGE_KEY = "pga_fantasy_roster_grid";

const SAMPLE = `Ryan | Scottie Scheffler | Wyndham Clark | Daniel Berger | Brian Harman`;

export default function AdminPage() {
  const [grid, setGrid] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setGrid(saved);
  }, []);

  const hash = useMemo(() => encodeRosterToHash(grid), [grid]);

  function saveLocal() {
    localStorage.setItem(STORAGE_KEY, grid);
    alert("Saved on this device!");
  }

  async function makeShareLink() {
    const url = `${window.location.origin}/leaderboard${hash}`;
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      alert("Share link copied!");
    } catch {}
  }

  function loadSample() {
    setGrid(SAMPLE);
  }

  return (
    <main style={{ padding: 20, maxWidth: 900 }}>
      <h1>Fantasy PGA Admin</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <button onClick={loadSample}>Load sample roster</button>
        <button onClick={saveLocal}>Save on this device</button>
        <button onClick={makeShareLink}>Generate share link</button>
        <a href={`/leaderboard${hash}`}>Open leaderboard</a>
      </div>

      <textarea
        value={grid}
        onChange={(e) => setGrid(e.target.value)}
        rows={18}
        style={{ width: "100%", fontFamily: "monospace" }}
      />

      {shareUrl && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Share this link:</div>
          <input
            value={shareUrl}
            readOnly
            style={{ width: "100%", fontFamily: "monospace" }}
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>
      )}
    </main>
  );
}
