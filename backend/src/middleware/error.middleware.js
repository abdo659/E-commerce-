function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  if (err.response) {
    const status = err.response.status || 500;
    const providerMessage = typeof err.response.data === "string"
      ? err.response.data
      : err.response.data?.message || err.response.data?.detail || JSON.stringify(err.response.data);

    return res.status(status).json({
      message: `Payment provider error: ${providerMessage}`,
      providerStatus: status
    });
  }

  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message || "Something went wrong."
  });
}

module.exports = { notFound, errorHandler };
