import { Switch, Route, Link, useLocation } from "react-router-dom";

import TagList from "./TagList";
import UrlList from "./UrlList";

import useQueryString from "./hooks/useQueryString";
import {
  collapseUrls,
  filterUrlsByFaves,
  filterUrlsByLicense,
  filterUrlsByTag,
} from "./util/url-filters";
import { PlayerData, UrlListing } from "./types";
import { useEffect, useMemo, useState } from "react";
import { getLicenseNameByBcId } from "./util/licenses";
import Advanced from "./Advanced";

import "./App.css";
import useUrls from "./hooks/useUrls";
import useLicenses from "./hooks/useLicenses";
import useTags from "./hooks/useTags";

function App() {
  const [playerData, setPlayerData] = useState<PlayerData>();
  const query = useQueryString();
  const { search } = useLocation();

  const { data: urlData, isPending: loadingUrls, error: urlsError } = useUrls();
  const { data: tagData, isPending: loadingTags, error: tagsError } = useTags();
  const {
    data: licenseData,
    isPending: loadingLicenses,
    error: licensesError,
  } = useLicenses();

  useEffect(() => {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }, [search]);

  const urlsLoaded = !loadingUrls && !urlsError;
  const tagsLoaded = !loadingTags && !tagsError;
  const licensesLoaded = !loadingLicenses && !licensesError;
  const allLoaded = urlsLoaded && tagsLoaded && licensesLoaded;
  const someError = urlsError || tagsError || licensesError;

  const licenseQuery = query.get("license");
  const selectedLicense = licenseQuery ? +licenseQuery : null;
  const selectedTag = query.get("tag");
  const showingFaves = !!query.get("faves");

  // for the list
  const filteredUrls: ReadonlyArray<UrlListing> = useMemo(() => {
    if (!allLoaded) {
      return [];
    }
    let filtered: ReadonlyArray<UrlListing> = urlData;
    if (selectedLicense) {
      filtered = filterUrlsByLicense(selectedLicense, filtered);
    }
    if (selectedTag) {
      filtered = filterUrlsByTag(+selectedTag, filtered);
    }
    if (showingFaves) {
      filtered = filterUrlsByFaves(filtered);
    }
    return filtered;
  }, [allLoaded, urlData, selectedLicense, selectedTag, showingFaves]);

  // for the random button
  const collapsedUrls: ReadonlyArray<UrlListing> = useMemo(
    () => collapseUrls(filteredUrls),
    [filteredUrls],
  );

  function randomPageText() {
    const defaultText = "Random cc-bc album";
    if (!allLoaded) {
      return "Loading stuff...";
    }
    if (urlData.length === filteredUrls.length) return defaultText;
    if (selectedTag != null) {
      const tag = tagData.find((t) => t.tag_id === +selectedTag);
      return tag ? `Random "${tag.name}" album` : defaultText;
    }
    if (selectedLicense != null) {
      return `Random "${getLicenseNameByBcId(selectedLicense, licenseData)}" album`;
    }
    if (showingFaves) {
      return "Random favorite album";
    }
  }

  function randomPage() {
    const listing =
      collapsedUrls[Math.floor(Math.random() * collapsedUrls.length)];
    open(listing.url, "_blank");
  }

  return (
    <div className="main-container">
      <Link to="/" className="header-link">
        <h1>cc-bc</h1>
      </Link>
      <p className="app__about">
        Some{" "}
        <a href="https://creativecommons.org/" target="_blank">
          Creative Commons
        </a>{" "}
        music on{" "}
        <a href="https://bandcamp.com/" target="_blank">
          Bandcamp
        </a>
      </p>
      <button
        onClick={randomPage}
        className="app__random-button"
        disabled={!allLoaded}
      >
        {randomPageText()}
      </button>

      <Switch>
        <Route exact path="/">
          {tagsLoaded ? (
            <TagList />
          ) : tagsError ? (
            <p>Error loading tags (sorry)</p>
          ) : (
            <p>Loading too much stuff...</p>
          )}
        </Route>
        <Route path="/list">
          {allLoaded ? (
            <UrlList loadPlayer={setPlayerData} />
          ) : someError ? (
            <p>Error loading data (sorry)</p>
          ) : (
            <p>Loading too much stuff...</p>
          )}
        </Route>
        <Route path="/advanced">
          {allLoaded ? (
            <Advanced />
          ) : someError ? (
            <p>Error loading data (sorry)</p>
          ) : (
            <p>Loading too much stuff...</p>
          )}
        </Route>
      </Switch>

      {playerData?.bc_id && (
        <div className="sticky-player">
          <iframe
            src={`https://bandcamp.com/EmbeddedPlayer/album=${playerData.bc_id}/size=small/bgcol=ffffff/linkcol=ffb300/transparent=true/`}
            seamless
          >
            <a href={playerData.url}>{playerData.title}</a>
          </iframe>
        </div>
      )}

      {allLoaded && (
        <footer>
          🍹{" "}
          <a href="https://github.com/handeyeco/cc-bc" target="_blank">
            Source code and data
          </a>
          .
          {!!urlData?.length && (
            <span> Now up to {urlData.length.toLocaleString()} albums!</span>
          )}
        </footer>
      )}
    </div>
  );
}

export default App;
