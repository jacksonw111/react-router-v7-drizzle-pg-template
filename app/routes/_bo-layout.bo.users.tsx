import type { LoaderFunctionArgs } from "react-router";
import { BOUserTable } from "~/components/bo/users/table-list";

export async function loader({ context }: LoaderFunctionArgs) {
  // Add loader logic here if needed
  return null;
}

const BOUsers = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions across your system
        </p>
      </div>
      <BOUserTable />
    </div>
  );
};
export default BOUsers;
