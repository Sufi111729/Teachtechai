import { AdminLayout } from "../../layout/AdminLayout";
import { EmptyState } from "../../components/EmptyState";

export function Reports() {
  return (
    <AdminLayout title="Reports">
      <EmptyState title="Reports" description="Reporting dashboard coming soon." />
    </AdminLayout>
  );
}
