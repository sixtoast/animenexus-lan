/** Shared domain types for AnimeNexus Lantern */

export type MediaFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC"
  | string;

export type MediaStatus =
  | "FINISHED"
  | "RELEASING"
  | "NOT_YET_RELEASED"
  | "CANCELLED"
  | "HIATUS"
  | string;

export type DiscoverFeed = "trending" | "popular" | "top";

export type WatchStatus =
  | "watching"
  | "planning"
  | "completed"
  | "paused"
  | "dropped";

/** Normalized anime used across the UI */
export type Anime = {
  id: number;
  title: string;
  titleRomaji?: string;
  titleNative?: string;
  description: string;
  /** Primary genre label for badges */
  genre: string;
  /** Full genre list */
  tags: string[];
  status: MediaStatus;
  format: MediaFormat;
  year: number | string;
  /** 0–10 scale (AniList averageScore / 10) */
  score: number;
  popularity: number;
  image: string;
  bannerImage?: string;
  anilist_id: number;
  url?: string;
  episodes: number | string;
  duration: number;
  studios?: string[];
  source?: string;
  isAdult?: boolean;
};

export type PageInfo = {
  total: number;
  currentPage?: number;
  lastPage?: number;
  hasNextPage: boolean;
};

export type AnimePage = {
  data: Anime[];
  pagination: PageInfo;
};

export type AnimeFilters = {
  genre?: string;
  status?: string;
  format?: string;
  year?: string;
  sort?: "score" | "popularity" | "title" | "year";
  adultFilter?: "exclude" | "include" | "only";
  source?: string;
  studio?: string;
  search?: string;
};
