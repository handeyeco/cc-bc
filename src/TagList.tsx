import { useState } from "react";
import tagData from "./data/tags";

import "./TagList.css";
import { License } from "./types";

type Props = {
  onSelectTag: (tag: number) => void;
  onSelectLicense: (licenseUrl: string) => void;
  onSelectFaves: () => void;
  licenses: License[];
};

const LOW_COUNT = 5;

export default function TagList(props: Props) {
  const { onSelectTag, onSelectLicense, onSelectFaves, licenses } = props;
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
        <button onClick={onSelectFaves} className="tag-list__fave">
          ★ Faves
        </button>
      </div>

      <div>
        {licenses.map((l) => (
          <button
            key={l.text}
            onClick={() => onSelectLicense(l.url)}
            className="tag-list__license"
          >
            {l.text} <span className="tag-list__count">{l.count}</span>
          </button>
        ))}
      </div>

      <div>
        {filteredTags.map((t) => (
          <button
            key={t.name}
            onClick={() => onSelectTag(t.tag_id)}
            className="tag-list__tag"
          >
            {t.name} <span className="tag-list__count">{t.count}</span>
          </button>
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
