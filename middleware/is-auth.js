const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const err = new Error("Authorization error!");
    err.statusCode = 401;
    throw err;
  }
  let decodedToken;
  const token = authHeader.split(" ")[1];
  try {
    decodedToken = jwt.verify(token, "supersecretprvkey");
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }
  if (!decodedToken) {
    const err = new Error("Authorization error!");
    err.statusCode = 401;
    throw err;
  }
  req.userId = decodedToken.userId;
  next();
};
