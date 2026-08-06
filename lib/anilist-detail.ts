/**
 * Rich single-title fetch (studios, trailer, characters, relations + recommendations).
 */
import { mapAniListMedia, ANILIST_ENDPOINT } from "./anilist";
import type { Anime, AnimeRelation } from "./types";

type GqlResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const init: RequestInit & { next?: { revalidate: number } } = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  };
  if (typeof window === "undefined") {
    init.next = { revalidate: 60 };
  }
  const res = await fetch(ANILIST_ENDPOINT, init);
  if (!res.ok) throw new Error(`AniList HTTP ${res.status}`);
  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) throw new Error("AniList returned empty data");
  return json.data;
}

const RELATION_NODE = `
  id
  type
  title { romaji english }
  format
  status
  startDate { year }
  averageScore
  coverImage { large medium }
`;

const DETAIL_FIELDS = `
  id
  idMal
  title { romaji english native }
  description
  genres
  status
  format
  startDate { year }
  season
  seasonYear
  averageScore
  popularity
  favourites
  coverImage { large medium }
  bannerImage
  siteUrl
  episodes
  duration
  isAdult
  source
  studios { nodes { name } }
  trailer { id site thumbnail }
  characters(sort: [ROLE, RELEVANCE, ID], perPage: 16) {
    edges {
      role
      node {
        id
        name { full }
        image { large medium }
      }
    }
  }
  relations {
    edges {
      relationType
      node { ${RELATION_NODE} }
    }
  }
  recommendations(page: 1, perPage: 12, sort: RATING_DESC) {
    nodes {
      rating
      mediaRecommendation {
        ${RELATION_NODE}
      }
    }
  }
`;

/** Skip non-anime media; ONE_SHOT can be anime specials — only skip manga/novel types */
const NON_ANIME_TYPE = new Set(["MANGA", "NOVEL"]);

type RelNode = {
  id: number;
  type?: string;
  title?: { romaji?: string; english?: string };
  format?: string;
  status?: string;
  startDate?: { year?: number | null };
  averageScore?: number | null;
  coverImage?: { large?: string; medium?: string };
};

export function mapRelationEdges(
  edges: { relationType?: string; node?: RelNode }[],
): AnimeRelation[] {
  const relations: AnimeRelation[] = [];
  const seen = new Set<number>();
  for (const e of edges) {
    const n = e.node;
    if (!n?.id || seen.has(n.id)) continue;
    if (n.type && NON_ANIME_TYPE.has(n.type)) continue;
    const fmt = (n.format || "").toUpperCase();
    if (fmt === "MANGA" || fmt === "NOVEL") continue;
    seen.add(n.id);
    relations.push({
      id: n.id,
      title: n.title?.english || n.title?.romaji || "Untitled",
      relationType: e.relationType || "RELATED",
      format: n.format,
      status: n.status,
      image: n.coverImage?.large || n.coverImage?.medium,
      year: n.startDate?.year ?? null,
      score: n.averageScore != null ? n.averageScore / 10 : null,
    });
  }
  return relations;
}

function mapRecommendations(
  nodes: {
    rating?: number;
    mediaRecommendation?: RelNode | null;
  }[],
  already: Set<number>,
): AnimeRelation[] {
  const out: AnimeRelation[] = [];
  for (const n of nodes) {
    const m = n.mediaRecommendation;
    if (!m?.id || already.has(m.id)) continue;
    if (m.type && NON_ANIME_TYPE.has(m.type)) continue;
    already.add(m.id);
    out.push({
      id: m.id,
      title: m.title?.english || m.title?.romaji || "Untitled",
      relationType: "RECOMMENDED",
      format: m.format,
      status: m.status,
      image: m.coverImage?.large || m.coverImage?.medium,
      year: m.startDate?.year ?? null,
      score: m.averageScore != null ? m.averageScore / 10 : null,
    });
  }
  return out;
}

export async function fetchAnimeDetail(id: number): Promise<Anime | null> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${DETAIL_FIELDS}
      }
    }
  `;
  const data = await gql<{ Media: Record<string, unknown> | null }>(query, {
    id,
  });
  if (!data.Media) return null;

  const anime = mapAniListMedia(data.Media);

  const idMal = data.Media.idMal;
  if (typeof idMal === "number") anime.idMal = idMal;

  const studios = (
    data.Media.studios as { nodes?: { name: string }[] } | undefined
  )?.nodes;
  if (studios?.length) {
    anime.studios = studios.map((n) => n.name).filter(Boolean);
  }

  const tr = data.Media.trailer as
    | { id?: string; site?: string; thumbnail?: string }
    | null
    | undefined;
  if (tr) {
    anime.trailer = {
      id: tr.id,
      site: tr.site,
      thumbnail: tr.thumbnail,
    };
  }

  const edges =
    (
      data.Media.characters as {
        edges?: {
          role?: string;
          node?: {
            id: number;
            name?: { full?: string };
            image?: { large?: string; medium?: string };
          };
        }[];
      }
    )?.edges || [];

  anime.characters = edges
    .filter((e) => e.node)
    .map((e) => ({
      id: e.node!.id,
      name: e.node!.name?.full || "Unknown",
      role: e.role || "SUPPORTING",
      image: e.node!.image?.large || e.node!.image?.medium,
    }));

  const relEdges =
    (
      data.Media.relations as {
        edges?: { relationType?: string; node?: RelNode }[];
      }
    )?.edges || [];

  const relations = mapRelationEdges(relEdges);
  const seen = new Set(relations.map((r) => r.id));
  seen.add(id);

  const recNodes =
    (
      data.Media.recommendations as {
        nodes?: {
          rating?: number;
          mediaRecommendation?: RelNode | null;
        }[];
      }
    )?.nodes || [];

  anime.relations = [
    ...relations,
    ...mapRecommendations(recNodes, seen),
  ];

  return anime;
}

/** Full ancestry payload for client fallback */
export async function fetchRelationsOnly(id: number): Promise<AnimeRelation[]> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        relations {
          edges {
            relationType
            node { ${RELATION_NODE} }
          }
        }
        recommendations(page: 1, perPage: 12, sort: RATING_DESC) {
          nodes {
            rating
            mediaRecommendation { ${RELATION_NODE} }
          }
        }
      }
    }
  `;
  const data = await gql<{
    Media: {
      relations?: { edges?: { relationType?: string; node?: RelNode }[] };
      recommendations?: {
        nodes?: {
          rating?: number;
          mediaRecommendation?: RelNode | null;
        }[];
      };
    } | null;
  }>(query, { id });

  const edges = data.Media?.relations?.edges || [];
  const relations = mapRelationEdges(edges);
  const seen = new Set(relations.map((r) => r.id));
  seen.add(id);
  const recs = mapRecommendations(
    data.Media?.recommendations?.nodes || [],
    seen,
  );
  return [...relations, ...recs];
}
