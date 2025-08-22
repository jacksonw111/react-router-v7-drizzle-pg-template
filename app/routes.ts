import { type RouteConfig, route } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default [
  ...(await flatRoutes()),
  // route("*", "./routes/404.tsx"),
] satisfies RouteConfig;
