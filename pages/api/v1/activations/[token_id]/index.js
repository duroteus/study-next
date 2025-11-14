import { createRouter } from "next-connect";

import controller from "infra/controller.js";
import activation from "models/activation.js";

const router = createRouter();

router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(req, res) {
  const tokenId = req.query.token_id;

  const usedToken = await activation.activateUser(tokenId);

  return res.status(200).json(usedToken);
}
