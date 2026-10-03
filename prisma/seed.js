import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed event categories");
}
const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
});
const categories = [
    "Concerts & Music",
    "Festivals & Cultural Events",
    "Sports",
    "Comedy",
    "Theater & Performing Arts",
    "Conferences & Seminars",
    "Workshops & Training",
    "Business & Networking",
    "Exhibitions & Trade Shows",
    "Food & Drink",
    "Kids & Family",
    "Religious & Spiritual",
    "Movies & Film",
    "Parties & Nightlife",
    "Other",
];
function categorySlug(name) {
    return name
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
async function main() {
    console.log("Seeding event categories...");
    for (const name of categories) {
        const slug = categorySlug(name);
        await prisma.eventCategory.upsert({
            where: { slug },
            update: { name },
            create: { name, slug },
        });
        console.log(name);
    }
    console.log(`Seeded ${categories.length} event categories successfully.`);
}
main()
    .catch((error) => {
    console.error("Event category seeding failed:", error);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map