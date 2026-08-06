import { ANILIST_ENDPOINT, mapAniListMedia } from "./anilist";
import type { Anime, AnimePage } from "./types";
import type { AniSeason } from "./season";

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
    init.next = { revalidate: 600 };
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

const FIELDS = `
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
  coverImage { large medium }
  bannerImage
  siteUrl
  episodes
  duration
  isAdult
`;

export async function fetchSeasonal(
  season: AniSeason,
  seasonYear: number,
  page = 1,
  perPage = 24,
): Promise<AnimePage> {
  const query = `
    query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(
          type: ANIME
          season: $season
          seasonYear: $seasonYear
          sort: [POPULARITY_DESC]
          isAdult: false
        ) {
          ${FIELDS}
        }
      }
    }
  `;
  const data = await gql<{
    Page: {
      pageInfo: {
        total: number;
        currentPage: number;
        lastPage: number;
        hasNextPage: boolean;
      };
      media: Record<string, unknown>[];
    };
  }>(query, { page, perPage, season, seasonYear });

  return {
    data: (data.Page.media || []).map(mapAniListMedia),
    pagination: {
      total: data.Page.pageInfo.total ?? 0,
      currentPage: data.Page.pageInfo.currentPage,
      lastPage: data.Page.pageInfo.lastPage,
      hasNextPage: Boolean(data.Page.pageInfo.hasNextPage),
    },
  };
}

export async function fetchAiring(
  page = 1,
  perPage = 24,
): Promise<AnimePage> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(
          type: ANIME
          status: RELEASING
          sort: [POPULARITY_DESC]
          isAdult: false
        ) {
          ${FIELDS}
        }
      }
    }
  `;
  const data = await gql<{
    Page: {
      pageInfo: {
        total: number;
        currentPage: number;
        lastPage: number;
        hasNextPage: boolean;
      };
      media: Record<string, unknown>[];
    };
  }>(query, { page, perPage });

  return {
    data: (data.Page.media || []).map(mapAniListMedia),
    pagination: {
      total: data.Page.pageInfo.total ?? 0,
      currentPage: data.Page.pageInfo.currentPage,
      lastPage: data.Page.pageInfo.lastPage,
      hasNextPage: Boolean(data.Page.pageInfo.hasNextPage),
    },
  };
}

export async function fetchDailyPool(perPage = 50): Promise<Anime[]> {
  const query = `
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(
          type: ANIME
          sort: [POPULARITY_DESC]
          isAdult: false
          status_in: [FINISHED, RELEASING]
        ) {
          ${FIELDS}
        }
      }
    }
  `;
  const data = await gql<{
    Page: { media: Record<string, unknown>[] };
  }>(query, { perPage });
  return (data.Page.media || []).map(mapAniListMedia);
}
