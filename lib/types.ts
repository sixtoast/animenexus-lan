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

export type AnimeCharacter = {
  id: number;
  name: string;
  role: string;
  image?: string;
};

export type Anime = {
  id: number;
  title: string;
  titleRomaji?: string;
  titleNative?: string;
  description: string;
  genre: string;
  tags: string[];
  status: MediaStatus;
  format: MediaFormat;
  year: number | string;
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
  season?: string;
  seasonYear?: number;
  averageScoreRaw?: number;
  favourites?: number;
  trailer?: { id?: string; site?: string; thumbnail?: string };
  characters?: AnimeCharacter[];
};

export type WatchlistEntry = {
  id: number;
  title: string;
  image: string;
  format?: string;
  year?: number | string;
  episodes?: number | string;
  duration?: number;
  score?: number;
  watchStatus: WatchStatus;
  progress: number;
  userRating: number;
  notes: string;
  addedAt: string;
  updatedAt: string;
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
