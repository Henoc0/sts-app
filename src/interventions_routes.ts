import { Router } from "express";
import { prisma } from "./db";

const router = Router();

// GET /api/interventions — liste toutes les interventions
router.get("/", async (req, res) => {
  try {
    const interventions = await prisma.intervention.findMany({
      include: { client: true, technicien: true, contrat: true },
      orderBy: { dateHeurePrevue: "asc" },
    });
    res.json(interventions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des interventions" });
  }
});

// GET /api/interventions/:id — détail d'une intervention
router.get("/:id", async (req, res) => {
  try {
    const intervention = await prisma.intervention.findUnique({
      where: { id: Number(req.params.id) },
      include: { client: true, technicien: true, contrat: true },
    });
    if (!intervention) {
      return res.status(404).json({ error: "Intervention introuvable" });
    }
    res.json(intervention);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération de l'intervention" });
  }
});

// POST /api/interventions — planifier une nouvelle intervention
// Body attendu : { clientId, contratId?, technicienId?, type, dateHeurePrevue, description? }
router.post("/", async (req, res) => {
  try {
    const { clientId, contratId, technicienId, type, dateHeurePrevue, description } = req.body;

    if (!clientId || !type || !dateHeurePrevue) {
      return res.status(400).json({ error: "clientId, type et dateHeurePrevue sont obligatoires" });
    }

    const intervention = await prisma.intervention.create({
      data: {
        clientId: Number(clientId),
        contratId: contratId ? Number(contratId) : undefined,
        technicienId: technicienId ? Number(technicienId) : undefined,
        type,
        dateHeurePrevue: new Date(dateHeurePrevue),
        description,
      },
      include: { client: true, technicien: true, contrat: true },
    });

    res.status(201).json(intervention);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création de l'intervention" });
  }
});

// PATCH /api/interventions/:id — modifier une intervention (statut, technicien, date...)
router.patch("/:id", async (req, res) => {
  try {
    const { statut, technicienId, dateHeurePrevue, description } = req.body;

    const intervention = await prisma.intervention.update({
      where: { id: Number(req.params.id) },
      data: {
        statut,
        technicienId: technicienId ? Number(technicienId) : undefined,
        dateHeurePrevue: dateHeurePrevue ? new Date(dateHeurePrevue) : undefined,
        description,
      },
      include: { client: true, technicien: true, contrat: true },
    });

    res.json(intervention);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'intervention" });
  }
});

// PATCH /api/interventions/:id/rapport — clôturer l'intervention avec un rapport
// Body attendu : { rapport, materielRemplace? }
router.patch("/:id/rapport", async (req, res) => {
  try {
    const { rapport, materielRemplace } = req.body;

    if (!rapport) {
      return res.status(400).json({ error: "rapport est obligatoire pour clôturer l'intervention" });
    }

    const intervention = await prisma.intervention.update({
      where: { id: Number(req.params.id) },
      data: {
        rapport,
        materielRemplace: materielRemplace ?? false,
        statut: "TERMINEE",
      },
      include: { client: true, technicien: true, contrat: true },
    });

    res.json(intervention);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la clôture de l'intervention" });
  }
});
export default router;
