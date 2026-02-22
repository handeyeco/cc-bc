import { useQuery } from "@tanstack/react-query";
import { TagListing } from "../types";

async function fetchTags(): Promise<TagListing[]> {
  return fetch("/cc-bc/tags.json").then((res) => res.json());
}

export default function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });
}
