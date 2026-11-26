import type { Mode, WeatherOptions, WeatherReport } from "./types.ts";

const apiUrl =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:8080" : "/api/v1");

async function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getWeatherOptions(signal: AbortSignal) {
  return getJson<WeatherOptions>("/weather/options", signal);
}

export function getWeatherReport(path: string, signal: AbortSignal) {
  return getJson<WeatherReport>(path, signal);
}

export function weatherReportPath(
  mode: Mode,
  location: string,
  startDate: string,
  endDate: string,
) {
  const query = new URLSearchParams({
    [mode === "city" ? "cityId" : "region"]: location,
    startDate,
    endDate,
  });

  return `/weather/${mode}?${query}`;
}
