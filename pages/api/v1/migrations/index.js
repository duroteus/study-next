import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import migrator from "models/migrator.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req, res) {
  const pendingMigrations = await migrator.listPendingMigrations();
  res.status(200).json(pendingMigrations);
}

async function postHandler(req, res) {
  const migratedMigrations = await migrator.runPendingMigrations();
  const status_code = migratedMigrations.length > 0 ? 201 : 200;
  res.status(status_code).json(migratedMigrations);
}
