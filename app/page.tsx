"use client";

import { useEffect, useMemo, useState } from "react";
import { encodeRosterToHash } from "../lib/shareLink";

const STORAGE_KEY = "pga_fantasy_roster_grid";

export default function AdminPage() {
  const [grid, setGrid] = useState("");
  const [shareUrl, setShareUrl] = useState<string>("");
  const hash = useMemo(() => encodeRosterToHash(grid), [grid]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setGrid(saved);
  }, []);

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
    } catch {
      // ignore clipboard errors
    }
  }

  function loadSample() {
    // This is your current roster from the photo.
    const sample = `Ryan | Scottie Scheffler | Wyndham Clark | Daniel Berger | Brian Harman
Morris | Ben Griffin | Corey Conners | Kurt Kitayama | Max McGreevy
Russ | Xander Schauffele | Jake Knapp | Michael Thorbjornsen | Keith Mitchell
Seth | Brooks Koepka | Rickie Fowler | Matt McCarty | Samuel Stevens
Sam | Cam Young | Matt Fitzpatrick | Nick Taylor | Min Woo Lee
Kyle | Hideki Matsuyama | Si Woo Kim | Rasmus Højgaard | Pierceson Coody
Justin | Viktor Hovland | Jordan Spieth | Christiaan Bezuidenhout | Andrew Novak
Aaron | Collin Morikawa | Akshay Bhatia | Tom Kim | S.H. Kim
Eric | Maverick McNealy | Harris English | Harry Hall | Takumi Kanaya
Matt | J.J. Spaun | Sam Burns | J.T. Poston | Mac Meissner
Chris | Tony Finau | Sahith Theegala | Jacob Bridgeman | Ryo Hisatsune
Mike | Sepp Straka | Chris Gotterup | Matthieu Pavon | Chris Kirk`;
    setGrid(sample);
  }

  return (
    <main style={{ padding: 20, maxWidth: 900 }}>
      <h1>PGA Fantasy Admin</h1>

      <p>
        Paste rows like:
        <br />
        <code>Ryan | Scottie Scheffler | Wyndham Clark | Daniel Berger | Brian Harman</code>
      </p>

      <div style={{ marginBottom: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={loadSample}>Load sample roster</button>
        <button onClick={saveLocal}>Save on this device</button>
        <button onClick={makeShareLink}>Generate share link</button>
        <a href={`/leaderboard${hash}`}>Open leaderboard</a>
      </div>

      <textarea
        value={grid}
        onChange={(e) => setGrid(e.target.value)}
        rows={18}
        style={{ width: "100%", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}
      />

      {shareUrl && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Share this link (works on your phone):</div>
          <input
            value={shareUrl}
            readOnly
            style={{ width: "100%", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}
            onFocus={(e) => e.currentTarget.select()}
          />
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            Tip: open this link in Safari → Share → <b>Add to Home Screen</b>.
          </div>
        </div>
      )}
    </main>
  );
}
