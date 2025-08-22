import { type LoaderFunctionArgs } from "react-router";
import { auth, userHasPermission } from "~/lib/auth";

export async function loader(args: LoaderFunctionArgs) {
  const session = await auth.api.getSession({
    headers: args.request.headers,
  });
  if (!session?.user) {
    throw Response.json({ message: "Please login first" }, { status: 401 });
  }

  if (!userHasPermission(session.user.id)) {
    throw Response.json({ message: "Permission denied" }, { status: 403 });
  }
}

export default function admin() {
  return <>index page</>;
}
