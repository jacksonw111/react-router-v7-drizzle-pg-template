import type { User } from "better-auth";
import { unstable_createContext } from "react-router";

export const userContext = unstable_createContext<User | null>(null);
