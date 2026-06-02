import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Cell Biology",
    slug: "cell-biology",
    description: "Cellular structures, organelles, and microscopy-ready diagrams.",
  },
  {
    name: "Neuroscience",
    slug: "neuroscience",
    description: "Neurons, neural pathways, synapses, and brain region illustrations.",
  },
  {
    name: "Molecular Biology",
    slug: "molecular-biology",
    description: "DNA, RNA, proteins, enzymes, and molecular mechanism visuals.",
  },
  {
    name: "Medical Anatomy",
    slug: "medical-anatomy",
    description: "Clean anatomical diagrams for clinical and teaching material.",
  },
];

const tags = [
  { name: "Editable SVG", slug: "editable-svg" },
  { name: "Publication Ready", slug: "publication-ready" },
  { name: "Teaching Slide", slug: "teaching-slide" },
  { name: "Vector", slug: "vector" },
  { name: "Transparent PNG", slug: "transparent-png" },
];

const assets = [
  {
    title: "Animal Cell Cross Section",
    slug: "animal-cell-cross-section",
    description:
      "Layered animal cell illustration with nucleus, mitochondria, endoplasmic reticulum, Golgi body, and membrane labels for teaching decks.",
    type: "ILLUSTRATION",
    accessLevel: "FREE",
    categorySlug: "cell-biology",
    tagSlugs: ["editable-svg", "teaching-slide", "vector"],
    format: "SVG",
    previewUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    fileUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    cloudinaryPublicId: "imagiene/demo/animal-cell-cross-section",
    width: 1600,
    height: 1200,
  },
  {
    title: "Neuron Synapse Diagram",
    slug: "neuron-synapse-diagram",
    description:
      "Scientific synapse diagram showing axon terminal, synaptic cleft, neurotransmitters, receptors, and postsynaptic membrane.",
    type: "DIAGRAM",
    accessLevel: "PRO",
    categorySlug: "neuroscience",
    tagSlugs: ["publication-ready", "teaching-slide", "vector"],
    format: "PNG",
    previewUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    fileUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    cloudinaryPublicId: "imagiene/demo/neuron-synapse-diagram",
    width: 1800,
    height: 1200,
  },
  {
    title: "DNA Replication Fork",
    slug: "dna-replication-fork",
    description:
      "Premium vector-style DNA replication fork asset with helicase, polymerase, leading strand, lagging strand, and Okazaki fragments.",
    type: "VECTOR",
    accessLevel: "PREMIUM",
    categorySlug: "molecular-biology",
    tagSlugs: ["editable-svg", "publication-ready", "vector"],
    format: "SVG",
    previewUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    fileUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    cloudinaryPublicId: "imagiene/demo/dna-replication-fork",
    width: 2000,
    height: 1200,
  },
  {
    title: "Human Heart Frontal Anatomy",
    slug: "human-heart-frontal-anatomy",
    description:
      "Clean frontal anatomy illustration of the human heart with chambers, valves, pulmonary vessels, and aorta for medical education.",
    type: "ILLUSTRATION",
    accessLevel: "PRO",
    categorySlug: "medical-anatomy",
    tagSlugs: ["publication-ready", "transparent-png"],
    format: "PNG",
    previewUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    fileUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    cloudinaryPublicId: "imagiene/demo/human-heart-frontal-anatomy",
    width: 1400,
    height: 1600,
  },
];

async function main() {
  const categoryBySlug = new Map();
  const tagBySlug = new Map();

  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
      },
      create: category,
    });
    categoryBySlug.set(record.slug, record);
  }

  for (const tag of tags) {
    const record = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: { ...tag, assetIds: [] },
    });
    tagBySlug.set(record.slug, record);
  }

  const seededAssetIdsByTagId = new Map();

  for (const asset of assets) {
    const category = categoryBySlug.get(asset.categorySlug);
    const assetTags = asset.tagSlugs.map((slug) => tagBySlug.get(slug)).filter(Boolean);
    const tagIds = assetTags.map((tag) => tag.id);

    const record = await prisma.asset.upsert({
      where: { slug: asset.slug },
      update: {
        title: asset.title,
        description: asset.description,
        type: asset.type,
        accessLevel: asset.accessLevel,
        fileUrl: asset.fileUrl,
        previewUrl: asset.previewUrl,
        cloudinaryPublicId: asset.cloudinaryPublicId,
        format: asset.format,
        width: asset.width,
        height: asset.height,
        categoryId: category.id,
        tagIds,
        isPublished: true,
        deletedAt: null,
      },
      create: {
        title: asset.title,
        slug: asset.slug,
        description: asset.description,
        type: asset.type,
        accessLevel: asset.accessLevel,
        fileUrl: asset.fileUrl,
        previewUrl: asset.previewUrl,
        cloudinaryPublicId: asset.cloudinaryPublicId,
        format: asset.format,
        width: asset.width,
        height: asset.height,
        categoryId: category.id,
        tagIds,
        isPublished: true,
      },
    });

    for (const tagId of tagIds) {
      const existingIds = seededAssetIdsByTagId.get(tagId) ?? [];
      seededAssetIdsByTagId.set(tagId, [...existingIds, record.id]);
    }
  }

  for (const [tagId, assetIds] of seededAssetIdsByTagId.entries()) {
    const tag = await prisma.tag.findUnique({ where: { id: tagId }, select: { assetIds: true } });
    const nextAssetIds = Array.from(new Set([...(tag?.assetIds ?? []), ...assetIds]));
    await prisma.tag.update({ where: { id: tagId }, data: { assetIds: nextAssetIds } });
  }

  console.log(`Seeded ${categories.length} categories, ${tags.length} tags, and ${assets.length} assets.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
