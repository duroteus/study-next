import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";

async function migrations(req, res) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({
      error: `Method ${req.method} not allowed.`,
    });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const defaultMigrationOptions = {
      dbClient: dbClient,
      dir: resolve("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
      dryRun: true,
    };

    if (req.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      res.status(200).json(pendingMigrations);
    }

    if (req.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });
      const statusCode = migratedMigrations.length > 0 ? 201 : 200;
      return res.status(statusCode).json(migratedMigrations);
    }
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    await dbClient.end();
  }
}

export default migrations;
