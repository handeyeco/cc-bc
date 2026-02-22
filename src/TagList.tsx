import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import "./TagList.css";
import { License, TagListing } from "./types";
import { useDebounce } from "./hooks/useDebounce";

const LOW_COUNT = 200;
const VERY_LOW_COUNT = 10;

type Props = {
  tags: ReadonlyArray<TagListing>;
  licenses: ReadonlyArray<License>;
};

/**
 * top = only show the top tags by count
 * more = show more tags, but not the very low counts
 * all = show all tags
 */
type FilterLowCountOptions = "top" | "more" | "all";

export default function TagList(props: Props) {
  const { tags } = props;
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);
  const prevSearchRef = useRef<string>("");
  const [filterLowCount, setFilterLowCount] =
    useState<FilterLowCountOptions>("top");

  useEffect(() => {
    if (debouncedSearch !== prevSearchRef.current) {
      // go from search to no search
      if (!debouncedSearch && prevSearchRef.current) {
        setFilterLowCount("top");
      }
      // go from no search to search
      else if (debouncedSearch && !prevSearchRef.current) {
        setFilterLowCount("all");
      }
    }

    prevSearchRef.current = debouncedSearch;
  }, [debouncedSearch]);

  const filteredTags = tags.filter((t) => {
    if (filterLowCount === "top" && t.count < LOW_COUNT) return false;
    if (filterLowCount === "more" && t.count < VERY_LOW_COUNT) return false;
    if (!debouncedSearch) return true;
    return t.name.toLowerCase().includes(debouncedSearch.toLowerCase());
  });

  function handleSearchSubmit(e: SyntheticEvent) {
    e.preventDefault();
    (document.activeElement as HTMLElement).blur();
  }

  return (
    <div className="tag-list">
      <div>
        <form onSubmit={handleSearchSubmit}>
          <label className="input-label">
            Filter tags
            <input value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
        </form>
      </div>

      <div>
        <Link to="/list?faves=true" className="link-button tag-list__fave">
          ★ Faves
        </Link>
      </div>

      <div>
        {props.licenses.map((l) => (
          <Link
            key={l.name}
            to={`/list?license=${l.bc_id}`}
            className="link-button tag-list__license"
          >
            {l.name} <span className="tag-list__count">{l.count}</span>
          </Link>
        ))}
      </div>

      <div>
        {filteredTags.map((t) => (
          <Link
            key={t.name}
            to={`/list?tag=${t.tag_id}`}
            className="link-button tag-list__tag"
          >
            {t.name} <span className="tag-list__count">{t.count}</span>
          </Link>
        ))}
      </div>

      <div>
        {filterLowCount !== "all" && (
          <button
            onClick={() =>
              setFilterLowCount(filterLowCount === "more" ? "all" : "more")
            }
            className="show-more-button"
          >
            Show {filterLowCount === "more" ? "all" : "more"} tags
          </button>
        )}
      </div>
    </div>
  );
}
