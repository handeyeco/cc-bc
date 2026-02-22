import { License } from "../types";

const licenseExplanations: Record<string, string> = {
  by: "requires attribution",
  nc: "no commercial use",
  nd: "no derivatives",
  sa: "share-alike",
};
export function getLicenseDescriptionByBcId(
  bc_id: number,
  licenses: ReadonlyArray<License>,
): string[] {
  const name = getLicenseNameByBcId(bc_id, licenses);
  return name?.split("-").map((e) => `- ${e}: ${licenseExplanations[e]}`) || [];
}

export function getLicenseNameByBcId(
  bc_id: number,
  licenses: ReadonlyArray<License>,
): string | undefined {
  return licenses.find((e) => e.bc_id === bc_id)?.name;
}

export function getLicenseUrlByBcId(
  bc_id: number,
  licenses: ReadonlyArray<License>,
): string | undefined {
  return licenses.find((e) => e.bc_id === bc_id)?.url;
}
