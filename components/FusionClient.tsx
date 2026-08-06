"use client";

import Link from "next/link";
import { useState } from "react";
import type { Anime } from "@/lib/types";
import { AnimeSearchPicker } from "@/components/AnimeSearchPicker";
import { fusionBlurb, fusionScore, sharedTags } from "@/lib/tools";

export function FusionClient() {
  const [a, setA] = useState<Anime | null>(null);
  const [b, setB] = useState<Anime | null>(null);

  const ready = a && b;

  return (
    <div className="tools-panel">
      <div className="tools-pickers">
        <AnimeSearchPicker label="Parent A" selected={a} onSelect={setA} />
        <AnimeSearchPicker label="Parent B" selected={b} onSelect={setB} />
      </div>

      {ready ? (
        <div className="fusion-result">
          <div className="fusion-covers">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a!.image} alt="" />
            <span className="fusion-x">×</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b!.image} alt="" />
          </div>
          <div className="fusion-score">
            Compatibility {fusionScore(a!, b!)}
            <small>/100</small>
          </div>
          <p className="fusion-blurb">{fusionBlurb(a!, b!)}</p>
          <div className="compare-tags">
            {sharedTags(a!, b!).map((t) => (
              <span key={t} className="taste-chip shared">
                {t}
              </span>
            ))}
          </div>
          <div className="daily-actions" style={{ marginTop: 16 }}>
            <Link href={`/anime/${a!.id}`} className="btn btn-outline btn-sm">
              {a!.title}
            </Link>
            <Link href={`/anime/${b!.id}`} className="btn btn-outline btn-sm">
              {b!.title}
            </Link>
          </div>
        </div>
      ) : (
        <p className="tools-hint">
          Fuse two signals — shared genres raise the compatibility reading.
        </p>
      )}
    </div>
  );
}
