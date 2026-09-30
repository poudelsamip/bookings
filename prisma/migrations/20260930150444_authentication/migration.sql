-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ORGANIZER', 'STAFF', 'USER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizer_profile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "org_name" TEXT NOT NULL,
    "description" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "website" TEXT,
    "logo_url" TEXT,

    CONSTRAINT "organizer_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizer_profile_user_id_key" ON "organizer_profile"("user_id");

-- AddForeignKey
ALTER TABLE "organizer_profile" ADD CONSTRAINT "organizer_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
