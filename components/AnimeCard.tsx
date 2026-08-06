import Link from "next/link";
import type { Anime } from "@/lib/types";

type Props = {
  anime: Anime;
};

export function AnimeCard({ anime }: Props) {
  const score = anime.score > 0 ? anime.score.toFixed(1) : "—";

  return (
    <Link href={`/anime/${anime.id}`} className="anime-card" title={anime.title}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={anime.image} alt="" loading="lazy" />
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
