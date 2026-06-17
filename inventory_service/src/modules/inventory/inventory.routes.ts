import { Router } from "express";

import orderController from "./inventory.controller";

const router = Router();

router.post("/", orderController.create);

export default router;