const errorHandler = (err, req, res, next) => {
  // Log the error with requestId
  console.error(`[${req.id}] Error:`, err.stack);

  const statusCode = err.statusCode || 500;
  
  const response = {
    error: "Internal server error",
    requestId: req.id
  };

  // In development, include more details
  if (process.env.NODE_ENV === 'development') {
    response.message = err.message;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { errorHandler };
