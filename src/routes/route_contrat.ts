import express from 'express';
import contrats_controller from "../controllers/contrats_controller"

const contratsRouter = express.Router();

contratsRouter.post("/contrat/", contrats_controller.create)
contratsRouter.get("/contrat/", contrats_controller.getAll)
contratsRouter.get("/contrat/:id", contrats_controller.get)
contratsRouter.post('/contrat/:id/lignes', contrats_controller.createLigne)
contratsRouter.delete("/contrat/lignes/:ligneId", contrats_controller.deleteLigne);
contratsRouter.patch("/contrat/:id", contrats_controller.update)


export default contratsRouter