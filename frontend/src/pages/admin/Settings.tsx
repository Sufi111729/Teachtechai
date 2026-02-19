import { AdminLayout } from "../../layout/AdminLayout";
import { EmptyState } from "../../components/EmptyState";

export function Settings() {
  return (
    <AdminLayout title="Settings">
      <EmptyState title="Settings" description="System configuration and access controls coming soon." />
    </AdminLayout>
  );
}
