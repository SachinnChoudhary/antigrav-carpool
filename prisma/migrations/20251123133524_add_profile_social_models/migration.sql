/*
  Warnings:

  - You are about to drop the column `fromDetail` on the `rides` table. All the data in the column will be lost.
  - You are about to drop the column `toDetail` on the `rides` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `rides` DROP COLUMN `fromDetail`,
    DROP COLUMN `toDetail`,
    ADD COLUMN `allowPooling` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `distance` DOUBLE NULL,
    ADD COLUMN `duration` INTEGER NULL,
    ADD COLUMN `flexibleDates` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `flexibleDays` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `fromLat` DOUBLE NULL,
    ADD COLUMN `fromLng` DOUBLE NULL,
    ADD COLUMN `pooledWith` VARCHAR(191) NULL,
    ADD COLUMN `toLat` DOUBLE NULL,
    ADD COLUMN `toLng` DOUBLE NULL,
    ADD COLUMN `waypoints` TEXT NULL,
    MODIFY `amenities` TEXT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `dateOfBirth` DATETIME(3) NULL,
    ADD COLUMN `driverLicenseUrl` VARCHAR(191) NULL,
    ADD COLUMN `driverLicenseVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `idDocumentUrl` VARCHAR(191) NULL,
    ADD COLUMN `idVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `interests` JSON NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `preferences` JSON NULL;

-- CreateTable
CREATE TABLE `saved_searches` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `from` VARCHAR(191) NOT NULL,
    `to` VARCHAR(191) NOT NULL,
    `flexibleDates` BOOLEAN NOT NULL DEFAULT false,
    `maxPrice` DOUBLE NULL,
    `minSeats` INTEGER NULL,
    `amenities` TEXT NULL,
    `alertEnabled` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `popular_routes` (
    `id` VARCHAR(191) NOT NULL,
    `from` VARCHAR(191) NOT NULL,
    `to` VARCHAR(191) NOT NULL,
    `fromLat` DOUBLE NOT NULL,
    `fromLng` DOUBLE NOT NULL,
    `toLat` DOUBLE NOT NULL,
    `toLng` DOUBLE NOT NULL,
    `searchCount` INTEGER NOT NULL DEFAULT 1,
    `rideCount` INTEGER NOT NULL DEFAULT 0,
    `lastSearched` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `popular_routes_searchCount_idx`(`searchCount`),
    UNIQUE INDEX `popular_routes_from_to_key`(`from`, `to`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `profileUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_badges` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `badgeName` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `earnedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `friendships` (
    `id` VARCHAR(191) NOT NULL,
    `requesterId` VARCHAR(191) NOT NULL,
    `addresseeId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `friendships_requesterId_addresseeId_key`(`requesterId`, `addresseeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `rides_from_to_date_idx` ON `rides`(`from`, `to`, `date`);

-- CreateIndex
CREATE INDEX `rides_fromLat_fromLng_toLat_toLng_idx` ON `rides`(`fromLat`, `fromLng`, `toLat`, `toLng`);

-- AddForeignKey
ALTER TABLE `saved_searches` ADD CONSTRAINT `saved_searches_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_profiles` ADD CONSTRAINT `social_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `friendships` ADD CONSTRAINT `friendships_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `friendships` ADD CONSTRAINT `friendships_addresseeId_fkey` FOREIGN KEY (`addresseeId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
