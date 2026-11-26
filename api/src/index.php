<?php

namespace ADS\TakeHome;

include __DIR__ . "/../vendor/autoload.php";

use ADS\TakeHome\Controllers\ExampleController;
use ADS\TakeHome\Controllers\WeatherController;
use ADS\TakeHome\Framework\MySQL;
use ADS\TakeHome\Framework\Router;
use ADS\TakeHome\WeatherRepository;

$router = new Router();

$mysql = new MySQL("db", "weather", "root", "root");
$helloController = new ExampleController(greeting: "Hello", db: $mysql);
$weatherController = new WeatherController(new WeatherRepository($mysql));

$router->addRoute("GET", "/hello", $helloController->sayHello(...));
$router->addRoute("GET", "/budapest", $helloController->getBudapestMaxTempCount(...));
$router->addRoute("GET", "/weather/city", $weatherController->getCityWeather(...));
$router->addRoute("GET", "/weather/region", $weatherController->getRegionWeather(...));
$router->addRoute("GET", "/weather/options", $weatherController->getOptions(...));

$router->handleRequest();
