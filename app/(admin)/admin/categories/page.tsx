import { AdminCategoryDatabase } from "@/components/admin/admin-category-database";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminCategoriesData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const data = await getAdminCategoriesData();

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8">
        <AdminPageHeader eyebrow="Taxonomy" title="Manage categories" description="Organize assets with searchable categories. Tags are typed directly inside each asset form and reused automatically." />
        <AdminCategoryDatabase categories={data.categories} tags={data.tags} />
      </div>
    </main>
  );
}
