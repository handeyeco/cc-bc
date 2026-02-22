export type LoadingState = "not-started" | "loading" | "loaded" | "error";

export type TagListing = {
  tag_id: number;
  name: string;
  count: number;
};

export type UrlListing = {
  url_id: number;
  url: string;
  title: string;
  license: number;
  tags: ReadonlyArray<number>;
  favorite?: boolean;
  bc_id: number;
};

export type License = {
  url: string;
  name: string;
  count: number;
  bc_id: number;
};

export type PlayerData = {
  url: string;
  title: string;
  bc_id: number;
};
