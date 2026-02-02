import { createRouter } from "next-connect";

import controller from "infra/controller.js";
import activation from "models/activation.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(req, res) {
  const tokenId = req.query.token_id;

  const usedToken = await activation.activateUser(tokenId);

  return res.status(200).json(usedToken);
}
