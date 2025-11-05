import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(req, res) {
  const allowedMethods = ["GET"];
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({
      error: `Method ${req.method} not allowed.`,
    });
  }

  try {
    const updatedAt = new Date().toISOString();
    const databaseName = process.env.POSTGRES_DB;

    const databaseQueryVersion = await database.query("SHOW server_version;");
    const databaseQueryMaxConnections = await database.query(
      "SHOW max_connections;",
    );
    const databaseQueryConnections = await database.query({
      text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    });

    const databaseVersion = databaseQueryVersion.rows[0].server_version;
    const databaseMaxConnections =
      databaseQueryMaxConnections.rows[0].max_connections;
    const databaseOpenedConnections = databaseQueryConnections.rows[0].count;

    res.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersion,
          max_connections: parseInt(databaseMaxConnections),
          connections: databaseOpenedConnections,
        },
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({ cause: error });

    console.log("\n Erro dentro do controller de status \n");
    console.error(publicErrorObject);

    res.status(500).json(publicErrorObject);
  }
}

export default status;
