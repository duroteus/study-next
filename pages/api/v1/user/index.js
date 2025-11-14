import { createRouter } from "next-connect";

import controller from "infra/controller.js";
import session from "models/session.js";
import user from "models/user";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:session"), getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req, res) {
  const sessionToken = req.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const renewdSessionObject = await session.renew(sessionObject.id);
  controller.setSessionCookie(renewdSessionObject.token, res);

  const userFound = await user.findOneById(sessionObject.user_id);

  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
  return res.status(200).json(userFound);
}
