"use client";

import { useState } from "react";
import { encodeRosterToHash } from "../../lib/shareLink";

export default function AdminPage() {
  const [names, setNames] = useState("");
  const [link, setLink] = useState("");

  function generate() {
    const hash = encodeRosterToHash(names);
    const url = window.location.origin + "/" + hash;
    setLink(url);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin</h1>

      <textarea
        rows={10}
        cols={40}
        placeholder="Enter one golfer per line"
        value={names}
        onChange={(e) => setNames(e.target.value)}
      />

      <br />
      <button onClick={generate}>Generate Link</button>

      {link && (
        <div>
          <p>Share this link:</p>
          <a href={link}>{link}</a>
        </div>
      )}
    </div>
  );
}
