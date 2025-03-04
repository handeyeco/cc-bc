import { UrlListing } from "../types";

export function filterUrlsByTag(
  tag: number,
  urls: ReadonlyArray<UrlListing>
): ReadonlyArray<UrlListing> {
  return urls.filter((u) => u.tags.includes(tag));
}

export function filterUrlsByLicense(
  license: number,
  urls: ReadonlyArray<UrlListing>
): ReadonlyArray<UrlListing> {
  return urls.filter((u) => u.license === license);
}

export function filterUrlsByFaves(
  urls: ReadonlyArray<UrlListing>
): ReadonlyArray<UrlListing> {
  return urls.filter((u) => !!u.favorite);
}
