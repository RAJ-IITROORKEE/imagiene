import { AdminCategoryManager } from "@/components/admin/admin-category-manager";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminCategoriesData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const data = await getAdminCategoriesData();

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8">
        <AdminPageHeader eyebrow="Taxonomy" title="Manage categories and tags" description="Organize assets with searchable categories and multi-select tags. Deletion is blocked while assets are still linked." />
        <AdminCategoryManager categories={data.categories} tags={data.tags} />
      </div>
    </main>
  );
}
