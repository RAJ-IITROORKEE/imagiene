import { AdminAssetForm } from "@/components/admin/admin-asset-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminAssetFormData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function NewAdminAssetPage() {
  const { categories, tags } = await getAdminAssetFormData();

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-5xl gap-8">
        <AdminPageHeader eyebrow="New asset" title="Create a library asset" description="Add asset metadata, R2 files, preview URLs, category, tags, and access level." />
        <AdminAssetForm categories={categories} tags={tags} />
      </div>
    </main>
  );
}
