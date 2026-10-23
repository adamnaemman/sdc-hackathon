import { Router, type IRouter } from "express";
import healthRouter from "./health";
import workforceRouter from "./workforce";
import trendsRouter from "./trends";
import extractRouter from "./extract";
import planRouter from "./plan";
import exploreRouter from "./explore";
import libraryRouter from "./library";
import pathwayRouter from "./pathway";

const router: IRouter = Router();
router.use(healthRouter);
router.use(workforceRouter);
router.use(trendsRouter);
router.use(extractRouter);
router.use(planRouter);
router.use(exploreRouter);
router.use(libraryRouter);
router.use(pathwayRouter);

export default router;
