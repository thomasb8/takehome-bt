<?php

declare(strict_types=1);

namespace ADS\TakeHome\Controllers;

use ADS\TakeHome\Framework\HttpRequest;
use ADS\TakeHome\Framework\JsonHttpResponse;
use ADS\TakeHome\WeatherRepository;

class WeatherController
{
    public function __construct(private readonly WeatherRepository $weather)
    {
    }

    public function getCityWeather(HttpRequest $request): JsonHttpResponse
    {
        $cityId = filter_var($request->query["cityId"] ?? null, FILTER_VALIDATE_INT, [
            "options" => ["min_range" => 1, "max_range" => 2147483647],
        ]);
        if ($cityId === false) {
            return new JsonHttpResponse(["error" => "A cityId pozitív egész szám legyen."], 400);
        }

        return $this->getWeather($request, $cityId, null);
    }

    public function getRegionWeather(HttpRequest $request): JsonHttpResponse
    {
        $region = $request->query["region"] ?? null;
        if (!is_string($region) || trim($region) === "" || preg_match('//u', $region) !== 1) {
            return new JsonHttpResponse(["error" => "A régió megnevezése kötelező."], 400);
        }

        return $this->getWeather($request, null, trim($region));
    }

    public function getOptions(): JsonHttpResponse
    {
        return new JsonHttpResponse($this->weather->getOptions());
    }

    private function getWeather(HttpRequest $request, int|null $cityId, string|null $region): JsonHttpResponse
    {
        $startDate = $this->parseDate($request->query["startDate"] ?? null);
        $endDate = $this->parseDate($request->query["endDate"] ?? null);
        if ($startDate === null || $endDate === null || $startDate > $endDate) {
            return new JsonHttpResponse([
                "error" => "A startDate és endDate érvényes, időrendben megadott ÉÉÉÉ-HH-NN dátum legyen.",
            ], 400);
        }

        $rows = $this->weather->getDailyWeather($cityId, $region, $startDate, $endDate);
        if ($rows === null) {
            return new JsonHttpResponse(["error" => "A megadott város vagy régió nem található."], 404);
        }

        return new JsonHttpResponse([
            "rows" => $rows,
            "units" => ["temperature" => "°C", "precipitation" => "mm"],
        ]);
    }

    /** @param string|list<string>|null $value */
    private function parseDate(string|array|null $value): int|null
    {
        if (!is_string($value) || preg_match('/\A([0-9]{4})-([0-9]{2})-([0-9]{2})\z/', $value, $parts) !== 1) {
            return null;
        }
        [, $year, $month, $day] = $parts;
        if (!checkdate((int) $month, (int) $day, (int) $year)) {
            return null;
        }

        return (int) ($year . $month . $day);
    }
}
