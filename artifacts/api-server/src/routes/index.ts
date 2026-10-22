import { Router, type IRouter } from "express";
import healthRouter from "./health";
import workforceRouter from "./workforce";
import trendsRouter from "./trends";
import extractRouter from "./extract";

const router: IRouter = Router();

router.use(healthRouter);
router.use(workforceRouter);
router.use(trendsRouter);
router.use(extractRouter);

export default router;
