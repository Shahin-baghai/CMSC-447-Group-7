function errorHandler(err, req, res, next) {
  console.error(err.stack); // log for debugging
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
}

module.exports = errorHandler;