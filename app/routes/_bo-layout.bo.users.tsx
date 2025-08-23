import type { LoaderFunctionArgs } from "react-router";
import { BOUserTable } from "~/components/bo/users/table-list";
export async function loader({ context }: LoaderFunctionArgs) {}
const BOUsers = () => {
  return (
    <div>
      <BOUserTable />
    </div>
  );
};
export default BOUsers;
