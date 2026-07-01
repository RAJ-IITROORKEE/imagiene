import { notFound } from "next/navigation";

import { AdminAssetForm } from "@/components/admin/admin-asset-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminAssetFormData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

type EditAdminAssetPageProps = {
  params: Promise<{ assetId: string }>;
};

export default async function EditAdminAssetPage({ params }: EditAdminAssetPageProps) {
  const { assetId } = await params;
  const { categories, tags, asset } = await getAdminAssetFormData(assetId);

  if (!asset) {
    notFound();
  }

  return (
    <main className="px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-5xl gap-8">
        <AdminPageHeader eyebrow="Edit asset" title={asset.title} description="Update metadata, access level, R2 object references, publish state, category, and tags." />
        <AdminAssetForm asset={asset} categories={categories} tags={tags} />
      </div>
    </main>
  );
}
