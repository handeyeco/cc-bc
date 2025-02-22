import { useMemo } from "react";
import { Link } from "react-router-dom";

import { PlayerData, UrlListing } from "./types";
import tagData from "./data/tags";

import "./UrlList.css";
import useQuery from "./hooks/useQuery";
import {
  getLicenseDescription,
  licenseTextToUrl,
  licenseUrlToText,
} from "./util/licenses";

type Props = {
  urls: ReadonlyArray<UrlListing>;
  loadPlayer: (data: PlayerData) => void;
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

export default function UrlList(props: Props) {
  const { urls, loadPlayer } = props;
  const query = useQuery();

  const selectedLicense = query.get("license");
  const selectedTag = query.get("tag");
  const showingFaves = !!query.get("faves");

  const stringJSON = JSON.stringify(urls);
  const shuffledUrls = useMemo<UrlListing[]>(() => {
    const urlCopy = JSON.parse(stringJSON);
    shuffle(urlCopy);
    return urlCopy;
  }, [stringJSON]);

  const hasResults = urls.length !== 0;

  return (
    <div>
      <Link to="/" className="link-button url-list__back">
        ← Tag List
      </Link>

      {!hasResults && (
        <p className="url-list__not-found">
          <b>Nothing found, how did you get here?</b>
        </p>
      )}

      {hasResults && selectedLicense && (
        <div className="url-list__license-details">
          License details
          {getLicenseDescription(selectedLicense).map((e) => (
            <p key={e}>{e}</p>
          ))}
          <a href={licenseTextToUrl(selectedLicense)} target="_blank">
            Link to license
          </a>
        </div>
      )}
      {hasResults && showingFaves && (
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
                <Link
                  key={u.title + "_" + name + "_" + i}
                  to={`/list?tag=${t}`}
                  className={
                    "link-button url-list__tag" +
                    (tag?.tag_id === +(selectedTag || -1)
                      ? " url-list__tag--active"
                      : "")
                  }
                >
                  {name}
                </Link>
              );
            })}
          </div>
          <div>
            <Link
              key={u.title + "_" + u.license_url}
              to={`/list?license=${licenseUrlToText(u.license_url)}`}
              className={
                "link-button url-list__license" +
                (licenseUrlToText(u.license_url) === selectedLicense
                  ? " url-list__license--active"
                  : "")
              }
            >
              {licenseUrlToText(u.license_url)}
            </Link>
          </div>
          <button
            className={`url-list__listen ${
              u.favorite ? "url-list__listen--fave" : ""
            }`}
            onClick={() => {
              const data = {
                title: u.title,
                url: u.url,
                bc_id: u.bc_id,
              };

              loadPlayer(data);
            }}
          >
            Listen
          </button>
        </div>
      ))}
    </div>
  );
}
