import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";
import { createRouter } from "next-connect";
import controller from "infra/controller.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationOptions = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
  dryRun: false,
};

async function getHandler(req, res) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: true,
    });
    res.status(200).json(pendingMigrations);
  } finally {
    await dbClient?.end();
  }
}

async function postHandler(req, res) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });
    const statusCode = migratedMigrations.length > 0 ? 201 : 200;
    res.status(statusCode).json(migratedMigrations);
  } finally {
    await dbClient?.end();
  }
}
