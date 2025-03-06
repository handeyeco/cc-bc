import { TagListing } from "../types";

const _tagNameMemo: Record<string, TagListing> = {};
export function getTagByNameMemo(
  tags: ReadonlyArray<TagListing>,
  name: string
): TagListing | undefined {
  if (_tagNameMemo[name]) return _tagNameMemo[name];

  const tag = tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase());

  if (tag) {
    _tagNameMemo[name] = tag;
  }

  return tag;
}

const _tagIdMemo: Record<string, TagListing> = {};
export function getTagByIdMemo(
  tags: ReadonlyArray<TagListing>,
  id: number
): TagListing | undefined {
  const strId = String(id);
  if (_tagIdMemo[strId]) return _tagIdMemo[strId];

  const tag = tags.find((tag) => tag.tag_id === id);

  if (tag) {
    _tagIdMemo[strId] = tag;
  }

  return tag;
}
