-- CreateTable
CREATE TABLE `Utilisateur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `motDePasseHash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'COMMERCIAL', 'TECHNICIEN') NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Utilisateur_email_key`(`email`),
    INDEX `Utilisateur_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prospect` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `entreprise` VARCHAR(191) NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `adresse` VARCHAR(191) NULL,
    `typeBesoin` ENUM('VIDEOSURVEILLANCE', 'CONTROLE_ACCES', 'CLOTURE_ELECTRIQUE', 'MOTORISATION_PORTAIL', 'INCENDIE', 'ALARME', 'RADIO') NOT NULL,
    `source` ENUM('RECOMMANDATION', 'SITE_WEB', 'APPEL_DIRECT', 'RESEAUX_SOCIAUX', 'AUTRE') NOT NULL DEFAULT 'AUTRE',
    `statut` ENUM('NOUVEAU', 'CONTACTE', 'DEVIS_ENVOYE', 'NEGOCIATION', 'GAGNE', 'CONVERTI', 'PERDU') NOT NULL DEFAULT 'NOUVEAU',
    `motifPerte` ENUM('PRIX', 'CONCURRENT', 'DELAI', 'BESOIN_ANNULE', 'SANS_REPONSE', 'AUTRE') NULL,
    `notes` TEXT NULL,
    `dernierRelance` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `commercialId` INTEGER NULL,

    INDEX `Prospect_statut_idx`(`statut`),
    INDEX `Prospect_commercialId_idx`(`commercialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `entreprise` VARCHAR(191) NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `adresse` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `prospectId` INTEGER NULL,

    UNIQUE INDEX `Client_prospectId_key`(`prospectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contrat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('INSTALLATION', 'MAINTENANCE', 'ABONNEMENT') NOT NULL,
    `statut` ENUM('BROUILLON', 'ACTIF', 'RENOUVELLEMENT', 'EXPIRE', 'RESILIE') NOT NULL DEFAULT 'BROUILLON',
    `motifResiliation` ENUM('INSATISFACTION', 'PRIX', 'DEMENAGEMENT', 'FERMETURE_ACTIVITE', 'AUTRE') NULL,
    `montant` INTEGER NOT NULL,
    `dateSignature` DATETIME(3) NULL,
    `dureeMois` INTEGER NULL,
    `dateEcheance` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `clientId` INTEGER NOT NULL,

    INDEX `Contrat_statut_idx`(`statut`),
    INDEX `Contrat_clientId_idx`(`clientId`),
    INDEX `Contrat_dateEcheance_idx`(`dateEcheance`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LigneContrat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `designation` VARCHAR(191) NOT NULL,
    `quantite` INTEGER NOT NULL DEFAULT 1,
    `prixUnitaire` INTEGER NOT NULL,
    `contratId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Intervention` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('INSTALLATION', 'MAINTENANCE_PREVENTIVE', 'DEPANNAGE', 'CONTROLE_PERIODIQUE') NOT NULL,
    `statut` ENUM('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE') NOT NULL DEFAULT 'PLANIFIEE',
    `dateHeurePrevue` DATETIME(3) NOT NULL,
    `description` TEXT NULL,
    `rapport` TEXT NULL,
    `materielRemplace` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `clientId` INTEGER NOT NULL,
    `contratId` INTEGER NULL,
    `technicienId` INTEGER NULL,

    INDEX `Intervention_statut_idx`(`statut`),
    INDEX `Intervention_dateHeurePrevue_idx`(`dateHeurePrevue`),
    INDEX `Intervention_technicienId_idx`(`technicienId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Prospect` ADD CONSTRAINT `Prospect_commercialId_fkey` FOREIGN KEY (`commercialId`) REFERENCES `Utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_prospectId_fkey` FOREIGN KEY (`prospectId`) REFERENCES `Prospect`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrat` ADD CONSTRAINT `Contrat_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LigneContrat` ADD CONSTRAINT `LigneContrat_contratId_fkey` FOREIGN KEY (`contratId`) REFERENCES `Contrat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Intervention` ADD CONSTRAINT `Intervention_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Intervention` ADD CONSTRAINT `Intervention_contratId_fkey` FOREIGN KEY (`contratId`) REFERENCES `Contrat`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Intervention` ADD CONSTRAINT `Intervention_technicienId_fkey` FOREIGN KEY (`technicienId`) REFERENCES `Utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
