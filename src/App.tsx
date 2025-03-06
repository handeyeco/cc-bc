import { Switch, Route, Link, useLocation } from "react-router-dom";

import tagData from "./data/tags";
import urlData from "./data/urls";
import TagList from "./TagList";
import UrlList from "./UrlList";

import "./App.css";
import useQuery from "./hooks/useQuery";
import {
  filterUrlsByFaves,
  filterUrlsByLicense,
  filterUrlsByTag,
} from "./util/url-filters";
import { PlayerData, UrlListing } from "./types";
import { useEffect, useState } from "react";
import { getLicenseNameByBcId } from "./util/licenses";

function App() {
  const [playerData, setPlayerData] = useState<PlayerData>();
  const query = useQuery();
  const { search } = useLocation();

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
      <button onClick={randomPage} className="app__random-button">
        {randomPageText()}
      </button>

      <Switch>
        <Route exact path="/">
          <TagList />
        </Route>
        <Route path="/list">
          <UrlList urls={filteredUrls} loadPlayer={setPlayerData} />
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

      <footer>
        🍹{" "}
        <a href="https://github.com/handeyeco/cc-bc" target="_blank">
          Source code and data
        </a>
      </footer>
    </div>
  );
}

export default App;
