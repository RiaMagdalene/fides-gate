import { Router, type IRouter } from "express";
import {
  analytics,
  articlePreview,
  dashboard,
  policies,
  requests,
  crawlers,
  ledger,
  reset,
  scanText,
  simulate,
} from "../lib/fides-data";

const router: IRouter = Router();

router.get("/dashboard", (_req, res) => {
  res.json(dashboard());
});

router.get("/requests", (_req, res) => {
  res.json(requests);
});

router.get("/crawlers", (_req, res) => {
  res.json(crawlers);
});

router.get("/analytics", (_req, res) => {
  res.json(analytics());
});

router.get("/ledger", (_req, res) => {
  res.json(ledger);
});

router.get("/policies", (_req, res) => {
  res.json(policies);
});

router.patch("/policies", (req, res) => {
  if (!Array.isArray(req.body?.policies)) {
    res.status(400).json({ error: "policies must be an array" });
    return;
  }
  policies.splice(0, policies.length, ...req.body.policies);
  res.json(policies);
});

router.post("/simulate/search", (_req, res) => {
  res.json(simulate("search"));
});

router.post("/simulate/rag", (_req, res) => {
  res.json(simulate("rag"));
});

router.post("/simulate/spoof", (_req, res) => {
  res.json(simulate("spoof"));
});

router.post("/simulate/training", (_req, res) => {
  res.json(simulate("training"));
});

router.post("/demo/reset", (_req, res) => {
  res.json({ status: "reset", message: "Demo state restored.", dashboard: reset() });
});

router.post("/canary/scan", (req, res) => {
  if (typeof req.body?.text !== "string") {
    res.status(400).json({ error: "text must be a string" });
    return;
  }
  res.json(scanText(req.body.text));
});

router.get("/content/preview", (_req, res) => {
  res.json({ content: articlePreview });
});

export default router;