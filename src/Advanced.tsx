import { SyntheticEvent, useMemo, useState } from "react";
import { TagListing, UrlListing } from "./types";
import { collapseUrls, filterUrlsAdvanced, URL_CAP } from "./util/url-filters";
import { getTagByIdMemo } from "./util/tags";
import { getLicenseNameByBcId } from "./util/licenses";

import "./Advanced.css";
import useUrls from "./hooks/useUrls";
import useTags from "./hooks/useTags";
import useLicenses from "./hooks/useLicenses";

const SAMPLE_COUNT = 5;

type AdvancedCardProps = {
  url: UrlListing;
  tags: ReadonlyArray<TagListing>;
};

function AdvancedCard(props: AdvancedCardProps) {
  const { data: licenseData } = useLicenses();
  const { url, tags } = props;

  if (!licenseData) return null;

  return (
    <div className="advanced-card">
      <ul>
        <li>
          <span className="advanced-card__row-name">title:</span> {url.title}
        </li>
        <li>
          <span className="advanced-card__row-name">url:</span>{" "}
          <a href={url.url}>{url.url}</a>
        </li>
        <li>
          <span className="advanced-card__row-name">tags:</span>{" "}
          {url.tags.map((t) => getTagByIdMemo(tags, t)?.name).join(", ")}
        </li>
        <li>
          <span className="advanced-card__row-name">license:</span>{" "}
          {getLicenseNameByBcId(url.license, licenseData)}
        </li>
      </ul>
    </div>
  );
}

function Advanced() {
  // shared data
  const { data: urlData } = useUrls();
  const { data: tagData } = useTags();
  const { data: licenseData } = useLicenses();

  // for the inputs
  const [includeTags, setIncludeTags] = useState<string>("");
  const [excludeTags, setExcludeTags] = useState<string>("");
  const [includeString, setIncludeString] = useState<string>("");
  const [excludeString, setExcludeString] = useState<string>("");
  const [includeLicense, setIncludeLicense] = useState<string>("");
  const [capUrlsPerAccount, setCapUrlsPerAccount] = useState<boolean>(false);

  // for the filtering
  const [includeTagsFilter, setIncludeTagsFilter] = useState<string>("");
  const [excludeTagsFilter, setExcludeTagsFilter] = useState<string>("");
  const [includeStringFilter, setIncludeStringFilter] = useState<string>("");
  const [excludeStringFilter, setExcludeStringFilter] = useState<string>("");
  const [includeLicenseFilter, setIncludeLicenseFilter] = useState<string>("");
  const [capUrlsPerAccountFilter, setCapUrlsPerAccountFilter] =
    useState<boolean>(false);

  const [showAllResults, setShowAllResults] = useState<boolean>(false);

  // update filters to trigger a recompute of the list
  function updateFilters(e: SyntheticEvent) {
    e.preventDefault();

    setShowAllResults(false);

    setIncludeTagsFilter(includeTags);
    setExcludeTagsFilter(excludeTags);
    setIncludeStringFilter(includeString);
    setExcludeStringFilter(excludeString);
    setIncludeLicenseFilter(includeLicense);
    setCapUrlsPerAccountFilter(capUrlsPerAccount);
  }

  // There's bound to be a better way to do this,
  // but I just wanted to update the list when clicking submit
  const filteredUrls = useMemo(() => {
    if (!licenseData || !urlData || !tagData) return [];

    return filterUrlsAdvanced(
      includeTagsFilter,
      excludeTagsFilter,
      includeStringFilter,
      excludeStringFilter,
      includeLicenseFilter,
      capUrlsPerAccountFilter,
      tagData,
      urlData,
      licenseData,
    );
  }, [
    includeTagsFilter,
    excludeTagsFilter,
    includeStringFilter,
    excludeStringFilter,
    includeLicenseFilter,
    capUrlsPerAccountFilter,
    tagData,
    urlData,
    licenseData,
  ]);

  // for the random button
  const collapsedUrls: ReadonlyArray<UrlListing> = useMemo(
    () => collapseUrls(filteredUrls),
    [filteredUrls],
  );

  if (!licenseData || !urlData || !tagData) return null;

  let displayedUrls = filteredUrls;
  if (!showAllResults) {
    displayedUrls = displayedUrls.slice(0, SAMPLE_COUNT);
  }

  function randomPage() {
    const listing =
      collapsedUrls[Math.floor(Math.random() * collapsedUrls.length)];
    open(listing.url, "_blank");
  }

  return (
    <div className="advanced">
      <div className="advanced__rules">
        Terms need to be in quotes and separated by commas.
        <ul>
          <li>
            Tags are by name: <i>"indie","hip hop"</i>
          </li>
          <li>
            Strings are checked against title and url: <i>"Boards","Canada"</i>
          </li>
          <li>
            License is by abbreviation: <i>"by-nc-nd","by"</i>
          </li>
        </ul>
      </div>

      <form onSubmit={updateFilters}>
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

        <label className="input-label">
          Cap listings ({URL_CAP} per account)
          <input
            type="checkbox"
            checked={capUrlsPerAccount}
            onChange={(e) => {
              setCapUrlsPerAccount(e.target.checked);
            }}
          />
        </label>

        <p>
          <button className="advanced__submit">Submit →</button>
        </p>
      </form>

      <p>
        <button className="advanced__random" onClick={randomPage}>
          Random filtered page
        </button>
      </p>

      <hr />

      <p>
        <b>{filteredUrls.length} results</b>
      </p>

      {displayedUrls.map((u) => (
        <AdvancedCard key={u.url} url={u} tags={tagData} />
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
