import urlData from "../data/urls";

const bandcampLicenseMap = {
  "by-nc-nd": {
    name: "by-nc-nd",
    url: "http://creativecommons.org/licenses/by-nc-nd/3.0/",
    bc_id: 2,
  },
  "by-nc-sa": {
    name: "by-nc-sa",
    url: "http://creativecommons.org/licenses/by-nc-sa/3.0/",
    bc_id: 3,
  },
  "by-nc": {
    name: "by-nc",
    url: "https://creativecommons.org/licenses/by-nc/3.0/",
    bc_id: 4,
  },
  "by-nd": {
    name: "by-nd",
    url: "http://creativecommons.org/licenses/by-nd/3.0/",
    bc_id: 5,
  },
  by: {
    name: "by",
    url: "http://creativecommons.org/licenses/by/3.0/",
    bc_id: 6,
  },
  "by-sa": {
    name: "by-sa",
    url: "http://creativecommons.org/licenses/by-sa/3.0/",
    bc_id: 8,
  },
};

export const licenses = Object.entries(
  urlData.reduce((acc: Record<number, number>, curr) => {
    if (acc[curr.license]) {
      acc[curr.license] = acc[curr.license] + 1;
    } else {
      acc[curr.license] = 1;
    }
    return acc;
  }, {})
)
  .map(([bc_id, count]) => {
    const text = getLicenseNameByBcId(+bc_id);
    const url = getLicenseUrlByBcId(+bc_id);
    return { license: bc_id, url, text, count };
  })
  .sort((a, b) => b.count - a.count);

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
  return Object.values(bandcampLicenseMap).find((e) => e.bc_id === bc_id)?.name;
}

export function getLicenseUrlByBcId(bc_id: number): string | undefined {
  return Object.values(bandcampLicenseMap).find((e) => e.bc_id === bc_id)?.url;
}
