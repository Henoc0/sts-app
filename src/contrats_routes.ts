import { Router } from "express";
import { prisma } from "./db";

const router = Router();

// GET /api/contrats — liste tous les contrats
router.get("/", async (req, res) => {
  try {
    const contrats = await prisma.contrat.findMany({
      include: { client: true, lignes: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(contrats);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des contrats" });
  }
});

// TODO Henoc : POST /, GET /:id, PATCH /:id

export default router;
