import { Router } from "express";
import { prisma } from "./db";

const router = Router();

// GET /api/prospects — liste tous les prospects
router.get("/", async (req, res) => {
  try {
    const prospects = await prisma.prospect.findMany({
      include: { commercial: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(prospects);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des prospects" });
  }
});

// TODO Henoc : POST /, GET /:id, PATCH /:id, POST /:id/convertir

export default router;
