import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcrypt";

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

function categorySlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function seedAdmin() {
    console.log("\nSeeding admin user...");

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error(
            "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed the admin user",
        );
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: {
            role: "ADMIN",
            fullName: "TicketBro Admin",
            passwordHash,
        },
        create: {
            email: ADMIN_EMAIL,
            passwordHash,
            fullName: "TicketBro Admin",
            role: "ADMIN",
        },
    });

    console.log(`Admin user seeded: ${ADMIN_EMAIL}`);
}

async function seedCategories() {
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

async function main() {
    await seedCategories();
    await seedAdmin();
}

main()
    .catch((error: unknown) => {
        console.error("Seeding failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
