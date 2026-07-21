import { Router } from "express";
import {Response, Request} from 'express';
import { prisma } from "../db";

const contrats_controller = {
    // GET /api/contrats — liste tous les contrats avec client et lignes
      getAll: async (req: Request, res: Response) => {
        try {
          const contrats = await prisma.contrat.findMany({
            include: { client: true, lignes: true },
            orderBy: { createdAt: "desc" },
          });
          res.json(contrats);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Erreur lors de la récupération des contrats" });
        }
      },

      // GET /api/contrats/:id — détail d'un contrat
      get : async (req:Request, res:Response) =>{
          try {
            const contrat = await prisma.contrat.findUnique({
              where: { id: Number(req.params.id) },
              include: { client: true, lignes: true, interventions: true },
            });
            if (!contrat) {
              return res.status(404).json({ error: "Contrat introuvable" });
            }
            res.json(contrat);
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur lors de la récupération du contrat" });
          }
      },

      // POST /api/contrats — créer un contrat avec ses lignes d'équipements
      // Body attendu : { clientId, type, montant, dateSignature?, dureeMois?, dateEcheance?, lignes: [{ designation, quantite, prixUnitaire }] }
      create: async (req: Request, res: Response) => {
        try {
          const { clientId, type, montant, dateSignature, dureeMois, dateEcheance, lignes } = req.body;

          if (!clientId || !type || montant === undefined) {
            return res.status(400).json({ error: "clientId, type et montant sont obligatoires" });
          }

          const contrat = await prisma.contrat.create({
            data: {
              clientId: Number(clientId),
              type,
              montant: Number(montant),
              dateSignature: dateSignature ? new Date(dateSignature) : undefined,
              dureeMois: dureeMois ? Number(dureeMois) : undefined,
              dateEcheance: dateEcheance ? new Date(dateEcheance) : undefined,
              lignes: lignes?.length
                ? { create: lignes.map((l: { designation: string; quantite: number; prixUnitaire: number }) => ({
                    designation: l.designation,
                    quantite: l.quantite ?? 1,
                    prixUnitaire: l.prixUnitaire,
                  })) }
                : undefined,
            },
            include: { client: true, lignes: true },
          });

          res.status(201).json(contrat);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Erreur lors de la création du contrat" });
        }
      },

      // PATCH /api/contrats/:id — modifier un contrat (statut, montant, dates, motif de résiliation)
      update : async (req:Request, res:Response) => {
        try {
          const { statut, montant, dateSignature, dureeMois, dateEcheance, motifResiliation } = req.body;

          const contrat = await prisma.contrat.update({
            where: { id: Number(req.params.id) },
            data: {
              statut,
              montant: montant !== undefined ? Number(montant) : undefined,
              dateSignature: dateSignature ? new Date(dateSignature) : undefined,
              dureeMois: dureeMois !== undefined ? Number(dureeMois) : undefined,
              dateEcheance: dateEcheance ? new Date(dateEcheance) : undefined,
              motifResiliation,
            },
            include: { client: true, lignes: true },
          });

          res.json(contrat);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Erreur lors de la mise à jour du contrat" });
        }
      },

      // POST /api/contrats/:id/lignes — ajouter une ligne d'équipement à un contrat existant
      createLigne : async (req:Request, res:Response) => {
          try {
            const { designation, quantite, prixUnitaire } = req.body;

            if (!designation || prixUnitaire === undefined) {
              return res.status(400).json({ error: "designation et prixUnitaire sont obligatoires" });
            }

            const ligne = await prisma.ligneContrat.create({
              data: {
                contratId: Number(req.params.id),
                designation,
                quantite: quantite ?? 1,
                prixUnitaire: Number(prixUnitaire),
              },
            });

            res.status(201).json(ligne);
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erreur lors de l'ajout de la ligne" });
          }
      },

      // DELETE /api/contrats/lignes/:ligneId — supprimer une ligne d'équipement
      deleteLigne : async (req:Request, res:Response) => {
          try {
            await prisma.ligneContrat.delete({ where: { id: Number(req.params.ligneId) } });
            res.status(204).send();
          } catch (error) {
            if (error.code == 'P2025'){
              res.status(404).json({error : "Ligne introuvable"})
            }
            console.error(error);
            res.status(500).json({ error: "Erreur lors de la suppression de la ligne" });
          }
      }};

export default contrats_controller;