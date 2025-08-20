import { AuthGuard } from "~/components/auth-guard";

const Index = () => {
  return (
    <AuthGuard requireAuth redirectTo="/admin/index">
      <></>
    </AuthGuard>
  );
};
export default Index;
