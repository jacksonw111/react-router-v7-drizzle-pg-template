import { redirect, type LoaderFunctionArgs } from "react-router";
import useSWR from "swr";
import { userContext } from "~/context";
import { auth } from "~/lib/auth";
import { authClient } from "~/lib/auth-client";

export async function loader({ context }: LoaderFunctionArgs) {
  const user = context.get(userContext);
  if (!user) return redirect("/login");
  const response = await auth.api.userHasPermission({
    body: {
      userId: user.id,
      permissions: {
        user: ["list"],
      },
    },
  });
  console.log(response);

  const response1 = await auth.api.userHasPermission({
    body: {
      userId: user.id,
      permissions: {
        user: ["list", "create", "update"],
      },
    },
  });
  console.log(response);

  const response2 = await auth.api.userHasPermission({
    body: {
      userId: user.id,
      permissions: {
        user: [
          "list",
          "create",
          "update",
          "ban",
          "delete",
          "set-password",
          "set-role",
          "impersonate",
        ],
      },
    },
  });
  console.log(response);

  if (!response.success) {
    return redirect("/forbidden");
  }
}

const BOUsers = () => {
  const fetcher = async (
    pageSize: number,
    currentPage: number,
    searchTerm?: string
  ) => {
    await authClient.admin.listUsers({
      query: {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        searchValue: searchTerm,
        searchField: "email",
        searchOperator: "contains",
      },
    });
  };
  const { data, isLoading } = useSWR("");
  return <div>BOUsers</div>;
};
export default BOUsers;
