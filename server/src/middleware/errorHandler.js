const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Postgres unique violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Record already exists' });
  }

  // Postgres foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record not found' });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id, // Assuming some request-id middleware is present or can be added later
  });
};

module.exports = { errorHandler };
