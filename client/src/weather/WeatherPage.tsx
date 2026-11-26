import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { WeatherOptions, WeatherSearch } from "./types.ts";
import { getWeatherOptions, weatherReportPath } from "./api.ts";
import { WeatherResults } from "./components/WeatherResults.tsx";
import { defaultStartDate, defaultEndDate } from "./search.ts";

const route = getRouteApi("/");
const inputClass =
  "min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-2 focus:outline-blue-600";

export function WeatherPage() {
  const {
    mode = "city",
    cityId,
    region,
    startDate,
    endDate,
    units = "metric",
  } = route.useSearch();
  const navigate = route.useNavigate();
  const [options, setOptions] = useState<WeatherOptions>();
  const [optionsError, setOptionsError] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getWeatherOptions(controller.signal)
      .then(setOptions)
      .catch(() => {
        if (!controller.signal.aborted) {
          setOptionsError(true);
        }
      });

    return () => controller.abort();
  }, []);

  const locations =
    mode === "city"
      ? options?.cities.map(({ id, name, region }) => ({
          value: String(id),
          label: `${name} – ${region}`,
          name,
        }))
      : options?.regions.map((region) => ({
          value: region,
          label: region,
          name: region,
        }));

  const requestedLocation = mode === "city" ? cityId?.toString() : region;
  const selectedLocation = locations?.find(
    ({ value }) => value === requestedLocation,
  );
  const invalidRange = startDate && endDate && startDate > endDate;
  const reportPath =
    selectedLocation && startDate && endDate && !invalidRange
      ? weatherReportPath(mode, selectedLocation.value, startDate, endDate)
      : undefined;

  function updateSearch(search: Partial<WeatherSearch>) {
    void navigate({
      search: (previous) => ({ ...previous, ...search }),
      resetScroll: false,
    });
  }

  function loadWeather(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const location = locations?.find(
      ({ value }) => value === form.get("location"),
    );
    if (!location) {
      return;
    }

    const startDate = String(form.get("startDate"));
    const endDate = String(form.get("endDate"));
    if (startDate > endDate) {
      setError("A záródátum nem lehet korábbi a kezdődátumnál.");
      return;
    }

    setError("");
    updateSearch({
      mode,
      ...(mode === "city"
        ? { cityId: Number(location.value) }
        : { region: location.value }),
      startDate,
      endDate,
      units,
    });
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-sky-100 to-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-2xl bg-linear-to-r from-blue-950 to-blue-700 px-6 py-8 text-white sm:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Időjárási adatok
          </h1>
        </header>

        <section
          aria-label="Időjárási szűrők"
          className="rounded-2xl border border-blue-100 bg-white p-5 sm:p-6"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div
              aria-label="Területtípus"
              role="group"
              className="inline-flex gap-1 rounded-xl bg-blue-50 p-1"
            >
              {(["city", "region"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  onClick={() => {
                    setError("");
                    if (value !== mode) updateSearch({ mode: value });
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-600 aria-pressed:bg-blue-800 aria-pressed:text-white"
                >
                  {value === "city" ? "Város" : "Régió"}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              Mértékegység
              <select
                name="units"
                value={units}
                onChange={(event) =>
                  updateSearch({
                    units:
                      event.target.value === "imperial" ? "imperial" : "metric",
                  })
                }
                className="min-h-10 rounded-lg border border-slate-300 bg-white px-2 focus:outline-2 focus:outline-blue-600"
              >
                <option value="metric">°C / mm</option>
                <option value="imperial">°F / in</option>
              </select>
            </label>
          </div>

          <form onSubmit={loadWeather} onChange={() => setError("")}>
            <fieldset
              disabled={!locations?.length}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
            >
              <label className="block min-w-0">
                <span className="mb-1.5 block text-sm font-medium">
                  {mode === "city" ? "Város" : "Régió"}
                </span>
                <select
                  key={JSON.stringify([
                    mode,
                    selectedLocation?.value,
                    !!locations?.length,
                  ])}
                  name="location"
                  defaultValue={selectedLocation?.value}
                  required
                  className={inputClass}
                >
                  {locations?.map(({ label, value }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-1.5 block text-sm font-medium">
                  Kezdődátum
                </span>
                <input
                  type="date"
                  name="startDate"
                  key={startDate ?? defaultStartDate}
                  defaultValue={startDate ?? defaultStartDate}
                  required
                  className={inputClass}
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-1.5 block text-sm font-medium">
                  Záródátum
                </span>
                <input
                  type="date"
                  name="endDate"
                  key={endDate ?? defaultEndDate}
                  defaultValue={endDate ?? defaultEndDate}
                  required
                  className={inputClass}
                />
              </label>
              <button
                type="submit"
                className="min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Lekérdezés
              </button>
            </fieldset>
          </form>

          {optionsError && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              A helyszíneket nem sikerült betölteni.
            </p>
          )}
          {error && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              {error}
            </p>
          )}
          {!error && invalidRange && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              A záródátum nem lehet korábbi a kezdődátumnál.
            </p>
          )}
          {options && requestedLocation && !selectedLocation && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              A megadott helyszín nem található.
            </p>
          )}
          {!options && !optionsError && (
            <p role="status" className="mt-4 text-sm text-slate-600">
              Betöltés…
            </p>
          )}
        </section>

        {reportPath && selectedLocation && (
          <WeatherResults
            key={reportPath}
            path={reportPath}
            location={selectedLocation.name}
            imperial={units === "imperial"}
          />
        )}
      </div>
    </main>
  );
}
