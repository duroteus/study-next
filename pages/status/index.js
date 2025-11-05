import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const statusData = await response.json();
  return statusData;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  const updatedAtText = isLoading
    ? "Loading..."
    : new Date(data.updated_at).toLocaleString("pt-BR");

  return <div>Updated at: {updatedAtText}</div>;
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  const databaseStatusInformation = isLoading ? (
    "Loading..."
  ) : (
    <>
      <div>Versão: {data.dependencies.database.version}</div>
      <div>
        Máximo de conexões: {data.dependencies.database.max_connections}
      </div>
      <div>Conexões abertas: {data.dependencies.database.connections}</div>
    </>
  );

  return (
    <>
      <h2>Database</h2>
      {databaseStatusInformation}
    </>
  );
}
