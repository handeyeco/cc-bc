import { Switch, Route, Link, useLocation } from "react-router-dom";

import TagList from "./TagList";
import UrlList from "./UrlList";

import useQuery from "./hooks/useQuery";
import {
  filterUrlsByFaves,
  filterUrlsByLicense,
  filterUrlsByTag,
} from "./util/url-filters";
import { LoadingState, PlayerData, TagListing, UrlListing } from "./types";
import { useEffect, useState } from "react";
import { getLicenseNameByBcId } from "./util/licenses";
import Advanced from "./Advanced";

import "./App.css";

function App() {
  const [playerData, setPlayerData] = useState<PlayerData>();
  const query = useQuery();
  const { search } = useLocation();

  const [loadingTags, setLoadingTags] = useState<LoadingState>("not-started");
  const [tagData, setTagData] = useState<ReadonlyArray<TagListing>>([]);
  const [loadingUrls, setLoadingUrls] = useState<LoadingState>("not-started");
  const [urlData, setUrlData] = useState<ReadonlyArray<UrlListing>>([]);

  useEffect(() => {
    if (loadingTags === "not-started") {
      setLoadingTags("loading");
      fetch("/cc-bc/tags.json")
        .then((res) => res.json())
        .then((data) => setTagData(data))
        .then(() => setLoadingTags("loaded"))
        .catch(() => setLoadingTags("error"));
    }
  }, [loadingTags]);

  useEffect(() => {
    if (loadingUrls === "not-started") {
      setLoadingUrls("loading");
      fetch("/cc-bc/urls.json")
        .then((res) => res.json())
        .then((data) => setUrlData(data))
        .then(() => setLoadingUrls("loaded"))
        .catch(() => setLoadingUrls("error"));
    }
  }, [loadingUrls]);

  useEffect(() => {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }, [search]);

  const licenseQuery = query.get("license");
  const selectedLicense = licenseQuery ? +licenseQuery : null;
  const selectedTag = query.get("tag");
  const showingFaves = !!query.get("faves");

  let filteredUrls: ReadonlyArray<UrlListing> = urlData;
  if (selectedLicense) {
    filteredUrls = filterUrlsByLicense(selectedLicense, filteredUrls);
  }
  if (selectedTag) {
    filteredUrls = filterUrlsByTag(+selectedTag, filteredUrls);
  }
  if (showingFaves) {
    filteredUrls = filterUrlsByFaves(filteredUrls);
  }

  function randomPageText() {
    const defaultText = "Random cc-bc album";
    if (loadingUrls !== "loaded") {
      return "Loading stuff...";
    }
    if (urlData.length === filteredUrls.length) return defaultText;
    if (selectedTag != null) {
      const tag = tagData.find((t) => t.tag_id === +selectedTag);
      return tag ? `Random "${tag.name}" album` : defaultText;
    }
    if (selectedLicense != null) {
      return `Random "${getLicenseNameByBcId(selectedLicense)}" album`;
    }
    if (showingFaves) {
      return "Random favorite album";
    }
  }

  function randomPage() {
    const listing =
      filteredUrls[Math.floor(Math.random() * filteredUrls.length)];
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
        disabled={loadingUrls !== "loaded"}
      >
        {randomPageText()}
      </button>

      <Switch>
        <Route exact path="/">
          {loadingTags === "loaded" ? (
            <TagList tags={tagData} />
          ) : loadingTags === "error" ? (
            <p>Error loading tags (sorry)</p>
          ) : (
            <p>Loading tags...</p>
          )}
        </Route>
        <Route path="/list">
          {loadingTags === "loaded" && loadingUrls === "loaded" ? (
            <UrlList
              tags={tagData}
              urls={filteredUrls}
              loadPlayer={setPlayerData}
            />
          ) : loadingTags === "error" || loadingUrls === "error" ? (
            <p>Error loading data (sorry)</p>
          ) : (
            <p>Loading too much stuff...</p>
          )}
        </Route>
        <Route path="/advanced">
          {loadingTags === "loaded" && loadingUrls === "loaded" ? (
            <Advanced tags={tagData} urls={filteredUrls} />
          ) : loadingTags === "error" || loadingUrls === "error" ? (
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

      {loadingTags === "loaded" && loadingUrls === "loaded" && (
        <footer>
          🍹{" "}
          <a href="https://github.com/handeyeco/cc-bc" target="_blank">
            Source code and data
          </a>
        </footer>
      )}
    </div>
  );
}

export default App;
