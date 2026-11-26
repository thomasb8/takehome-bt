import type { WeatherSearch } from "./types.ts";

export const defaultStartDate = "2023-12-25";
export const defaultEndDate = "2023-12-31";

function readDate(value: unknown): string | undefined {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value.startsWith("0000")
  ) {
    return;
  }

  const date = new Date(value);
  if (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  ) {
    return value;
  }
}

export function validateWeatherSearch(
  search: Record<string, unknown>,
): WeatherSearch {
  const cityId =
    typeof search.cityId === "string" && /^\d+$/.test(search.cityId)
      ? Number(search.cityId)
      : search.cityId;
  const region = typeof search.region === "string" ? search.region.trim() : "";

  return {
    mode:
      search.mode === "region" || search.mode === "city"
        ? search.mode
        : undefined,
    cityId:
      typeof cityId === "number" &&
      Number.isInteger(cityId) &&
      cityId > 0 &&
      cityId <= 2147483647
        ? cityId
        : undefined,
    region: region || undefined,
    startDate: readDate(search.startDate),
    endDate: readDate(search.endDate),
    units:
      search.units === "imperial" || search.units === "metric"
        ? search.units
        : undefined,
  };
}
