import { AdminLayout } from "../../layout/AdminLayout";
import { EmptyState } from "../../components/EmptyState";

export function Documents() {
  return (
    <AdminLayout title="Documents">
      <EmptyState title="Document library" description="Centralized document management coming soon." />
    </AdminLayout>
  );
}
