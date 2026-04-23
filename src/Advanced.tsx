import { SyntheticEvent, useMemo, useState } from "react";
import { TagListing, UrlListing } from "./types";
import {
  collapseUrls,
  filterUrlsAdvanced,
  SALES_MANY,
  SALES_NONE,
  SALES_SOME,
  URL_CAP,
} from "./util/url-filters";
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

  const [licenses, setLicenses] = useState<Set<number>>(
    new Set(licenseData!.map((l) => l.bc_id)),
  );
  const [sales, setSales] = useState<Set<number>>(new Set([0, 1, 2]));
  const [capUrlsPerAccount, setCapUrlsPerAccount] = useState<boolean>(false);

  // for the filtering
  const [includeTagsFilter, setIncludeTagsFilter] = useState<string>("");
  const [excludeTagsFilter, setExcludeTagsFilter] = useState<string>("");
  const [includeStringFilter, setIncludeStringFilter] = useState<string>("");
  const [excludeStringFilter, setExcludeStringFilter] = useState<string>("");

  const [licensesFilter, setLicensesFilter] = useState<Set<number>>(licenses);
  const [salesFilter, setSalesFilter] = useState<Set<number>>(sales);
  const [capUrlsPerAccountFilter, setCapUrlsPerAccountFilter] =
    useState<boolean>(false);

  const [showAllResults, setShowAllResults] = useState<boolean>(false);

  function sharedSetLicenses(bc_id: number, value: boolean) {
    const newSet = new Set(licenses);
    if (value) {
      newSet.add(bc_id);
    } else {
      newSet.delete(bc_id);
    }
    setLicenses(newSet);
  }

  function sharedSetSales(type: number, value: boolean) {
    const newSet = new Set(sales);
    if (value) {
      newSet.add(type);
    } else {
      newSet.delete(type);
    }
    setSales(newSet);
  }

  // update filters to trigger a recompute of the list
  function updateFilters(e: SyntheticEvent) {
    e.preventDefault();

    setShowAllResults(false);

    setIncludeTagsFilter(includeTags);
    setExcludeTagsFilter(excludeTags);
    setIncludeStringFilter(includeString);
    setExcludeStringFilter(excludeString);

    setCapUrlsPerAccountFilter(capUrlsPerAccount);
    setLicensesFilter(licenses);
    setSalesFilter(sales);
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
      licensesFilter,
      salesFilter,
      capUrlsPerAccountFilter,
      tagData,
      urlData,
    );
  }, [
    includeTagsFilter,
    excludeTagsFilter,
    includeStringFilter,
    excludeStringFilter,
    licensesFilter,
    capUrlsPerAccountFilter,
    salesFilter,
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

        <div className="advanced__check-group">
          Filter by license:
          <div className="advanced__check-flex">
            {licenseData
              .sort((a, b) => (a.name.length > b.name.length ? -1 : 1))
              .map((license) => {
                const checked = licenses.has(license.bc_id);
                return (
                  <label
                    key={license.bc_id}
                    className="input-label input-label__check"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        sharedSetLicenses(license.bc_id, e.target.checked);
                      }}
                    />
                    {license.name}
                  </label>
                );
              })}
          </div>
        </div>

        <div className="advanced__check-group">
          Filter by sales:
          <div className="advanced__check-flex">
            <label className="input-label input-label__check">
              <input
                type="checkbox"
                checked={sales.has(SALES_NONE)}
                onChange={(e) => sharedSetSales(SALES_NONE, e.target.checked)}
              />
              No sales
            </label>
            <label className="input-label input-label__check">
              <input
                type="checkbox"
                checked={sales.has(SALES_SOME)}
                onChange={(e) => sharedSetSales(SALES_SOME, e.target.checked)}
              />
              Some sales
            </label>
            <label className="input-label input-label__check">
              <input
                type="checkbox"
                checked={sales.has(SALES_MANY)}
                onChange={(e) => sharedSetSales(SALES_MANY, e.target.checked)}
              />
              More sales
            </label>
          </div>
        </div>

        <div className="advanced__check-group">
          Other:
          <label className="input-label input-label__check">
            <input
              type="checkbox"
              checked={capUrlsPerAccount}
              onChange={(e) => {
                setCapUrlsPerAccount(e.target.checked);
              }}
            />
            Cap listings ({URL_CAP} per account)
          </label>
        </div>

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
