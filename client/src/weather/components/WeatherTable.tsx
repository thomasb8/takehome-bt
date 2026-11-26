import { useMemo, useState } from "react";
import type { WeatherTableProps } from "../types.ts";
import {
  columns,
  formatMeasurement,
  prepareWeatherTable,
} from "../measurements.ts";

const pageSize = 31;

export function WeatherTable({
  location,
  report,
  imperial,
}: WeatherTableProps) {
  const [page, setPage] = useState(0);
  const units = imperial
    ? { temperature: "°F", precipitation: "in" }
    : report.units;
  const { rows, summaries } = useMemo(
    () => prepareWeatherTable(report.rows, imperial),
    [report.rows, imperial],
  );

  const pageCount = Math.ceil(rows.length / pageSize);
  const pageStart = page * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, rows.length);
  const pageButton =
    "rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-900 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-40";

  return (
    <section
      aria-labelledby="weather-results"
      className="rounded-2xl border border-blue-100 bg-white"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 p-5 sm:px-6">
        <h2 id="weather-results" className="text-xl font-semibold">
          {location}
        </h2>
        {rows.length > 0 && (
          <p className="text-sm text-slate-600">{rows.length} nap</p>
        )}
      </div>
      {rows.length === 0 ? (
        <p role="status" className="px-5 pb-5 text-sm text-slate-600 sm:px-6">
          Erre az időszakra nincs időjárási adat.
        </p>
      ) : (
        <>
          <div
            role="region"
            aria-labelledby="weather-results"
            tabIndex={0}
            className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-blue-600"
          >
            <table className="w-full border-collapse text-left text-sm tabular-nums">
              <thead className="bg-blue-50 text-blue-950">
                <tr>
                  <th scope="col" className="px-4 py-3 sm:pl-6">
                    Dátum
                  </th>
                  {columns.map(({ key, label }) => (
                    <th key={key} scope="col" className="px-4 py-3 text-right">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(pageStart, pageEnd).map((row) => (
                  <tr
                    key={row.date}
                    className="border-t border-slate-100 even:bg-slate-50"
                  >
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-medium whitespace-nowrap sm:pl-6"
                    >
                      <time dateTime={row.date}>{row.date}</time>
                    </th>
                    {columns.map(({ key, unit }) => (
                      <td
                        key={key}
                        className="px-4 py-2.5 text-right whitespace-nowrap"
                      >
                        {formatMeasurement(row[key], units[unit])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-blue-100 bg-blue-50/70 font-medium text-blue-950">
                <tr>
                  <th scope="row" className="px-4 py-2.5 sm:pl-6">
                    Medián
                  </th>
                  {columns.map(({ key, unit }, index) => (
                    <td
                      key={key}
                      className="px-4 py-2.5 text-right whitespace-nowrap"
                    >
                      {formatMeasurement(summaries[index].median, units[unit])}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="px-4 py-2.5 sm:pl-6">
                    Módusz
                  </th>
                  {columns.map(({ key, unit }, index) => (
                    <td key={key} className="px-4 py-2.5 text-right">
                      {summaries[index].modes
                        .map((value) => `${value}\u00a0${units[unit]}`)
                        .join(", ") || "—"}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          {pageCount > 1 && (
            <div className="flex items-center justify-between gap-2 p-4 sm:px-6">
              <p role="status" className="text-sm text-slate-600">
                {pageStart + 1}–{pageEnd} / {rows.length} nap
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={pageButton}
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Előző
                </button>
                <button
                  type="button"
                  className={pageButton}
                  onClick={() => setPage(page + 1)}
                  disabled={page === pageCount - 1}
                >
                  Következő
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
