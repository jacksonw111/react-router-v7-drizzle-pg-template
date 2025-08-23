import {
  type LoaderFunctionArgs,
  Outlet,
  redirect,
  type unstable_MiddlewareFunction,
} from "react-router";
import { userContext } from "~/context";
import { auth } from "~/lib/auth";
import { authMiddleware } from "~/middlewares/auth";

export const unstable_middleware: unstable_MiddlewareFunction[] = [
  authMiddleware,
];

export async function loader({ context }: LoaderFunctionArgs) {
  const user = context.get(userContext);
  if (!user) return redirect("/login");
  const response = await auth.api.userHasPermission({
    body: {
      userId: user.id,
      permission: {
        customer: ["read"],
      } /* Must use this, or permissions */,
    },
  });
  if (!response.success) {
    return redirect("/forbidden");
  }
}

const BOLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};
export default BOLayout;
