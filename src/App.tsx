import { useState, useEffect } from "react";

import tagData from "./data/tags";
import urlData from "./data/urls";
import TagList from "./TagList";
import UrlList from "./UrlList";

import "./App.css";

const licenseReg = /licenses\/([A-Za-z-]+)\/([0-9.]+)/;
const licenses = Object.entries(
  urlData.reduce((acc: Record<string, number>, curr) => {
    if (acc[curr.license_url]) {
      acc[curr.license_url] = acc[curr.license_url] + 1;
    } else {
      acc[curr.license_url] = 1;
    }
    return acc;
  }, {})
)
  .map(([url, count]) => {
    const match = url.match(licenseReg);
    const text = match ? match[1] : "";
    return { url, text, count };
  })
  .sort((a, b) => b.count - a.count);

function App() {
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);

  useEffect(() => {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }, [selectedTag, selectedLicense]);

  function setBothStates(tag: number | null, license: string | null) {
    setSelectedTag(tag);
    setSelectedLicense(license);
  }

  const filteredUrls = urlData.filter((u) => {
    if (selectedTag == null && selectedLicense == null) return true;

    if (selectedTag != null) return u.tags.includes(selectedTag);

    if (selectedLicense != null) return u.license_url === selectedLicense;
  });

  const showList = selectedTag != null || selectedLicense != null;

  function randomPageText() {
    const defaultText = "Random cc-bc album";
    if (urlData.length === filteredUrls.length) return defaultText;
    if (selectedTag != null) {
      const tag = tagData.find((t) => t.tag_id === selectedTag);
      return tag ? `Random "${tag.name}" album` : defaultText;
    }
    if (selectedLicense != null) {
      const lic = licenses.find((l) => l.url === selectedLicense);
      return lic ? `Random "${lic.text}" album` : defaultText;
    }
  }

  function randomPage() {
    const listing =
      filteredUrls[Math.floor(Math.random() * filteredUrls.length)];
    open(listing.url, "_blank");
  }

  return (
    <div className="main-container">
      <h1>cc-bc</h1>
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

      {!showList && (
        <TagList
          licenses={licenses}
          onSelectTag={(tag) => setBothStates(tag, null)}
          onSelectLicense={(lic) => setBothStates(null, lic)}
        />
      )}

      {showList && (
        <UrlList
          urls={filteredUrls}
          licenses={licenses}
          selectedTag={selectedTag}
          selectedLicense={selectedLicense}
          setSelectedTag={(tag) => setBothStates(tag, null)}
          onSelectLicense={(lic) => setBothStates(null, lic)}
          onClickBack={() => setBothStates(null, null)}
        />
      )}
    </div>
  );
}

export default App;
