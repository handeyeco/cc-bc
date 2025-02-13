import { useState } from "react";
import { Link } from "react-router-dom";
import tagData from "./data/tags";

import "./TagList.css";
import { licenses } from "./util/licenses";

const LOW_COUNT = 5;

export default function TagList() {
  const [search, setSearch] = useState<string>("");
  const [filterLowCount, setFilterLowCount] = useState<boolean>(true);

  const filteredTags = tagData.filter((t) => {
    if (filterLowCount && t.count <= LOW_COUNT) return false;
    if (!search) return true;
    return t.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="tag-list">
      <div>
        <label className="tag-list_input-label">
          Filter tags
          <input value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      <div>
        <Link to="/list?faves=true" className="link-button tag-list__fave">
          ★ Faves
        </Link>
      </div>

      <div>
        {licenses.map((l) => (
          <Link
            key={l.text}
            to={`/list?license=${l.text}`}
            className="link-button tag-list__license"
          >
            {l.text} <span className="tag-list__count">{l.count}</span>
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
            className="tag-list__show-more"
          >
            Show more
          </button>
        )}
      </div>
    </div>
  );
}
