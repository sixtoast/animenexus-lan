"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Anime } from "@/lib/types";
import { useWatchlist } from "@/components/WatchlistProvider";

type Props = {
  anime: Anime;
  index?: number;
};

export function AnimeCard({ anime, index = 0 }: Props) {
  const router = useRouter();
  const { isInList, ready } = useWatchlist();
  const onList = ready && isInList(anime.id);
  const score = anime.score > 0 ? anime.score.toFixed(1) : "—";
  const vt = `cover-${anime.id}`;
  const href = `/anime/${anime.id}`;
  const src = anime.image || "https://placehold.co/300x450/1a1a1a/555?text=?";
  const canOptimize =
    src.includes("anilist.co") ||
    src.includes("myanimelist.net") ||
    src.includes("placehold.co");

  function navigate(e: React.MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    if (!doc.startViewTransition) return;
    e.preventDefault();
    doc.startViewTransition(() => {
      router.push(href);
    });
  }

  return (
    <Link
      href={href}
      className="anime-card grid-enter"
      title={anime.title}
      data-on-list={onList ? "true" : "false"}
      onClick={navigate}
      style={
        {
          "--i": index,
          "--vt-cover": vt,
        } as React.CSSProperties
      }
    >
      {onList ? <span className="card-flame" aria-hidden /> : null}
      {canOptimize ? (
        <Image
          src={src}
          alt=""
          width={300}
          height={450}
          sizes="(max-width: 640px) 45vw, 160px"
          style={{ viewTransitionName: vt } as React.CSSProperties}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          style={{ viewTransitionName: vt } as React.CSSProperties}
        />
      )}
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
