import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const dbUrl = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port) || 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace(/^\//, ""),
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Nettoyage des données existantes...");
  await prisma.intervention.deleteMany();
  await prisma.ligneContrat.deleteMany();
  await prisma.contrat.deleteMany();
  await prisma.client.deleteMany();
  await prisma.prospect.deleteMany();
  await prisma.utilisateur.deleteMany();

  console.log("Création des utilisateurs...");
  const motDePasseHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.utilisateur.create({
    data: { nom: "Koffi Béni Hénoc", email: "henoc@stssarl.com", motDePasseHash, role: "ADMIN" },
  });
  const commercial1 = await prisma.utilisateur.create({
    data: { nom: "Aïcha Touré", email: "aicha@stssarl.com", motDePasseHash, role: "COMMERCIAL" },
  });
  const commercial2 = await prisma.utilisateur.create({
    data: { nom: "Yao Kouassi", email: "yao@stssarl.com", motDePasseHash, role: "COMMERCIAL" },
  });
  const technicien1 = await prisma.utilisateur.create({
    data: { nom: "Ibrahim Diallo", email: "ibrahim@stssarl.com", motDePasseHash, role: "TECHNICIEN" },
  });
  const technicien2 = await prisma.utilisateur.create({
    data: { nom: "Marc Kouadio", email: "marc@stssarl.com", motDePasseHash, role: "TECHNICIEN" },
  });

  console.log("Création des prospects...");

  const prospectFatou = await prisma.prospect.create({
    data: { nom: "Fatou Bamba", entreprise: "Pharmacie Bamba", telephone: "0707123456", typeBesoin: "VIDEOSURVEILLANCE", source: "SITE_WEB", statut: "NOUVEAU", commercialId: commercial1.id },
  });
  const prospectJeanMarc = await prisma.prospect.create({
    data: { nom: "Jean-Marc Ehouman", entreprise: "Résidence Les Palmiers", telephone: "0102345678", typeBesoin: "CONTROLE_ACCES", source: "RECOMMANDATION", statut: "CONTACTE", commercialId: commercial1.id },
  });
  const prospectAminata = await prisma.prospect.create({
    data: { nom: "Aminata Coulibaly", telephone: "0555112233", typeBesoin: "ALARME", source: "APPEL_DIRECT", statut: "DEVIS_ENVOYE", commercialId: commercial2.id },
  });
  const prospectBruno = await prisma.prospect.create({
    data: { nom: "Bruno N'Guessan", entreprise: "Station Total Angré", telephone: "0708998877", typeBesoin: "VIDEOSURVEILLANCE", source: "SITE_WEB", statut: "NEGOCIATION", commercialId: commercial1.id },
  });
  const prospectChantal = await prisma.prospect.create({
    data: { nom: "Chantal Kouassi", entreprise: "École Les Génies", telephone: "0102233445", typeBesoin: "CONTROLE_ACCES", source: "RECOMMANDATION", statut: "GAGNE", commercialId: commercial2.id },
  });
  const prospectDesire = await prisma.prospect.create({
    data: { nom: "Désiré Yao", entreprise: "Yao & Fils BTP", telephone: "0707665544", typeBesoin: "CLOTURE_ELECTRIQUE", source: "RESEAUX_SOCIAUX", statut: "CONVERTI", commercialId: commercial1.id },
  });
  const prospectEstelle = await prisma.prospect.create({
    data: { nom: "Estelle Kacou", entreprise: "Boutique Estelle Mode", telephone: "0555778899", typeBesoin: "ALARME", source: "SITE_WEB", statut: "CONVERTI", commercialId: commercial2.id },
  });
  const prospectFranck = await prisma.prospect.create({
    data: { nom: "Franck Assi", entreprise: "Villa Riviera Golf", telephone: "0102998877", typeBesoin: "MOTORISATION_PORTAIL", source: "RECOMMANDATION", statut: "CONVERTI", commercialId: commercial1.id },
  });
  const prospectGeorgette = await prisma.prospect.create({
    data: { nom: "Georgette Aka", entreprise: "Clinique Aka", telephone: "0707554433", typeBesoin: "INCENDIE", source: "APPEL_DIRECT", statut: "CONVERTI", commercialId: commercial2.id },
  });
  const prospectHerve = await prisma.prospect.create({
    data: { nom: "Hervé Tanoh", entreprise: "Entrepôt Tanoh Logistique", telephone: "0555443322", typeBesoin: "VIDEOSURVEILLANCE", source: "SITE_WEB", statut: "CONVERTI", commercialId: commercial1.id },
  });
  const prospectIrene = await prisma.prospect.create({
    data: { nom: "Irène Brou", telephone: "0102776655", typeBesoin: "ALARME", source: "RECOMMANDATION", statut: "PERDU", motifPerte: "PRIX", commercialId: commercial2.id },
  });
  const prospectJulien = await prisma.prospect.create({
    data: { nom: "Julien Kra", entreprise: "Supermarché Kra", telephone: "0707332211", typeBesoin: "VIDEOSURVEILLANCE", source: "SITE_WEB", statut: "PERDU", motifPerte: "CONCURRENT", commercialId: commercial1.id },
  });
  const prospectKaridja = await prisma.prospect.create({
    data: { nom: "Karidja Ouattara", entreprise: "Résidence Bel Azur", telephone: "0555665544", typeBesoin: "CONTROLE_ACCES", source: "RESEAUX_SOCIAUX", statut: "NOUVEAU", commercialId: commercial2.id },
  });
  const prospectLassina = await prisma.prospect.create({
    data: { nom: "Lassina Koné", entreprise: "Garage Koné Auto", telephone: "0102554433", typeBesoin: "CLOTURE_ELECTRIQUE", source: "APPEL_DIRECT", statut: "CONTACTE", commercialId: commercial1.id },
  });

  console.log("Conversion des prospects gagnés en clients...");

  const clientDesire = await prisma.client.create({
    data: { nom: prospectDesire.nom, entreprise: prospectDesire.entreprise, telephone: prospectDesire.telephone, prospectId: prospectDesire.id },
  });
  const clientEstelle = await prisma.client.create({
    data: { nom: prospectEstelle.nom, entreprise: prospectEstelle.entreprise, telephone: prospectEstelle.telephone, prospectId: prospectEstelle.id },
  });
  const clientFranck = await prisma.client.create({
    data: { nom: prospectFranck.nom, entreprise: prospectFranck.entreprise, telephone: prospectFranck.telephone, prospectId: prospectFranck.id },
  });
  const clientGeorgette = await prisma.client.create({
    data: { nom: prospectGeorgette.nom, entreprise: prospectGeorgette.entreprise, telephone: prospectGeorgette.telephone, prospectId: prospectGeorgette.id },
  });
  const clientHerve = await prisma.client.create({
    data: { nom: prospectHerve.nom, entreprise: prospectHerve.entreprise, telephone: prospectHerve.telephone, prospectId: prospectHerve.id },
  });

  // Deux clients historiques saisis directement, jamais passés par le pipeline prospect
  const clientPaul = await prisma.client.create({
    data: { nom: "Paul Yapi", entreprise: "Hôtel Ivoire Plateau", telephone: "0102112233" },
  });
  const clientMireille = await prisma.client.create({
    data: { nom: "Mireille Gbagbo", entreprise: "Résidence Les Orchidées", telephone: "0707889900" },
  });

  console.log("Création des contrats...");

  const contratDesire = await prisma.contrat.create({
    data: {
      clientId: clientDesire.id, type: "INSTALLATION", statut: "ACTIF", montant: 1800000,
      dateSignature: new Date("2026-04-10"),
      lignes: { create: [{ designation: "Clôture électrique 200m", quantite: 1, prixUnitaire: 1800000 }] },
    },
  });
  const contratEstelle = await prisma.contrat.create({
    data: {
      clientId: clientEstelle.id, type: "MAINTENANCE", statut: "ACTIF", montant: 450000,
      dateSignature: new Date("2026-02-15"), dureeMois: 12, dateEcheance: new Date("2027-02-15"),
      lignes: { create: [{ designation: "Contrat maintenance alarme annuel", quantite: 1, prixUnitaire: 450000 }] },
    },
  });
  const contratFranck = await prisma.contrat.create({
    data: {
      clientId: clientFranck.id, type: "INSTALLATION", statut: "ACTIF", montant: 2200000,
      dateSignature: new Date("2026-03-01"),
      lignes: {
        create: [
          { designation: "Motorisation portail coulissant", quantite: 1, prixUnitaire: 1200000 },
          { designation: "Caméra IP entrée", quantite: 2, prixUnitaire: 500000 },
        ],
      },
    },
  });
  const contratGeorgette = await prisma.contrat.create({
    data: {
      clientId: clientGeorgette.id, type: "INSTALLATION", statut: "ACTIF", montant: 3500000,
      dateSignature: new Date("2026-01-20"),
      lignes: {
        create: [
          { designation: "Détecteur incendie", quantite: 8, prixUnitaire: 250000 },
          { designation: "Centrale incendie", quantite: 1, prixUnitaire: 1500000 },
        ],
      },
    },
  });
  const contratHerveAbonnement = await prisma.contrat.create({
    data: {
      clientId: clientHerve.id, type: "ABONNEMENT", statut: "ACTIF", montant: 900000,
      dateSignature: new Date("2026-05-05"), dureeMois: 12, dateEcheance: new Date("2027-05-05"),
      lignes: { create: [{ designation: "Télésurveillance 6 caméras", quantite: 1, prixUnitaire: 900000 }] },
    },
  });
  const contratHerveVideo = await prisma.contrat.create({
    data: {
      clientId: clientHerve.id, type: "INSTALLATION", statut: "ACTIF", montant: 2900000,
      dateSignature: new Date("2026-06-12"),
      lignes: {
        create: [
          { designation: "Vidéosurveillance 8 caméras IP", quantite: 8, prixUnitaire: 350000 },
          { designation: "Enregistreur NVR", quantite: 1, prixUnitaire: 300000 },
        ],
      },
    },
  });
  const contratPaul = await prisma.contrat.create({
    data: {
      clientId: clientPaul.id, type: "MAINTENANCE", statut: "RENOUVELLEMENT", montant: 380000,
      dateSignature: new Date("2025-07-01"), dureeMois: 12, dateEcheance: new Date("2026-08-05"),
      lignes: { create: [{ designation: "Contrat maintenance annuel", quantite: 1, prixUnitaire: 380000 }] },
    },
  });
  const contratMireille = await prisma.contrat.create({
    data: {
      clientId: clientMireille.id, type: "ABONNEMENT", statut: "EXPIRE", montant: 600000,
      dateSignature: new Date("2025-06-01"), dureeMois: 12, dateEcheance: new Date("2026-06-01"),
      lignes: { create: [{ designation: "Télésurveillance résidentielle", quantite: 1, prixUnitaire: 600000 }] },
    },
  });

  console.log("Création des interventions...");

  await prisma.intervention.create({
    data: { clientId: clientDesire.id, contratId: contratDesire.id, technicienId: technicien1.id, type: "INSTALLATION", statut: "TERMINEE", dateHeurePrevue: new Date("2026-04-15T09:00:00"), description: "Installation clôture électrique complète", rapport: "Installation réalisée sans incident, test de tension effectué.", materielRemplace: false },
  });
  await prisma.intervention.create({
    data: { clientId: clientEstelle.id, contratId: contratEstelle.id, technicienId: technicien2.id, type: "MAINTENANCE_PREVENTIVE", statut: "TERMINEE", dateHeurePrevue: new Date("2026-06-20T10:00:00"), description: "Contrôle trimestriel centrale alarme", rapport: "RAS, batterie de secours changée par précaution.", materielRemplace: true },
  });
  await prisma.intervention.create({
    data: { clientId: clientFranck.id, contratId: contratFranck.id, technicienId: technicien1.id, type: "INSTALLATION", statut: "TERMINEE", dateHeurePrevue: new Date("2026-03-10T08:00:00"), description: "Installation motorisation + caméras", rapport: "Installation complète, client formé à l'usage.", materielRemplace: false },
  });
  await prisma.intervention.create({
    data: { clientId: clientGeorgette.id, contratId: contratGeorgette.id, technicienId: technicien2.id, type: "CONTROLE_PERIODIQUE", statut: "PLANIFIEE", dateHeurePrevue: new Date("2026-07-18T14:00:00"), description: "Contrôle réglementaire semestriel détection incendie", materielRemplace: false },
  });
  await prisma.intervention.create({
    data: { clientId: clientHerve.id, contratId: contratHerveAbonnement.id, technicienId: technicien1.id, type: "MAINTENANCE_PREVENTIVE", statut: "PLANIFIEE", dateHeurePrevue: new Date("2026-07-16T09:30:00"), description: "Vérification abonnement télésurveillance", materielRemplace: false },
  });
  await prisma.intervention.create({
    data: { clientId: clientHerve.id, contratId: contratHerveVideo.id, technicienId: technicien1.id, type: "INSTALLATION", statut: "TERMINEE", dateHeurePrevue: new Date("2026-06-15T08:00:00"), description: "Installation vidéosurveillance complète", rapport: "8 caméras posées, enregistreur configuré, test à distance validé.", materielRemplace: false },
  });
  await prisma.intervention.create({
    data: { clientId: clientPaul.id, contratId: contratPaul.id, technicienId: technicien2.id, type: "DEPANNAGE", statut: "EN_COURS", dateHeurePrevue: new Date("2026-07-14T11:00:00"), description: "Alarme se déclenche sans raison apparente", materielRemplace: false },
  });
  await prisma.intervention.create({
    data: { clientId: clientMireille.id, contratId: contratMireille.id, technicienId: technicien2.id, type: "DEPANNAGE", statut: "PLANIFIEE", dateHeurePrevue: new Date("2026-07-17T15:00:00"), description: "Renouvellement contrat expiré à discuter sur place", materielRemplace: false },
  });
  // Deux interventions SANS contrat lié : dépannage/devis avant signature
  await prisma.intervention.create({
    data: { clientId: clientPaul.id, contratId: null, technicienId: technicien1.id, type: "DEPANNAGE", statut: "PLANIFIEE", dateHeurePrevue: new Date("2026-07-19T10:00:00"), description: "Portail bloqué en position ouverte, hors contrat actif", materielRemplace: false },
  });
  await prisma.intervention.create({
    data: { clientId: clientMireille.id, contratId: null, technicienId: technicien2.id, type: "INSTALLATION", statut: "TERMINEE", dateHeurePrevue: new Date("2026-05-02T09:00:00"), description: "Devis technique sur site avant signature contrat", rapport: "Visite réalisée, devis transmis au commercial.", materielRemplace: false },
  });

  console.log("Seed terminé avec succès !");
  console.log("→ 14 prospects, 7 clients, 8 contrats, 10 interventions, 5 utilisateurs");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });