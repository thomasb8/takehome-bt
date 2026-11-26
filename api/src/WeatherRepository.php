<?php

declare(strict_types=1);

namespace ADS\TakeHome;

use ADS\TakeHome\Framework\MySQL;

class WeatherRepository
{
    public function __construct(private readonly MySQL $db)
    {
    }

    /** @return array{cities: list<array{id: int, name: string, region: string}>, regions: list<string>} */
    public function getOptions(): array
    {
        $rows = $this->db->queryAssoc("SELECT id, name, region FROM cities ORDER BY name, id");
        $cities = array_map(
            static fn (array $row) => [
                "id" => (int) $row["id"],
                "name" => (string) $row["name"],
                "region" => (string) $row["region"],
            ],
            $rows,
        );

        $regions = array_unique(array_column($cities, "region"));

        return ["cities" => $cities, "regions" => array_values($regions)];
    }

    /**
     * @return list<array{date: string, minTemperature: float|null, maxTemperature: float|null,
     *     precipitation: float|null}>|null
     */
    public function getDailyWeather(int|null $cityId, string|null $region, int $startDate, int $endDate): array|null
    {
        $location = [":cityId" => $cityId, ":region" => $region];
        $cities = $this->db->queryAssoc(
            "SELECT id FROM cities WHERE id = :cityId OR region = :region LIMIT 1",
            $location,
        );
        if ($cities === []) {
            return null;
        }

        $metrics = [
            "minTemperature" => ["minimum_temperatures", "min_temp"],
            "maxTemperature" => ["maximum_temperatures", "max_temp"],
            "precipitation" => ["precipitation", "precipitation"],
        ];
        // Substitute the region last so its text cannot be mistaken for another placeholder.
        $params = [":startDate" => $startDate, ":endDate" => $endDate] + $location;
        $days = [];
        foreach ($metrics as $metric => [$table, $column]) {
            // Average per city first so duplicate measurements do not give it extra weight.
            $rows = $this->db->queryAssoc(
                <<<SQL
                    SELECT DATE_FORMAT(STR_TO_DATE(date, '%Y%m%d'), '%Y-%m-%d') AS day, AVG(value) AS value
                    FROM (
                        SELECT m.date, AVG(CAST(NULLIF(m.{$column}, -999) AS DECIMAL(6, 1))) AS value
                        FROM {$table} AS m
                        JOIN cities AS c ON c.id = m.city_id
                        WHERE (c.id = :cityId OR c.region = :region) AND m.date BETWEEN :startDate AND :endDate
                        GROUP BY m.city_id, m.date
                    ) AS dailyCityValues
                    GROUP BY date
                    SQL,
                $params,
            );
            foreach ($rows as $row) {
                $date = (string) $row["day"];
                $days[$date] ??= [
                    "date" => $date,
                    "minTemperature" => null,
                    "maxTemperature" => null,
                    "precipitation" => null,
                ];
                $days[$date][$metric] = $row["value"] === null ? null : (float) $row["value"];
            }
        }

        ksort($days);

        return array_values($days);
    }
}
