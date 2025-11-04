import database from "infra/database.js";

async function status(req, res) {
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
}

export default status;
