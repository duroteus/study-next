import retry from "async-retry";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
      onRetry: (e, attempt) => {
        console.log({ attempt, error: e.message });
      },
    });

    async function fetchStatusPage() {
      try {
        const response = await fetch("http://localhost:3000/api/v1/status");

        if (!response.ok) {
          throw new Error(
            `O servidor web está respondendo com o status: "${response.status}"`
          );
        }
      } catch (e) {
        throw e;
      }
    }
  }
}

export default {
  waitForAllServices,
};
