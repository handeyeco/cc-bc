import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { PlayerData, UrlListing } from "./types";
import tagData from "./data/tags";

import "./UrlList.css";
import useQuery from "./hooks/useQuery";
import {
  getLicenseDescriptionByBcId,
  getLicenseUrlByBcId,
  getLicenseNameByBcId,
} from "./util/licenses";

const LANDING_COUNT = 10;

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
  const [showAll, setShowAll] = useState<boolean>(false);

  const licenseQuery = query.get("license");
  const selectedLicense = licenseQuery ? +licenseQuery : null;
  const selectedTag = query.get("tag");
  const showingFaves = !!query.get("faves");

  const stringJSON = JSON.stringify(urls);
  const shuffledUrls = useMemo<UrlListing[]>(() => {
    setShowAll(false);
    const urlCopy = JSON.parse(stringJSON);
    shuffle(urlCopy);

    return urlCopy;
  }, [stringJSON]);

  const filteredUrls = useMemo<UrlListing[]>(() => {
    let nextUrls = shuffledUrls;

    if (!showAll) {
      nextUrls = nextUrls.slice(0, LANDING_COUNT);
    }

    return nextUrls;
  }, [shuffledUrls, showAll]);

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
          {getLicenseDescriptionByBcId(selectedLicense).map((e) => (
            <p key={e}>{e}</p>
          ))}
          <a href={getLicenseUrlByBcId(selectedLicense)} target="_blank">
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
      {filteredUrls.map((u) => (
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
              key={u.title + "_" + u.license}
              to={`/list?license=${u.license}`}
              className={
                "link-button url-list__license" +
                (u.license === selectedLicense
                  ? " url-list__license--active"
                  : "")
              }
            >
              {getLicenseNameByBcId(u.license)}
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

      <div>
        {!showAll && urls.length > LANDING_COUNT && (
          <button onClick={() => setShowAll(true)} className="show-more-button">
            Show all albums
          </button>
        )}
      </div>
    </div>
  );
}
