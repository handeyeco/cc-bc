import licenses from "../data/licenses.json";

const licenseExplanations: Record<string, string> = {
  by: "requires attribution",
  nc: "no commercial use",
  nd: "no derivatives",
  sa: "share-alike",
};
export function getLicenseDescriptionByBcId(bc_id: number): string[] {
  const name = getLicenseNameByBcId(bc_id);
  return name?.split("-").map((e) => `- ${e}: ${licenseExplanations[e]}`) || [];
}

export function getLicenseNameByBcId(bc_id: number): string | undefined {
  return licenses.find((e) => e.bc_id === bc_id)?.name;
}

export function getLicenseUrlByBcId(bc_id: number): string | undefined {
  return licenses.find((e) => e.bc_id === bc_id)?.url;
}
