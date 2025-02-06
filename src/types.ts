export type UrlListing = {
  url_id: number;
  url: string;
  title: string;
  license_url: string;
  tags: ReadonlyArray<number>;
};

export type License = {
  url: string;
  text: string;
  count: number;
};
