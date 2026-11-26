<?php

declare(strict_types=1);

namespace ADS\TakeHome\Tests;

use ADS\TakeHome\Controllers\WeatherController;
use ADS\TakeHome\Framework\HttpRequest;
use ADS\TakeHome\WeatherRepository;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class WeatherControllerTest extends TestCase
{
    /** @return iterable<string, array{array<string, string|list<string>>}> */
    public static function invalidCityQueries(): iterable
    {
        $valid = ["cityId" => "1", "startDate" => "2020-02-28", "endDate" => "2020-02-29"];

        yield "missing date" => [array_diff_key($valid, ["startDate" => true])];
        yield "nonexistent day" => [["startDate" => "2019-02-29"] + $valid];
        yield "reversed date range" => [["startDate" => "2020-03-01"] + $valid];
        yield "array date" => [["endDate" => ["2020-02-29"]] + $valid];
        yield "array city ID" => [["cityId" => ["1"]] + $valid];
        yield "zero city ID" => [["cityId" => "0"] + $valid];
        yield "out of range city ID" => [["cityId" => "2147483648"] + $valid];
    }

    /** @param array<string, string|list<string>> $query */
    #[DataProvider("invalidCityQueries")]
    public function testInvalidCityQueriesReturnBadRequest(array $query): void
    {
        $weather = $this->createMock(WeatherRepository::class);
        $weather->expects($this->never())->method("getDailyWeather");

        $response = (new WeatherController($weather))->getCityWeather(new HttpRequest($query));

        $this->assertSame(400, $response->getStatus());
    }

    public function testRegionWeatherReturnsDailyRowsAndUnits(): void
    {
        $weather = $this->createMock(WeatherRepository::class);
        $weather->expects($this->once())
            ->method("getDailyWeather")
            ->with(null, "Dunántúl", 20200229, 20200229)
            ->willReturn([
                ["date" => "2020-02-29", "minTemperature" => null, "maxTemperature" => 12.5, "precipitation" => 0.0],
            ]);

        $response = (new WeatherController($weather))->getRegionWeather(new HttpRequest([
            "region" => " Dunántúl ",
            "startDate" => "2020-02-29",
            "endDate" => "2020-02-29",
        ]));

        $this->assertSame(200, $response->getStatus());
        $this->assertJsonStringEqualsJsonString(
            '{"rows":[{"date":"2020-02-29","minTemperature":null,"maxTemperature":12.5,"precipitation":0}],'
            . '"units":{"temperature":"°C","precipitation":"mm"}}',
            $response->getBody() ?? "",
        );
    }

    public function testUnknownCityReturnsNotFound(): void
    {
        $weather = $this->createMock(WeatherRepository::class);
        $weather->expects($this->once())
            ->method("getDailyWeather")
            ->with(42, null, 20240101, 20240131)
            ->willReturn(null);

        $response = (new WeatherController($weather))->getCityWeather(new HttpRequest([
            "cityId" => "42",
            "startDate" => "2024-01-01",
            "endDate" => "2024-01-31",
        ]));

        $this->assertSame(404, $response->getStatus());
    }
}
