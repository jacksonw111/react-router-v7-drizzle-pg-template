import { useState } from "react";
import {
  Outlet,
  type LoaderFunctionArgs,
  type unstable_MiddlewareFunction,
} from "react-router";
import { BackToTop } from "~/components/layout/back-to-top";
import { Footer } from "~/components/layout/footer";
import { Header } from "~/components/layout/header";
import { userContext } from "~/context";
import { authMiddleware } from "~/middlewares/auth";
import type { Route } from "./+types/_layout";
export const unstable_middleware: unstable_MiddlewareFunction[] = [
  authMiddleware,
];

export async function loader({ context }: LoaderFunctionArgs) {
  return context.get(userContext);
}
export default function Layout({ loaderData }: Route.ComponentProps) {
  const [headerVisible, setHeaderVisible] = useState(true);
  const user = loaderData;
  console.log("layout");
  console.log(user);
  const handleScrollToTop = () => {
    setHeaderVisible(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header user={user} isVisible={headerVisible} />
      <main className="container mx-auto px-4 pt-20 sm:pt-24 pb-6 flex-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTop onScrollToTop={handleScrollToTop} />
    </div>
  );
}
