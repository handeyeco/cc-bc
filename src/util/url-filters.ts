import { TagListing, UrlListing } from "../types";
import { getTagByNameMemo } from "./tags";

export const SALES_NONE = 0;
export const SALES_SOME = 1;
export const SALES_MANY = 2;

// this is an effort to highlight more artists,
// rather than showing the same super-prolific artists
// over and over again (cap listings by domain)
const bandcampSubdomainRegex = /^https?:\/\/(.+)\.bandcamp\.com/;
export function collapseUrls(
  urls: ReadonlyArray<UrlListing>,
  limit: number = 5,
): ReadonlyArray<UrlListing> {
  const counts: Record<string, number> = {};
  return urls.filter((u) => {
    const match = u.url.match(bandcampSubdomainRegex);
    if (!match) {
      throw new Error(`malformed url: ${u.url}`);
    }

    const subdomain = match[1];
    if (counts[subdomain] == null) {
      counts[subdomain] = 1;
    } else {
      counts[subdomain]++;
    }

    return !(counts[subdomain] > limit);
  });
}

export function filterUrlsByTag(
  tag: number,
  urls: ReadonlyArray<UrlListing>,
): ReadonlyArray<UrlListing> {
  return urls.filter((u) => u.tags.includes(tag));
}

export function filterUrlsByLicense(
  license: number,
  urls: ReadonlyArray<UrlListing>,
): ReadonlyArray<UrlListing> {
  return urls.filter((u) => u.license === license);
}

export function filterUrlsByFaves(
  urls: ReadonlyArray<UrlListing>,
): ReadonlyArray<UrlListing> {
  return urls.filter((u) => !!u.favorite);
}

export const URL_CAP = 10;
export function filterUrlsAdvanced(
  includeTags: string,
  excludeTags: string,
  includeString: string,
  excludeString: string,
  licenses: Set<number>,
  sales: Set<number>,
  capUrlsPerAccount: boolean,
  tags: ReadonlyArray<TagListing>,
  urls: ReadonlyArray<UrlListing>,
): ReadonlyArray<UrlListing> {
  if (
    !includeTags &&
    !excludeTags &&
    !includeString &&
    !excludeString &&
    !capUrlsPerAccount &&
    licenses?.size === 6 &&
    sales?.size === 3
  ) {
    return urls;
  }

  if (licenses?.size === 0 || sales?.size === 0) {
    return [];
  }

  // precompute everything that doesn't change per-URL
  const includeTagTerms = includeTags
    ? splitTerms(includeTags).map((t) => getTagByNameMemo(tags, t)?.tag_id)
    : null;
  const excludeTagTerms = excludeTags
    ? splitTerms(excludeTags).map((t) => getTagByNameMemo(tags, t)?.tag_id)
    : null;
  const includeStringTerms = includeString ? splitTerms(includeString) : null;
  const excludeStringTerms = excludeString ? splitTerms(excludeString) : null;
  const allowedLicenseSet = licenses.size < 6 ? new Set(licenses) : null;
  const allowedSalesSet = sales.size < 3 ? new Set(sales) : null;

  let prefilteredUrls: ReadonlyArray<UrlListing> = urls;
  if (capUrlsPerAccount) {
    const cappedList: Record<string, UrlListing[]> = {};
    urls.forEach((u) => {
      const origin = new URL(u.url).origin;
      if (!cappedList[origin]) {
        cappedList[origin] = [];
      }
      if (cappedList[origin].length < URL_CAP) {
        cappedList[origin].push(u);
      }
    });
    prefilteredUrls = Object.values(cappedList).flat();
  }

  return prefilteredUrls.filter((u) => {
    if (allowedLicenseSet && !allowedLicenseSet.has(u.license)) {
      return false;
    }

    if (includeStringTerms || excludeStringTerms) {
      const lowerTitle = u.title.toLowerCase();
      const lowerUrl = u.url.toLowerCase();

      if (includeStringTerms) {
        for (const t of includeStringTerms) {
          if (!lowerTitle.includes(t) && !lowerUrl.includes(t)) {
            return false;
          }
        }
      }

      if (excludeStringTerms) {
        for (const t of excludeStringTerms) {
          if (lowerTitle.includes(t) || lowerUrl.includes(t)) {
            return false;
          }
        }
      }
    }

    if (includeTagTerms) {
      for (const tagId of includeTagTerms) {
        if (tagId != null && !u.tags.includes(tagId)) {
          return false;
        }
      }
    }

    if (excludeTagTerms) {
      for (const tagId of excludeTagTerms) {
        if (tagId != null && u.tags.includes(tagId)) {
          return false;
        }
      }
    }

    if (allowedSalesSet && !allowedSalesSet.has(u.sales)) {
      return false;
    }

    return true;
  });
}

// `"hello world", "cool-beans"` => ["hello world", "cool-beans"]
function splitTerms(input: string): ReadonlyArray<string> {
  return input
    .split(/\s*,\s*/)
    .map((s) => s.replace(/(^"|"$)/g, "").toLowerCase())
    .filter(Boolean);
}
