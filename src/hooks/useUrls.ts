import { useQuery } from "@tanstack/react-query";
import { UrlListing } from "../types";

async function fetchUrls(): Promise<UrlListing[]> {
  return fetch("/cc-bc/urls.json").then((res) => res.json());
}

export default function useUrls() {
  return useQuery({
    queryKey: ["urls"],
    queryFn: fetchUrls,
  });
}
