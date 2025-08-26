import { createAuthClient } from "better-auth/client";
import type { auth } from "./auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins"
import { ac, admin, userManager, customer } from "~/lib/admin-permissions";

export const authClient = createAuthClient({
    plugins: [
        inferAdditionalFields<typeof auth>(), 
        adminClient({
            ac,
            roles: {
                admin,
                userManager,
                customer,
            }
        })
    ],
});
