"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AnimeRelation } from "@/lib/types";

type Props = {
  centerTitle: string;
  centerId: number;
  centerImage?: string;
  centerYear?: number | string | null;
  relations: AnimeRelation[];
};

const CHAIN = new Set(["PREQUEL", "SEQUEL", "PARENT", "SIDE_STORY"]);
const SIDE = new Set(["SPIN_OFF", "ALTERNATIVE", "SUMMARY", "OTHER", "CHARACTER"]);

function labelType(t: string) {
  return t.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function badgeClass(t: string) {
  const u = t.toUpperCase();
  if (u === "SEQUEL") return "ab-sequel";
  if (u === "PREQUEL" || u === "PARENT") return "ab-prequel";
  if (u === "SIDE_STORY") return "ab-side";
  if (u === "SPIN_OFF") return "ab-spin";
  if (u === "RECOMMENDED") return "ab-rec";
  return "ab-other";
}

function PosterCard({
  href,
  title,
  image,
  meta,
  badge,
  badgeType,
  current,
}: {
  href?: string;
  title: string;
  image?: string;
  meta?: string;
  badge?: string;
  badgeType?: string;
  current?: boolean;
}) {
  const body = (
    <>
      <div className="ab-poster">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image || "https://placehold.co/200x300/1a1a1a/555?text=?"}
          alt=""
          loading="lazy"
        />
        {badge ? (
          <span className={"ab-badge " + badgeClass(badgeType || badge)}>
            {badge}
          </span>
        ) : null}
        {current ? <span className="ab-you">You are here</span> : null}
      </div>
      <div className="ab-card-title">{title}</div>
      {meta ? <div className="ab-card-meta">{meta}</div> : null}
    </>
  );

  if (current || !href) {
    return <div className={"ab-card" + (current ? " ab-current" : "")}>{body}</div>;
  }
  return (
    <Link href={href} className="ab-card">
      {body}
    </Link>
  );
}

export function AncestryGraph({
  centerTitle,
  centerId,
  centerImage,
  centerYear,
  relations: initial,
}: Props) {
  const [relations, setRelations] = useState<AnimeRelation[]>(initial || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial?.length) {
      setRelations(initial);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/relations?id=${centerId}`)
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled && Array.isArray(j.data)) setRelations(j.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [centerId, initial]);

  const { timeline, sideOrbit, recommended, other } = useMemo(() => {
    const prequels: AnimeRelation[] = [];
    const sequels: AnimeRelation[] = [];
    const sides: AnimeRelation[] = [];
    const orbit: AnimeRelation[] = [];
    const recs: AnimeRelation[] = [];
    const rest: AnimeRelation[] = [];

    for (const r of relations) {
      const t = (r.relationType || "").toUpperCase();
      if (t === "PREQUEL" || t === "PARENT") prequels.push(r);
      else if (t === "SEQUEL") sequels.push(r);
      else if (t === "SIDE_STORY") sides.push(r);
      else if (SIDE.has(t)) orbit.push(r);
      else if (t === "RECOMMENDED") recs.push(r);
      else if (CHAIN.has(t)) sides.push(r);
      else rest.push(r);
    }

    const byYear = (a: AnimeRelation, b: AnimeRelation) =>
      (a.year || 0) - (b.year || 0) || a.title.localeCompare(b.title);

    prequels.sort(byYear);
    sequels.sort(byYear);
    sides.sort(byYear);

    const timeline: {
      id: number;
      title: string;
      image?: string;
      year?: number | string | null;
      score?: number | null;
      badge?: string;
      badgeType?: string;
      current?: boolean;
    }[] = [
      ...prequels.map((r) => ({
        id: r.id,
        title: r.title,
        image: r.image,
        year: r.year,
        score: r.score,
        badge: labelType(r.relationType),
        badgeType: r.relationType,
      })),
      {
        id: centerId,
        title: centerTitle,
        image: centerImage,
        year: centerYear,
        current: true,
      },
      ...sequels.map((r) => ({
        id: r.id,
        title: r.title,
        image: r.image,
        year: r.year,
        score: r.score,
        badge: labelType(r.relationType),
        badgeType: r.relationType,
      })),
    ];

    return {
      timeline,
      sideOrbit: [...sides, ...orbit].sort(byYear),
      recommended: recs,
      other: rest,
    };
  }, [relations, centerId, centerTitle, centerImage, centerYear]);

  const officialCount = relations.filter(
    (r) => (r.relationType || "").toUpperCase() !== "RECOMMENDED",
  ).length;

  return (
    <section className="detail-section ancestry-section" id="ancestry">
      <div className="ab-header">
        <div>
          <p className="ab-kicker">Franchise map</p>
          <h2>Ancestry</h2>
          <p className="ancestry-lead">
            {loading
              ? "Mapping the family tree…"
              : officialCount
                ? `${officialCount} official link${officialCount === 1 ? "" : "s"} from AniList` +
                  (recommended.length
                    ? ` · ${recommended.length} similar picks`
                    : "")
                : recommended.length
                  ? `No sequels listed — ${recommended.length} similar titles from AniList`
                  : "No related anime on AniList for this title."}
          </p>
        </div>
      </div>

      {/* Main story timeline */}
      {timeline.length > 1 || officialCount > 0 ? (
        <div className="ab-block">
          <h3 className="ab-block-title">Story line</h3>
          <p className="ab-block-hint">Prequels → this title → sequels</p>
          <div className="ab-timeline">
            {timeline.map((n, i) => (
              <div key={`${n.id}-${i}`} className="ab-timeline-item">
                {i > 0 ? <div className="ab-connector" aria-hidden /> : null}
                <PosterCard
                  href={n.current ? undefined : `/anime/${n.id}`}
                  title={n.title}
                  image={n.image}
                  current={n.current}
                  badge={n.badge}
                  badgeType={n.badgeType}
                  meta={[
                    n.year ? String(n.year) : null,
                    n.score != null ? `★ ${n.score.toFixed(1)}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Side stories / spin-offs / alternatives */}
      {sideOrbit.length > 0 ? (
        <div className="ab-block">
          <h3 className="ab-block-title">Side stories &amp; variants</h3>
          <p className="ab-block-hint">OVAs, spin-offs, movies, alternates</p>
          <div className="ab-grid">
            {sideOrbit.map((r) => (
              <PosterCard
                key={`${r.id}-${r.relationType}`}
                href={`/anime/${r.id}`}
                title={r.title}
                image={r.image}
                badge={labelType(r.relationType)}
                badgeType={r.relationType}
                meta={[
                  r.format,
                  r.year ? String(r.year) : null,
                  r.score != null ? `★ ${r.score.toFixed(1)}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Recommended similar */}
      {recommended.length > 0 ? (
        <div className="ab-block">
          <h3 className="ab-block-title">Related &amp; similar</h3>
          <p className="ab-block-hint">
            Community recommendations on AniList — not official sequels
          </p>
          <div className="ab-grid">
            {recommended.map((r) => (
              <PosterCard
                key={`rec-${r.id}`}
                href={`/anime/${r.id}`}
                title={r.title}
                image={r.image}
                badge="Similar"
                badgeType="RECOMMENDED"
                meta={[
                  r.format,
                  r.year ? String(r.year) : null,
                  r.score != null ? `★ ${r.score.toFixed(1)}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ))}
          </div>
        </div>
      ) : null}

      {other.length > 0 ? (
        <div className="ab-block">
          <h3 className="ab-block-title">Also linked</h3>
          <div className="ab-grid">
            {other.map((r) => (
              <PosterCard
                key={`${r.id}-${r.relationType}`}
                href={`/anime/${r.id}`}
                title={r.title}
                image={r.image}
                badge={labelType(r.relationType)}
                badgeType={r.relationType}
                meta={[r.format, r.year ? String(r.year) : null]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ))}
          </div>
        </div>
      ) : null}

      {!loading && !relations.length ? (
        <p className="tools-hint" style={{ marginTop: 8 }}>
          Try a multi-season franchise (e.g. Attack on Titan, Fate, Monogatari) for
          a full map.
        </p>
      ) : null}
    </section>
  );
}
