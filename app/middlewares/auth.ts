import { type unstable_MiddlewareFunction } from "react-router";
import { userContext } from "~/context";
import { auth } from "~/lib/auth";

export const authMiddleware: unstable_MiddlewareFunction = async ({
  request,
  context,
}) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (session?.user) {
    context.set(userContext, session.user);
  }
};
