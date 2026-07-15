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
    res.status(500).json({ error: "Erreur lors de la récupération des interventions" });
  }
});

// TODO : POST /, GET /:id, PATCH /:id, PATCH /:id/rapport

export default router;
