import { redirect, type LoaderFunctionArgs } from "react-router";
import { userContext } from "~/context";
import type { Route } from "./+types/_auth.profile";

export async function loader({ context }: LoaderFunctionArgs) {
  const user = context.get(userContext);
  if (!user) return redirect("/");
  return user;
}
const Profile = ({ loaderData }: Route.ComponentProps) => {
  return <div>{loaderData.name}</div>;
};
export default Profile;
