import { useMemo, useState } from "react";
import { TagListing, UrlListing } from "./types";
import { filterUrlsAdvanced } from "./util/url-filters";
import { getTagByIdMemo } from "./util/tags";
import { getLicenseNameByBcId } from "./util/licenses";

const SAMPLE_COUNT = 5;

type AdvancedProps = {
  urls: ReadonlyArray<UrlListing>;
  tags: ReadonlyArray<TagListing>;
};

type AdvancedCardProps = {
  url: UrlListing;
  tags: ReadonlyArray<TagListing>;
};

function AdvancedCard(props: AdvancedCardProps) {
  const { url, tags } = props;
  return (
    <div>
      <ul>
        <li>title: {url.title}</li>
        <li>url: {url.url}</li>
        <li>
          tags: {url.tags.map((t) => getTagByIdMemo(tags, t)?.name).join(", ")}
        </li>
        <li>license: {getLicenseNameByBcId(url.license)}</li>
      </ul>
    </div>
  );
}

function Advanced(props: AdvancedProps) {
  // for the inputs
  const [includeTags, setIncludeTags] = useState<string>("");
  const [excludeTags, setExcludeTags] = useState<string>("");
  const [includeString, setIncludeString] = useState<string>("");
  const [excludeString, setExcludeString] = useState<string>("");
  const [includeLicense, setIncludeLicense] = useState<string>("");

  // for the filtering
  const [includeTagsFilter, setIncludeTagsFilter] = useState<string>("");
  const [excludeTagsFilter, setExcludeTagsFilter] = useState<string>("");
  const [includeStringFilter, setIncludeStringFilter] = useState<string>("");
  const [excludeStringFilter, setExcludeStringFilter] = useState<string>("");
  const [includeLicenseFilter, setIncludeLicenseFilter] = useState<string>("");

  const [showAllResults, setShowAllResults] = useState<boolean>(false);

  // update filters to trigger a recompute of the list
  function updateFilters() {
    setIncludeTagsFilter(includeTags);
    setExcludeTagsFilter(excludeTags);
    setIncludeStringFilter(includeString);
    setExcludeStringFilter(excludeString);
    setIncludeLicenseFilter(includeLicense);
  }

  // There's bound to be a better way to do this,
  // but I just wanted to update the list when clicking submit
  const filteredUrls = useMemo(() => {
    return filterUrlsAdvanced(
      includeTagsFilter,
      excludeTagsFilter,
      includeStringFilter,
      excludeStringFilter,
      includeLicenseFilter,
      props.tags,
      props.urls
    );
  }, [
    includeTagsFilter,
    excludeTagsFilter,
    includeStringFilter,
    excludeStringFilter,
    includeLicenseFilter,
    props.tags,
    props.urls,
  ]);

  let displayedUrls = filteredUrls;
  if (!showAllResults) {
    displayedUrls = displayedUrls.slice(0, SAMPLE_COUNT);
  }

  return (
    <div className="advanced">
      <p>
        <b>{filteredUrls.length} results</b>
      </p>

      <label className="input-label">
        Include tags (AND)
        <input
          value={includeTags}
          onChange={(e) => setIncludeTags(e.target.value)}
        />
      </label>

      <label className="input-label">
        Exclude tags (OR)
        <input
          value={excludeTags}
          onChange={(e) => setExcludeTags(e.target.value)}
        />
      </label>

      <label className="input-label">
        Include strings (AND)
        <input
          value={includeString}
          onChange={(e) => setIncludeString(e.target.value)}
        />
      </label>

      <label className="input-label">
        Exclude strings (OR)
        <input
          value={excludeString}
          onChange={(e) => setExcludeString(e.target.value)}
        />
      </label>

      <label className="input-label">
        Include license (OR)
        <input
          value={includeLicense}
          onChange={(e) => setIncludeLicense(e.target.value)}
        />
      </label>

      <p>
        <button onClick={updateFilters}>Submit</button>
      </p>

      {displayedUrls.map((u) => (
        <AdvancedCard url={u} tags={props.tags} />
      ))}

      <div>
        {!showAllResults && filteredUrls.length > SAMPLE_COUNT && (
          <button
            onClick={() => setShowAllResults(true)}
            className="show-more-button"
          >
            Show all listings
          </button>
        )}
      </div>
    </div>
  );
}

export default Advanced;
