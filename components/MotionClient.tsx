"use client";

import { useState } from "react";
import Link from "next/link";

export function MotionClient() {
  const [url, setUrl] = useState("");
  const [note, setNote] = useState(
    "Upscale/AI motion needs an external key — this page is a clip room scaffold only.",
  );

  return (
    <div className="tools-panel">
      <p className="tools-hint" style={{ marginBottom: 16 }}>
        Paste a public video/GIF URL to preview. Full upscale pipelines are
        intentionally key-gated and not shipped as a fake feature.
      </p>
      <label className="filter-label" htmlFor="motion-url">
        Clip URL
      </label>
      <div className="picker-row">
        <input
          id="motion-url"
          className="filter-input"
          placeholder="https://…mp4 / gif / webm"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      {url.trim() ? (
        <div style={{ marginTop: 16 }}>
          <video
            src={url.trim()}
            controls
            playsInline
            style={{
              width: "100%",
              maxHeight: 360,
              borderRadius: 12,
              background: "#000",
            }}
          />
        </div>
      ) : null}
      <p className="tools-hint" style={{ marginTop: 16 }}>
        {note}
      </p>
      <p style={{ marginTop: 12 }}>
        <Link href="/tools/sauce" className="btn btn-outline btn-sm">
          Find a frame with Sauce →
        </Link>
      </p>
    </div>
  );
}
