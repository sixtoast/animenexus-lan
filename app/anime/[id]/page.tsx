import "./detail.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAnimeDetail } from "@/lib/anilist-detail";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const num = parseInt(id, 10);
  if (isNaN(num)) return { title: "Anime · AnimeNexus" };
  try {
    const anime = await fetchAnimeDetail(num);
    if (!anime) return { title: "Not found · AnimeNexus" };
    return {
      title: `${anime.title} · AnimeNexus`,
      description: anime.description.slice(0, 160),
    };
  } catch {
    return { title: "Anime · AnimeNexus" };
  }
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    FINISHED: "Finished",
    RELEASING: "Airing",
    NOT_YET_RELEASED: "Upcoming",
    CANCELLED: "Cancelled",
    HIATUS: "Hiatus",
  };
  return map[s] || s;
}

export default async function AnimeDetailPage({ params }: Props) {
  const { id } = await params;
  const num = parseInt(id, 10);
  if (isNaN(num)) notFound();

  let anime;
  try {
    anime = await fetchAnimeDetail(num);
  } catch {
    notFound();
  }
  if (!anime) notFound();

  const score = anime.score > 0 ? anime.score.toFixed(1) : "—";
  const season =
    anime.season && anime.seasonYear
      ? `${anime.season.charAt(0)}${anime.season.slice(1).toLowerCase()} ${anime.seasonYear}`
      : anime.year
        ? String(anime.year)
        : null;

  const youtube =
    anime.trailer?.site === "youtube" && anime.trailer.id
      ? `https://www.youtube.com/embed/${anime.trailer.id}`
      : null;

  return (
    <main>
      {anime.bannerImage ? (
        <div
          className="detail-banner"
          style={{ backgroundImage: `url(${anime.bannerImage})` }}
        />
      ) : (
        <div className="detail-banner detail-banner-empty" />
      )}

      <div className="container detail-wrap">
        <Link href="/browse" className="detail-back">
          ← Back to browse
        </Link>

        <div className="detail-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="detail-cover" src={anime.image} alt="" />

          <div className="detail-info">
            <p className="detail-kicker">Sprint 3 · detail</p>
            <h1 className="detail-title">{anime.title}</h1>
            {anime.titleRomaji && anime.titleRomaji !== anime.title ? (
              <p className="detail-alt">{anime.titleRomaji}</p>
            ) : null}
            {anime.titleNative ? (
              <p className="detail-alt detail-native">{anime.titleNative}</p>
            ) : null}

            <div className="detail-meta-row">
              <span className="detail-pill score">★ {score}</span>
              <span className="detail-pill">{anime.format}</span>
              <span className="detail-pill">{statusLabel(anime.status)}</span>
              {season ? <span className="detail-pill">{season}</span> : null}
              {anime.episodes !== "?" && anime.episodes != null ? (
                <span className="detail-pill">{anime.episodes} ep</span>
              ) : null}
              {anime.duration ? (
                <span className="detail-pill">{anime.duration} min</span>
              ) : null}
            </div>

            {anime.tags.length ? (
              <div className="detail-tags">
                {anime.tags.map((g) => (
                  <Link
                    key={g}
                    href={`/browse?genre=${encodeURIComponent(g)}`}
                    className="detail-tag"
                  >
                    {g}
                  </Link>
                ))}
              </div>
            ) : null}

            {anime.studios?.length ? (
              <p className="detail-studios">
                Studio{anime.studios.length > 1 ? "s" : ""}:{" "}
                <strong>{anime.studios.join(", ")}</strong>
              </p>
            ) : null}

            <div className="detail-actions">
              {anime.url ? (
                <a
                  href={anime.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-accent btn-sm"
                >
                  Open on AniList ↗
                </a>
              ) : null}
              <Link href="/browse" className="btn btn-outline btn-sm">
                Browse more
              </Link>
            </div>
          </div>
        </div>

        <section className="detail-section">
          <h2>Synopsis</h2>
          <p className="detail-synopsis">
            {anime.description || "No description available."}
          </p>
        </section>

        {youtube ? (
          <section className="detail-section">
            <h2>Trailer</h2>
            <div className="detail-trailer">
              <iframe
                src={youtube}
                title={`${anime.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        ) : null}

        {anime.characters && anime.characters.length > 0 ? (
          <section className="detail-section">
            <h2>Characters</h2>
            <div className="char-grid">
              {anime.characters.map((c) => (
                <div key={c.id} className="char-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      c.image ||
                      "https://placehold.co/120x120/1a1a1a/555?text=?"
                    }
                    alt=""
                  />
                  <div className="char-name">{c.name}</div>
                  <div className="char-role">{c.role.replace(/_/g, " ")}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
