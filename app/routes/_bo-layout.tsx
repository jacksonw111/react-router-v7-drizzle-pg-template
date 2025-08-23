import type { Route } from ".react-router/types/app/routes/+types/_bo-layout.bo.appearance";
import {
  type LoaderFunctionArgs,
  redirect,
  type unstable_MiddlewareFunction,
} from "react-router";
import { AdminLayout } from "~/components/admin/layout/admin-layout";
import { userContext } from "~/context";
import { authMiddleware } from "~/middlewares/auth";

export const unstable_middleware: unstable_MiddlewareFunction[] = [
  authMiddleware,
];

export async function loader({ context }: LoaderFunctionArgs) {
  const user = context.get(userContext);
  if (!user) return redirect("/login");

  // Check if user has admin permissions
  // const response = await auth.api.userHasPermission({
  //   body: {
  //     userId: user.id,
  //     permission: {
  //       admin: ["access"],
  //     },
  //   },
  // });

  // if (!response.success) {
  //   return redirect("/forbidden");
  // }

  // Get user permissions
  // const permissionsResponse = await auth.api.getUserPermissions({
  //   body: {
  //     userId: user.id,
  //   },
  // });

  // return {
  //   user: {
  //     name: user.name,
  //     email: user.email,
  //     avatar: user.image,
  //     permissions: permissionsResponse.data || [],
  //   },
  // };
  return user;
}

const BOLayout = ({ loaderData }: Route.ComponentProps) => {
  // const { user } = useLoaderData<typeof loader>();

  return <AdminLayout user={loaderData} />;
};
export default BOLayout;
