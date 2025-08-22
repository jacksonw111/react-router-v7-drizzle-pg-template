import type { unstable_MiddlewareFunction } from "react-router";
import { authMiddleware } from "~/middlewares/auth";

export const unstable_middleware: unstable_MiddlewareFunction[] = [
  authMiddleware,
];
