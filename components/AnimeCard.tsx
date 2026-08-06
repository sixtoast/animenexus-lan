"use client";

import Link from "next/link";
import type { Anime } from "@/lib/types";
import { useWatchlist } from "@/components/WatchlistProvider";

type Props = {
  anime: Anime;
  index?: number;
};

export function AnimeCard({ anime, index = 0 }: Props) {
  const { isInList, ready } = useWatchlist();
  const onList = ready && isInList(anime.id);
  const score = anime.score > 0 ? anime.score.toFixed(1) : "—";
  const vt = `cover-${anime.id}`;

  return (
    <Link
      href={`/anime/${anime.id}`}
      className="anime-card grid-enter"
      title={anime.title}
      data-on-list={onList ? "true" : "false"}
      style={
        {
          "--i": index,
          "--vt-cover": vt,
        } as React.CSSProperties
      }
    >
      {onList ? <span className="card-flame" aria-hidden /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={anime.image}
        alt=""
        loading="lazy"
        style={{ viewTransitionName: vt } as React.CSSProperties}
      />
      {anime.format ? <span className="card-tag">{anime.format}</span> : null}
      <div className="card-body">
        <div className="card-title">{anime.title}</div>
        <div className="card-meta">
          <span>{anime.year || "—"}</span>
          <span className="card-score">★ {score}</span>
        </div>
      </div>
    </Link>
  );
}
