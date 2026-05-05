const { authenticateUser, createUser } = require("../services/authService");

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const result = await authenticateUser(username, password);

    if (!result) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

exports.createAccount = async (req, res, next) => {
  const { username, password, role } = req.body;
  const allowedRoles = ["admin", "employee"];
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (!username || !password || !role) {
    return res.status(400).json({ error: "email, password, and role are required" });
  }

  if (!allowedRoles.includes(normalizedRole)) {
    return res.status(400).json({ error: "role must be admin or employee" });
  }

  if (String(password).length < 8) {
    return res.status(400).json({ error: "password must be at least 8 characters" });
  }

  try {
    const user = await createUser({ username, password, role });
    res.status(201).json({ user });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "An account with that email already exists" });
    }

    next(err);
  }
};
