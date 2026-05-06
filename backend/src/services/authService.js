const crypto = require("crypto");
const db = require("../db");

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;
const LOGIN_ALIASES = {
  "admin1@umbc.edu": "admin",
  "employee1@umbc.edu": "employee1"
};

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
  const normalizedUsername = username.trim().toLowerCase();
  const legacyUsername = LOGIN_ALIASES[normalizedUsername];
  const usernameMatches = legacyUsername
    ? [normalizedUsername, legacyUsername]
    : [normalizedUsername];

  const [rows] = await db.promise().query(
    `SELECT user_id, username, password_salt, password_hash, role
     FROM users
     WHERE username IN (?)
     ORDER BY username = ? DESC
     LIMIT 1`,
    [usernameMatches, normalizedUsername]
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

exports.createUser = async ({ username, password, role }) => {
  const normalizedUsername = String(username).trim().toLowerCase();
  const normalizedRole = String(role).trim().toLowerCase();
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(String(password), salt);

  const [result] = await db.promise().query(
    `INSERT INTO users (username, password_salt, password_hash, role)
     VALUES (?, ?, ?, ?)`,
    [normalizedUsername, salt, passwordHash, normalizedRole]
  );

  return {
    userId: result.insertId,
    username: normalizedUsername,
    role: normalizedRole
  };
};

exports.getAccountOverview = async () => {
  const [rows] = await db.promise().query(
    `SELECT user_id, username, role
     FROM users
     WHERE role IN ('admin', 'employee')
     ORDER BY role ASC, username ASC`
  );

  const accounts = rows.map(toPublicUser);

  return {
    summary: {
      total: accounts.length,
      admins: accounts.filter((account) => account.role === "admin").length,
      employees: accounts.filter((account) => account.role === "employee").length
    },
    accounts
  };
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
