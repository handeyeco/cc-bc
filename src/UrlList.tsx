import { useMemo } from "react";
import { License, UrlListing } from "./types";
import tagData from "./data/tags";

import "./UrlList.css";

type Props = {
  onSelectTag: (tag: number) => void;
  onSelectLicense: (licenseUrl: string) => void;
  onClickBack: () => void;
  urls: ReadonlyArray<UrlListing>;
  licenses: License[];
  selectedTag: number | null;
  selectedLicense: string | null;
  showingFaves: boolean;
};

function shuffle(array: UrlListing[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

const licenseExplanations: Record<string, string> = {
  by: "requires attribution",
  nc: "no commercial use",
  nd: "no derivatives",
  sa: "share-alike",
};
function getLicenseDescription(licenses: License[], lic: string): string[] {
  const fullLic = licenses.find((l) => l.url === lic);
  if (!fullLic) return [];

  return fullLic.text
    .split("-")
    .map((e) => `- ${e}: ${licenseExplanations[e]}`);
}

export default function UrlList(props: Props) {
  const {
    onSelectTag,
    onSelectLicense,
    onClickBack,
    urls,
    licenses,
    selectedTag,
    selectedLicense,
    showingFaves,
  } = props;

  function licenseUrlToText(url: string): string {
    const lic = licenses.find((l) => l.url === url);
    return lic?.text || "";
  }

  const shuffledUrls = useMemo<UrlListing[]>(() => {
    const urlCopy = JSON.parse(JSON.stringify(urls));
    shuffle(urlCopy);
    return urlCopy;
  }, [urls]);

  return (
    <div>
      <button onClick={() => onClickBack()} className="url-list__back">
        ← Tag List
      </button>
      {selectedLicense && (
        <div className="url-list__license-details">
          License details
          {getLicenseDescription(licenses, selectedLicense).map((e) => (
            <p key={e}>{e}</p>
          ))}
          <a href={selectedLicense} target="_blank">
            Link to license
          </a>
        </div>
      )}
      {showingFaves && (
        <div className="url-list__about-me">
          <p>Just some cc-bc music I like.</p>

          <p>Thanks for checking out the site!</p>

          <p>
            <a href="https://h-e.io/" target="_blank">
              h-e.io
            </a>
          </p>
        </div>
      )}
      {shuffledUrls.map((u) => (
        <div
          key={u.url}
          className={`url-list__listing ${
            u.favorite ? "url-list__listing--fave" : ""
          }`}
        >
          <span className="url-list__star" title="Music I like">
            {u.favorite ? "★ " : ""}
          </span>
          <a href={u.url} target="_blank">
            {u.title}
          </a>
          <div className="url-list__tag-container">
            {u.tags.map((t, i) => {
              const tag = tagData.find((e) => e.tag_id === t);
              const name = tag?.name || "";
              return (
                <button
                  key={u.title + "_" + name + "_" + i}
                  className={
                    "url-list__tag" +
                    (tag?.tag_id === selectedTag
                      ? " url-list__tag--active"
                      : "")
                  }
                  onClick={() => onSelectTag(t)}
                >
                  {name}
                </button>
              );
            })}
          </div>
          <div>
            <button
              key={u.title + "_" + u.license_url}
              className={
                "url-list__license" +
                (u.license_url === selectedLicense
                  ? " url-list__license--active"
                  : "")
              }
              onClick={() => onSelectLicense(u.license_url)}
            >
              {licenseUrlToText(u.license_url)}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
