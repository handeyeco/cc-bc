import urlData from "../data/urls";

const licenseReg = /licenses\/([A-Za-z-]+)\/([0-9.]+)/;
export const licenses = Object.entries(
  urlData.reduce((acc: Record<string, number>, curr) => {
    if (acc[curr.license_url]) {
      acc[curr.license_url] = acc[curr.license_url] + 1;
    } else {
      acc[curr.license_url] = 1;
    }
    return acc;
  }, {})
)
  .map(([url, count]) => {
    const match = url.match(licenseReg);
    const text = match ? match[1] : "";
    return { url, text, count };
  })
  .sort((a, b) => b.count - a.count);

const licenseExplanations: Record<string, string> = {
  by: "requires attribution",
  nc: "no commercial use",
  nd: "no derivatives",
  sa: "share-alike",
};
export function getLicenseDescription(lic: string): string[] {
  return lic.split("-").map((e) => `- ${e}: ${licenseExplanations[e]}`);
}

export function licenseUrlToText(url: string): string {
  const lic = licenses.find((l) => l.url === url);
  return lic?.text || "";
}

export function licenseTextToUrl(text: string): string {
  const lic = licenses.find((l) => l.text === text);
  return lic?.url || "";
}
