import { useQuery } from "@tanstack/react-query";
import { License } from "../types";

async function fetchLicenses(): Promise<License[]> {
  return fetch("/cc-bc/licenses.json").then((res) => res.json());
}

export default function useLicenses() {
  return useQuery({
    queryKey: ["licenses"],
    queryFn: fetchLicenses,
  });
}
