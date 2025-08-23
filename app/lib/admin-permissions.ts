import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  project: ["create", "share", "update", "delete", "ban"],
  customer: ["read", "update"],
} as const;

export const ac = createAccessControl(statement);

// 管理员 - 拥有所有权限
export const admin = ac.newRole({
  project: ["create", "share", "update", "delete", "ban"],
  customer: ["read", "update"],
  ...adminAc.statements,
});

// 用户管理员 - 管理用户相关操作
export const userManager = ac.newRole({
  // project: ["create", "share", "update"],
  user: ["create", "list", "update"],
  customer: ["read", "update"],
});

export const userReader = ac.newRole({
  user: ["list"],
  customer: ["read"],
});

// 客户 - 基础用户角色
export const customer = ac.newRole({
  project: [],
  customer: [],
});
