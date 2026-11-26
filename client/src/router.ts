import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { WeatherPage } from "./weather/WeatherPage.tsx";
import { validateWeatherSearch } from "./weather/search.ts";

const rootRoute = createRootRoute();
const weatherRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: validateWeatherSearch,
  component: WeatherPage,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([weatherRoute]),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
