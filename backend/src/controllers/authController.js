const { authenticateUser } = require("../services/authService");

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  try {
    const result = await authenticateUser(username, password);

    if (!result) {
      return res.status(401).json({ error: "Invalid username or password" });
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
