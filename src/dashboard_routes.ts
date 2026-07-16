import { Router } from "express";
import { prisma } from "./db";

const router = Router();

// GET /api/dashboard/kpi — chiffres clés du tableau de bord commercial
router.get("/kpi", async (req, res) => {
  try {
    // Prospects actifs : ni convertis, ni perdus
    const prospectsActifs = await prisma.prospect.count({
      where: { statut: { notIn: ["CONVERTI", "PERDU"] } },
    });

    // Taux de conversion : prospects convertis / total des prospects créés
    const totalProspects = await prisma.prospect.count();
    const prospectsConvertis = await prisma.prospect.count({ where: { statut: "CONVERTI" } });
    const tauxConversion = totalProspects > 0
      ? Math.round((prospectsConvertis / totalProspects) * 100)
      : 0;

    // CA des contrats actifs
    const contratsActifs = await prisma.contrat.aggregate({
      where: { statut: "ACTIF" },
      _sum: { montant: true },
    });
    const caContratsActifs = contratsActifs._sum.montant ?? 0;

    // Interventions de la semaine en cours (lundi -> dimanche)
    const maintenant = new Date();
    const jourSemaine = maintenant.getDay(); // 0 = dimanche
    const decalageLundi = jourSemaine === 0 ? 6 : jourSemaine - 1;
    const lundi = new Date(maintenant);
    lundi.setDate(maintenant.getDate() - decalageLundi);
    lundi.setHours(0, 0, 0, 0);
    const dimanche = new Date(lundi);
    dimanche.setDate(lundi.getDate() + 6);
    dimanche.setHours(23, 59, 59, 999);

    const interventionsCetteSemaine = await prisma.intervention.count({
      where: { dateHeurePrevue: { gte: lundi, lte: dimanche } },
    });

    // Contrats arrivant à échéance dans les 30 prochains jours
    const dans30Jours = new Date();
    dans30Jours.setDate(dans30Jours.getDate() + 30);

    const echeances30j = await prisma.contrat.count({
      where: {
        statut: { in: ["ACTIF", "RENOUVELLEMENT"] },
        dateEcheance: { gte: maintenant, lte: dans30Jours },
      },
    });

    res.json({
      prospectsActifs,
      tauxConversion,
      caContratsActifs,
      interventionsCetteSemaine,
      echeances30j,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors du calcul des KPI" });
  }
});

// GET /api/dashboard/ca-par-service — répartition du CA (contrats actifs) par type de besoin
router.get("/ca-par-service", async (req, res) => {
  try {
    const contratsActifs = await prisma.contrat.findMany({
      where: { statut: "ACTIF" },
      include: { client: { include: { prospect: true } } },
    });

    const repartition: Record<string, number> = {};

    for (const contrat of contratsActifs) {
      const typeBesoin = contrat.client.prospect?.typeBesoin ?? "NON_CATEGORISE";
      repartition[typeBesoin] = (repartition[typeBesoin] ?? 0) + contrat.montant;
    }

    const resultat = Object.entries(repartition).map(([typeBesoin, montant]) => ({
      typeBesoin,
      montant,
    }));

    res.json(resultat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors du calcul de la répartition par service" });
  }
});

// GET /api/dashboard/activites-recentes — dernières activités tous modules confondus
router.get("/activites-recentes", async (req, res) => {
  try {
    const [derniersProspects, derniersContrats, dernieresInterventions] = await Promise.all([
      prisma.prospect.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.contrat.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { client: true } }),
      prisma.intervention.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { client: true } }),
    ]);

    const activites = [
      ...derniersProspects.map((p) => ({
        type: "Prospect" as const,
        libelle: `Nouveau prospect : ${p.nom}`,
        date: p.createdAt,
      })),
      ...derniersContrats.map((c) => ({
        type: "Contrat" as const,
        libelle: `Contrat ${c.statut.toLowerCase()} — ${c.client.nom} (${c.montant.toLocaleString("fr-FR")} FCFA)`,
        date: c.createdAt,
      })),
      ...dernieresInterventions.map((i) => ({
        type: "Intervention" as const,
        libelle: `Intervention ${i.statut.toLowerCase()} : ${i.type.toLowerCase()} — ${i.client.nom}`,
        date: i.createdAt,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    res.json(activites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des activités récentes" });
  }
});

export default router;