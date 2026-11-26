import { useEffect, useState } from "react";
import type { WeatherReport, WeatherResultsProps } from "../types.ts";
import { getWeatherReport } from "../api.ts";
import { WeatherTable } from "./WeatherTable.tsx";

export function WeatherResults({
  path,
  location,
  imperial,
}: WeatherResultsProps) {
  const [report, setReport] = useState<WeatherReport>();
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getWeatherReport(path, controller.signal)
      .then(setReport)
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });

    return () => controller.abort();
  }, [path, attempt]);

  if (report) {
    return (
      <WeatherTable location={location} report={report} imperial={imperial} />
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-white p-5 text-sm">
        <p role="alert" className="text-red-700">
          Az időjárási adatokat nem sikerült betölteni.
        </p>
        <button
          type="button"
          className="mt-2 font-medium text-blue-800 underline"
          onClick={() => {
            setError(false);
            setAttempt((previous) => previous + 1);
          }}
        >
          Próbáld újra
        </button>
      </div>
    );
  }

  return (
    <p role="status" className="px-5 text-sm text-slate-600">
      Betöltés…
    </p>
  );
}
