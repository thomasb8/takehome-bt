export type Mode = "city" | "region";
export type Units = "metric" | "imperial";

export type WeatherSearch = {
  mode?: Mode;
  cityId?: number;
  region?: string;
  startDate?: string;
  endDate?: string;
  units?: Units;
};

export type WeatherOptions = {
  cities: { id: number; name: string; region: string }[];
  regions: string[];
};

export type DailyWeather = {
  date: string;
  minTemperature: number | null;
  maxTemperature: number | null;
  precipitation: number | null;
};

export type WeatherReport = {
  rows: DailyWeather[];
  units: { temperature: string; precipitation: string };
};

export type WeatherTableProps = {
  location: string;
  report: WeatherReport;
  imperial: boolean;
};

export type WeatherResultsProps = Pick<
  WeatherTableProps,
  "location" | "imperial"
> & {
  path: string;
};
