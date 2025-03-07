import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import "./TagList.css";
import licenses from "./data/licenses.json";
import { TagListing } from "./types";
import { useDebounce } from "./hooks/useDebounce";

const LOW_COUNT = 50;

type Props = {
  tags: ReadonlyArray<TagListing>;
};

export default function TagList(props: Props) {
  const { tags } = props;
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 250);
  const prevSearchRef = useRef<string>("");
  const [filterLowCount, setFilterLowCount] = useState<boolean>(true);

  useEffect(() => {
    if (debouncedSearch !== prevSearchRef.current) {
      // go from search to no search
      if (!debouncedSearch && prevSearchRef.current) {
        setFilterLowCount(true);
      }
      // go from no search to search
      else if (debouncedSearch && !prevSearchRef.current) {
        setFilterLowCount(false);
      }
    }

    prevSearchRef.current = debouncedSearch;
  }, [debouncedSearch]);

  const filteredTags = tags.filter((t) => {
    if (filterLowCount && t.count <= LOW_COUNT) return false;
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
        {licenses.map((l) => (
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
        {filterLowCount && (
          <button
            onClick={() => setFilterLowCount(false)}
            className="show-more-button"
          >
            Show all tags
          </button>
        )}
      </div>
    </div>
  );
}
