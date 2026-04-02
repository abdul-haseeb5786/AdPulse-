const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../logs/app.log');

const sanitizeBody = (body) => {
  if (!body) return body;
  const sanitized = { ...body };
  const keysToOmit = ['apiKey', 'key', 'secret'];
  keysToOmit.forEach(key => {
    if (sanitized[key]) sanitized[key] = '***';
  });
  return sanitized;
};

const logger = (req, res, next) => {
  const startTime = Date.now();

  // Log Request
  const requestLog = {
    type: "request",
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    body: sanitizeBody(req.body)
  };

  const logEntryReq = JSON.stringify(requestLog) + '\n';
  console.log(logEntryReq.trim());
  if (process.env.NODE_ENV !== 'production') {
    try {
      fs.appendFileSync(logFile, logEntryReq);
    } catch (e) {
      // ignore file write errors in serverless
    }
  }

  // Intercept completion to log Response
  res.on('finish', () => {
    const responseLog = {
      type: "response",
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    const logEntryRes = JSON.stringify(responseLog) + '\n';
    console.log(logEntryRes.trim());
    if (process.env.NODE_ENV !== 'production') {
      try {
        fs.appendFileSync(logFile, logEntryRes);
      } catch (e) {
        // ignore file write errors in serverless
      }
    }
  });

  next();
};

module.exports = { logger };
