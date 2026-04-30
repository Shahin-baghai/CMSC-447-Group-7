const crypto = require("crypto");
const db = require("../db");

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;

function getAuthSecret() {
  return process.env.AUTH_SECRET || "dev-only-auth-secret";
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function signTokenPayload(payload) {
  return crypto
    .createHmac("sha256", getAuthSecret())
    .update(payload)
    .digest("hex");
}

function encodeToken(data) {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = signTokenPayload(payload);
  return `${payload}.${signature}`;
}

function decodeToken(token) {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signTokenPayload(payload);
  const providedSignature = Buffer.from(signature, "hex");
  const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex");

  if (providedSignature.length !== expectedSignatureBuffer.length) {
    return null;
  }

  const validSignature = crypto.timingSafeEqual(
    providedSignature,
    expectedSignatureBuffer
  );

  if (!validSignature) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed.exp || parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch (err) {
    return null;
  }
}

function toPublicUser(user) {
  return {
    userId: user.user_id,
    username: user.username,
    role: user.role
  };
}

exports.authenticateUser = async (username, password) => {
  const [rows] = await db.promise().query(
    `SELECT user_id, username, password_salt, password_hash, role
     FROM users
     WHERE username = ?`,
    [username]
  );

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0];
  const hashedPassword = hashPassword(password, user.password_salt);

  if (!timingSafeEqual(hashedPassword, user.password_hash)) {
    return null;
  }

  const publicUser = toPublicUser(user);
  const token = encodeToken({
    sub: publicUser.userId,
    username: publicUser.username,
    role: publicUser.role,
    exp: Date.now() + TOKEN_TTL_MS
  });

  return { user: publicUser, token };
};

exports.getUserFromToken = async (token) => {
  const payload = decodeToken(token);

  if (!payload?.sub) {
    return null;
  }

  const [rows] = await db.promise().query(
    `SELECT user_id, username, role
     FROM users
     WHERE user_id = ?`,
    [payload.sub]
  );

  if (rows.length === 0) {
    return null;
  }

  return toPublicUser(rows[0]);
};
