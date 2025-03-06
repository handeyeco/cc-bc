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

export function filterUrlsAdvanced(
  includeTags: string,
  excludeTags: string,
  includeString: string,
  excludeString: string,
  includeLicense: string,
  tags: ReadonlyArray<TagListing>,
  urls: ReadonlyArray<UrlListing>
): ReadonlyArray<UrlListing> {
  if (
    !includeTags &&
    !excludeTags &&
    !includeString &&
    !excludeString &&
    !includeLicense
  ) {
    return urls;
  }

  return urls.filter((u) => {
    if (includeLicense) {
      const terms = splitTerms(includeLicense);
      for (const t of terms) {
        const license = licenses.find(
          (l) => l.name.toLowerCase() === t.toLowerCase()
        );
        if (license && u.license !== license.bc_id) {
          return false;
        }
      }
    }

    // TODO: include urls as part of string search
    if (includeString) {
      const terms = splitTerms(includeString);
      for (const t of terms) {
        if (!u.title.toLowerCase().includes(t.toLowerCase())) {
          return false;
        }
      }
    }

    // TODO: include urls as part of string search
    if (excludeString) {
      const terms = splitTerms(excludeString);
      for (const t of terms) {
        if (u.title.toLowerCase().includes(t.toLowerCase())) {
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
    .map((s) => s.replace(/(^"|"$)/g, ""))
    .filter(Boolean);
}
