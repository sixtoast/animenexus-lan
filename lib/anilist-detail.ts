/**
 * Rich single-title fetch (studios, trailer, characters).
 * Kept separate so list queries stay light.
 */
import { mapAniListMedia, ANILIST_ENDPOINT } from "./anilist";
import type { Anime } from "./types";

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
    init.next = { revalidate: 300 };
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

const DETAIL_FIELDS = `
  id
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
  characters(sort: [ROLE, RELEVANCE, ID], perPage: 12) {
    edges {
      role
      node {
        id
        name { full }
        image { large medium }
      }
    }
  }
`;

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
  anime.season = (data.Media.season as string) || anime.season;
  anime.seasonYear = (data.Media.seasonYear as number) || anime.seasonYear;
  anime.source = (data.Media.source as string) || anime.source;

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

  return anime;
}
