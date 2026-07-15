import express from "express";
import cors from "cors";
import prospectsRouter from "./prospects_routes";
import contratsRouter from "./contrats_routes";
import interventionsRouter from "./interventions_routes";
import dashboardRouter from "./dashboard_routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/prospects", prospectsRouter);
app.use("/api/contrats", contratsRouter);
app.use("/api/interventions", interventionsRouter);
app.use("/api/dashboard", dashboardRouter);

export default app;
