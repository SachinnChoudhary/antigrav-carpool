-- AlterTable
ALTER TABLE `users` ADD COLUMN `profileVisibility` VARCHAR(191) NOT NULL DEFAULT 'public',
    ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'passenger',
    ADD COLUMN `showEmail` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `showPhone` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `showRideHistory` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `suspended` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `suspendedAt` DATETIME(3) NULL,
    ADD COLUMN `suspendedBy` VARCHAR(191) NULL,
    ADD COLUMN `suspensionReason` TEXT NULL;
