

import { Router } from "express";
import { prisma } from "./db";

const router = Router();

// GET /api/prospects — liste tous les prospects
router.get("/", async (req, res) => {
  try {
    const prospects = await prisma.prospect.findMany({
      include: { commercial: true, client: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(prospects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des prospects" });
  }
});

// GET /api/prospects/:id — détail d'un prospect
router.get("/:id", async (req, res) => {
  try {
    const prospect = await prisma.prospect.findUnique({
      where: { id: Number(req.params.id) },
      include: { commercial: true, client: true },
    });
    if (!prospect) {
      return res.status(404).json({ error: "Prospect introuvable" });
    }
    res.json(prospect);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération du prospect" });
  }
});

// POST /api/prospects — créer un nouveau prospect
// Body attendu : { nom, entreprise?, telephone, email?, adresse?, typeBesoin, source?, commercialId? }
router.post("/", async (req, res) => {
  try {
    const { nom, entreprise, telephone, email, adresse, typeBesoin, source, commercialId } = req.body;

    if (!nom || !telephone || !typeBesoin) {
      return res.status(400).json({ error: "nom, telephone et typeBesoin sont obligatoires" });
    }

    const prospect = await prisma.prospect.create({
      data: {
        nom,
        entreprise,
        telephone,
        email,
        adresse,
        typeBesoin,
        source,
        commercialId: commercialId ? Number(commercialId) : undefined,
      },
    });

    res.status(201).json(prospect);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création du prospect" });
  }
});

// PATCH /api/prospects/:id — modifier un prospect (statut, notes, relance, motif de perte...)
router.patch("/:id", async (req, res) => {
  try {
    const { statut, notes, dernierRelance, motifPerte, commercialId } = req.body;

    if (statut === "PERDU" && !motifPerte) {
      return res.status(400).json({ error: "motifPerte est obligatoire quand le statut passe à PERDU" });
    }

    const prospect = await prisma.prospect.update({
      where: { id: Number(req.params.id) },
      data: {
        statut,
        notes,
        dernierRelance: dernierRelance ? new Date(dernierRelance) : undefined,
        motifPerte,
        commercialId: commercialId ? Number(commercialId) : undefined,
      },
    });

    res.json(prospect);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du prospect" });
  }
});

// POST /api/prospects/:id/convertir — convertit un prospect GAGNE en Client
router.post("/:id/convertir", async (req, res) => {
  try {
    const prospect = await prisma.prospect.findUnique({
      where: { id: Number(req.params.id) },
      include: { client: true },
    });

    if (!prospect) {
      return res.status(404).json({ error: "Prospect introuvable" });
      
    }
    
    if (prospect.client) {
      // NB : cette vérification nécessite include: { client: true } ci-dessus si on veut l'utiliser ;
      // gardé simple ici, la contrainte @unique sur Client.prospectId empêchera de toute façon les doublons.
    }

    const client = await prisma.client.create({
      data: {
        nom: prospect.nom,
        entreprise: prospect.entreprise,
        telephone: prospect.telephone,
        email: prospect.email,
        adresse: prospect.adresse,
        prospectId: prospect.id,
      },
    });

    const prospectMisAJour = await prisma.prospect.update({
      where: { id: prospect.id },
      data: { statut: "CONVERTI" },
    });

    res.status(201).json({ client, prospect: prospectMisAJour });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la conversion du prospect en client" });
  }
});

export default router;