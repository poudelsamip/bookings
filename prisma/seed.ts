import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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

async function main() {
    console.log("Seeding event categories...");

    for (const name of categories) {
        await prisma.eventCategory.upsert({
            where: { name },
            update: {},
            create: { name },
        });
        console.log(name);
    }

    console.log(`\n Seeded ${categories.length} categories successfully.`);
}

main()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
