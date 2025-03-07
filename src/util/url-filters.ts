import { TagListing, UrlListing } from "../types";
import { getTagByNameMemo } from "./tags";
import licenses from "../data/licenses.json";

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

export const URL_CAP = 10;
export function filterUrlsAdvanced(
  includeTags: string,
  excludeTags: string,
  includeString: string,
  excludeString: string,
  includeLicense: string,
  capUrlsPerAccount: boolean,
  tags: ReadonlyArray<TagListing>,
  urls: ReadonlyArray<UrlListing>
): ReadonlyArray<UrlListing> {
  if (
    !includeTags &&
    !excludeTags &&
    !includeString &&
    !excludeString &&
    !includeLicense &&
    !capUrlsPerAccount
  ) {
    return urls;
  }

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

      prefilteredUrls = Object.values(cappedList).flat();
    });
  }

  return prefilteredUrls.filter((u) => {
    if (includeLicense) {
      const terms = splitTerms(includeLicense);
      // allowed IDs
      const ids = terms.map((t) => licenses.find((l) => t === l.name)?.bc_id);
      if (!ids.includes(u.license)) {
        return false;
      }
    }

    if (includeString) {
      const terms = splitTerms(includeString);
      for (const t of terms) {
        if (
          !u.title.toLowerCase().includes(t) &&
          !u.url.toLowerCase().includes(t)
        ) {
          return false;
        }
      }
    }

    if (excludeString) {
      const terms = splitTerms(excludeString);
      for (const t of terms) {
        if (
          u.title.toLowerCase().includes(t) ||
          u.url.toLowerCase().includes(t)
        ) {
          return false;
        }
      }
    }

    if (includeTags) {
      const terms = splitTerms(includeTags);
      for (const t of terms) {
        const tag = getTagByNameMemo(tags, t);
        if (tag && !u.tags.includes(tag.tag_id)) {
          return false;
        }
      }
    }

    if (excludeTags) {
      const terms = splitTerms(excludeTags);
      for (const t of terms) {
        const tag = getTagByNameMemo(tags, t);
        if (tag && u.tags.includes(tag.tag_id)) {
          return false;
        }
      }
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
