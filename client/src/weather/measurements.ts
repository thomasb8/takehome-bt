import type { DailyWeather } from "./types.ts";

export const columns = [
  { key: "minTemperature", label: "Minimum", unit: "temperature" },
  { key: "maxTemperature", label: "Maximum", unit: "temperature" },
  { key: "averageTemperature", label: "Átlaghőmérséklet", unit: "temperature" },
  { key: "precipitation", label: "Csapadék", unit: "precipitation" },
] as const;

const numberFormat = new Intl.NumberFormat("hu-HU", {
  maximumFractionDigits: 2,
});
const inchFormat = new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 3 });

function summarize(values: (number | null)[], formatter: Intl.NumberFormat) {
  const sorted = values.filter((value) => value !== null).sort((a, b) => a - b);
  if (sorted.length === 0) {
    return { median: null, modes: [] };
  }

  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];

  // Count values at the precision shown in the table.
  const frequencies = new Map<string, number>();
  let mostFrequent = 1;
  for (const value of sorted) {
    const label = formatter.format(value === 0 ? 0 : value);
    const count = (frequencies.get(label) ?? 0) + 1;
    frequencies.set(label, count);
    mostFrequent = Math.max(mostFrequent, count);
  }

  const modes =
    mostFrequent > 1
      ? [...frequencies]
          .filter(([, count]) => count === mostFrequent)
          .map(([value]) => value)
      : [];

  return { median, modes };
}

export function formatMeasurement(value: number | null, unit: string) {
  const formatter = unit === "in" ? inchFormat : numberFormat;
  return value === null ? "—" : `${formatter.format(value)} ${unit}`;
}

export function prepareWeatherTable(
  dailyWeather: DailyWeather[],
  imperial: boolean,
) {
  const temperature = (value: number | null) =>
    imperial && value !== null ? (value * 9) / 5 + 32 : value;

  const rows = dailyWeather.map(
    ({ date, minTemperature, maxTemperature, precipitation }) => {
      const averageTemperature =
        minTemperature === null || maxTemperature === null
          ? null
          : (minTemperature + maxTemperature) / 2;

      return {
        date,
        minTemperature: temperature(minTemperature),
        maxTemperature: temperature(maxTemperature),
        averageTemperature: temperature(averageTemperature),
        precipitation:
          imperial && precipitation !== null
            ? precipitation / 25.4
            : precipitation,
      };
    },
  );

  return {
    rows,
    summaries: columns.map(({ key, unit }) =>
      summarize(
        rows.map((row) => row[key]),
        imperial && unit === "precipitation" ? inchFormat : numberFormat,
      ),
    ),
  };
}
