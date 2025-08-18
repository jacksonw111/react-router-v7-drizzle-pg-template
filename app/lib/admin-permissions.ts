import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  project: ["create", "share", "update", "delete", "ban"], // <-- Permissions available for created roles
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  project: ["create", "update"],
  ...adminAc.statements,
});

export const superAdmin = ac.newRole({
  project: ["create", "update", "delete"],
  user: ["ban"],
});
