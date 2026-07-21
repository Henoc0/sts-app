import  express from "express";
import interventions_controllers from "../controllers/interventions_controller";

const InterventionRoute = express.Router()

InterventionRoute.get("/intervention", interventions_controllers.get),
InterventionRoute.get("/interventions/:id", interventions_controllers.getInt),
InterventionRoute.post("/interventions/", interventions_controllers.post),
InterventionRoute.patch("/interventions/", interventions_controllers.patch),
InterventionRoute.patch("/interventions/:id", interventions_controllers.patchEnd)

export default InterventionRoute