export type UrlListing = {
  url_id: number;
  url: string;
  title: string;
  license_url: string;
  tags: ReadonlyArray<number>;
  favorite?: boolean;
  bc_id: number;
};

export type License = {
  url: string;
  text: string;
  count: number;
};

export type PlayerData = {
  url: string;
  title: string;
  bc_id: number;
};
