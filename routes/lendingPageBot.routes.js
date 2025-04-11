import { Router } from "express";

import * as lendingBotControllers from "../controllers/lendingPageBot.controllers.js";

const router = Router();

router.route("/lendingBot").post(lendingBotControllers.handleIncomingMessage);

export default router;
