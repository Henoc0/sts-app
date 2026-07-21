import express from "express";
import cors from "cors";
import contratsRouter from "./routes/route_contrat";
import dashboardRouter from "./routes/route_dashboard";
import InterventionRoute from "./routes/route_interventions";
import ProspectRoute from "./routes/route_prospects";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", InterventionRoute);
app.use("/api", contratsRouter);
app.use("/api", ProspectRoute);
app.use("/api", dashboardRouter);

export default app;
