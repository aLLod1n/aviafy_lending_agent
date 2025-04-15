import { Router } from "express";

import * as lendingBotControllers from "../controllers/lendingPageBot.controllers.js";

const router = Router();

router.route("/sand-message").post(lendingBotControllers.handleIncomingMessage);
router
  .route("/get-customers-messages")
  .post(lendingBotControllers.getCustomersMessage);

export default router;
