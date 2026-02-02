import database from "infra/database.js";
import email from "infra/email.js";
import { ForbiddenError, NotFoundError } from "infra/errors.js";
import webserver from "infra/webserver.js";
import user from "models/user.js";
import authorization from "./authorization";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutos

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
      ;`,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function activateUser(tokenId) {
  const validToken = await findOneValidById(tokenId);
  await activateUserByUserId(validToken.user_id);
  const usedToken = await runUpdateQuery(tokenId);

  return usedToken;

  async function runUpdateQuery(tokenId) {
    const results = await database.query({
      text: `
        UPDATE
          user_activation_tokens
        SET
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [tokenId],
    });

    return results.rows[0];
  }
}

async function activateUserByUserId(userId) {
  const userToActivate = await user.findOneById(userId);

  if (!authorization.can(userToActivate, "read:activation_token")) {
    throw new ForbiddenError({
      message: "Você não pode mais utilizar tokens de ativação.",
      action: "Entre em contato com o suporte.",
    });
  }

  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
    "update:user",
  ]);
  return activatedUser;
}

async function findOneValidById(tokenId) {
  const tokenFound = await runSelectQuery(tokenId);
  return tokenFound;

  async function runSelectQuery(tokenId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          id = $1
          AND expires_at > NOW()
          AND used_at IS NULL
        LIMIT
          1
      ;`,
      values: [tokenId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
      });
    }

    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  const textEmail = `
    ${user.username},

    Clique no link abaixo para ativar seu cadastro!

    ${webserver.origin}/cadastro/ativar/${activationToken.id}

    Atenciosamente,
    Dev.
  `;

  await email.send({
    from: "Dev <contato@dev.com.br>",
    to: user.email,
    subject: "Ative seu cadastro!",
    text: textEmail,
  });
}

const activation = {
  create,
  activateUser,
  activateUserByUserId,
  findOneValidById,
  sendEmailToUser,
  EXPIRATION_IN_MILLISECONDS,
};

export default activation;
