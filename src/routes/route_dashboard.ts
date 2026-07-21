import express from 'express';
import dashboard_controllers from "../controllers/dashboard_controller"

const dashboardRouter = express.Router();

dashboardRouter.get("/dashboard/cash/", dashboard_controllers.getCA)
dashboardRouter.get("/dashboard/data/", dashboard_controllers.get)
dashboardRouter.get('/dashboard/Activities/', dashboard_controllers.getAct)


export default dashboardRouter