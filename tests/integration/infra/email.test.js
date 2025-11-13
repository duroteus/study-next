import email from "infra/email.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send email", async () => {
    await orchestrator.deleteAllEmails();
    await email.send({
      from: "Gustavo <gustavo@makhro.com.br",
      to: "contato@curso.dev",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    });

    await email.send({
      from: "Gustavo <gustavo@dev.com.br",
      to: "contato@curso.dev",
      subject: "Teste de assunto 2",
      text: "Teste de corpo 2.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<gustavo@dev.com.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@curso.dev>");
    expect(lastEmail.subject).toBe("Teste de assunto 2");
    expect(lastEmail.text).toBe("Teste de corpo 2.\n");
  });
});
