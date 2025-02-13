import { UrlListing } from "../types";
import { licenseUrlToText } from "./licenses";

export function filterUrlsByTag(
  tag: number,
  urls: ReadonlyArray<UrlListing>
): ReadonlyArray<UrlListing> {
  return urls.filter((u) => u.tags.includes(tag));
}

export function filterUrlsByLicense(
  license: string,
  urls: ReadonlyArray<UrlListing>
): ReadonlyArray<UrlListing> {
  return urls.filter((u) => licenseUrlToText(u.license_url) === license);
}

export function filterUrlsByFaves(
  urls: ReadonlyArray<UrlListing>
): ReadonlyArray<UrlListing> {
  return urls.filter((u) => !!u.favorite);
}
