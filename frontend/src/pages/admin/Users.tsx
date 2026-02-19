import { AdminLayout } from "../../layout/AdminLayout";
import { EmptyState } from "../../components/EmptyState";

export function Users() {
  return (
    <AdminLayout title="Users">
      <EmptyState title="User management" description="User directory and role management coming soon." />
    </AdminLayout>
  );
}
