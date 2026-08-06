"use client";

import Link from "next/link";
import type { AnimeRelation } from "@/lib/types";

type Props = {
  centerTitle: string;
  centerId: number;
  relations: AnimeRelation[];
};

export function AncestryGraph({ centerTitle, centerId, relations }: Props) {
  if (!relations.length) return null;

  const groups = new Map<string, AnimeRelation[]>();
  for (const r of relations) {
    const key = r.relationType || "RELATED";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  return (
    <section className="detail-section">
      <h2>Ancestry</h2>
      <p className="tools-hint" style={{ marginBottom: 12 }}>
        Relation map for <strong>{centerTitle}</strong> — click a node to open
        it.
      </p>
      <div className="ancestry-wrap">
        <div className="ancestry-center">
          <Link href={`/anime/${centerId}`} className="ancestry-node root">
            {centerTitle}
          </Link>
        </div>
        {[...groups.entries()].map(([type, list]) => (
          <div key={type} className="ancestry-group">
            <div className="ancestry-type">{type.replace(/_/g, " ")}</div>
            <div className="ancestry-nodes">
              {list.map((r) => (
                <Link
                  key={`${r.id}-${r.relationType}`}
                  href={`/anime/${r.id}`}
                  className="ancestry-node"
                  title={r.format || ""}
                >
                  {r.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
