import { Router, type IRouter } from "express";
import healthRouter from "./health";
import fidesRouter from "./fides";

const router: IRouter = Router();

router.use(healthRouter);
router.use(fidesRouter);

export default router;
