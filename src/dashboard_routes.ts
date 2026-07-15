import { Router } from "express";
import { prisma } from "./db";

const router = Router();

// GET /api/dashboard/kpi — chiffres clés du dashboard commercial
router.get("/kpi", async (req, res) => {
  try {
    const prospectsActifs = await prisma.prospect.count({
      where: { statut: { notIn: ["CONVERTI", "PERDU"] } },
    });
    // TODO : taux de conversion, CA contrats actifs, interventions cette semaine, échéances à 30 jours
    res.json({ prospectsActifs });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du calcul des KPI" });
  }
});

export default router;
