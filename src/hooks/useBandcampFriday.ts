import { useEffect, useState } from "react";

const PACIFIC = "America/Los_Angeles";

const BANDCAMP_FRIDAYS = [
  "2026-03-06",
  "2026-05-01",
  "2026-08-07",
  "2026-09-04",
  "2026-10-02",
  "2026-11-06",
  "2026-12-04",
];

type BandcampFridayState = {
  isBandcampFriday: boolean;
  isCloseToBandcampFriday: boolean;
  nextBandcampFriday: string | null;
};

function getPacificDateISO() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PACIFIC,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;

  return `${y}-${m}-${d}`;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);

  const date = new Date(y, m - 1, d);

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function daysBetween(a: string, b: string) {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.floor((db - da) / 86400000);
}

function computeBandcampFriday(): BandcampFridayState {
  const today = getPacificDateISO();

  const isBandcampFriday = BANDCAMP_FRIDAYS.includes(today);

  const next = BANDCAMP_FRIDAYS.find((d) => d >= today) ?? null;

  const isCloseToBandcampFriday =
    next !== null && daysBetween(today, next) <= 7;

  return {
    isBandcampFriday,
    isCloseToBandcampFriday,
    nextBandcampFriday: next ? formatDate(next) : null,
  };
}

export function useBandcampFriday(): BandcampFridayState {
  const [state, setState] = useState(() => computeBandcampFriday());

  useEffect(() => {
    const interval = setInterval(() => {
      setState(computeBandcampFriday());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return state;
}
