import {
  type LoaderFunctionArgs,
  redirect,
  type unstable_MiddlewareFunction,
} from "react-router";
import { AdminLayout } from "~/components/admin/layout/admin-layout";
import { userContext } from "~/context";
import { authMiddleware } from "~/middlewares/auth";
import type { Route } from "./+types/_bo-layout";

export const unstable_middleware: unstable_MiddlewareFunction[] = [
  authMiddleware,
];

export async function loader({ context }: LoaderFunctionArgs) {
  const user = context.get(userContext);
  if (!user) return redirect("/login");
  return user;
}

const BOLayout = ({ loaderData }: Route.ComponentProps) => {
  return <AdminLayout user={loaderData} />;
};
export default BOLayout;
