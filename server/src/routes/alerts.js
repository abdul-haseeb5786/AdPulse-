const express = require('express');
const { body } = require('express-validator');
const pool = require('../db/pool');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Apply auth to all alert routes
router.use(auth);

/**
 * GET /alerts - Fetch history with unread count
 */
router.get('/', async (req, res) => {
  try {
    const alertsQuery = `
      SELECT ah.*, c.name as campaign_name
      FROM alert_history ah
      JOIN campaigns c ON ah.campaign_id = c.id
      ORDER BY ah.triggered_at DESC
      LIMIT 50
    `;
    const countQuery = `SELECT COUNT(*) FROM alert_history WHERE is_read = false`;

    const [alertsRes, countRes] = await Promise.all([
      pool.query(alertsQuery),
      pool.query(countQuery)
    ]);

    res.json({
      data: alertsRes.rows,
      unreadCount: parseInt(countRes.rows[0].count)
    });
  } catch (err) {
    console.error('GET /alerts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /alerts/:id/read - Mark single as read
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE alert_history SET is_read = true WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /alerts/:id/read error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /alerts/read-all - Bulk mark as read
 */
router.patch('/read-all', async (req, res) => {
  try {
    const result = await pool.query('UPDATE alert_history SET is_read = true WHERE is_read = false');
    res.json({ success: true, updated: result.rowCount });
  } catch (err) {
    console.error('PATCH /alerts/read-all error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /alerts/rules - Fetch active rules
 */
router.get('/rules', async (req, res) => {
  try {
    const query = `
      SELECT ar.*, c.name as campaign_name 
      FROM alert_rules ar
      JOIN campaigns c ON ar.campaign_id = c.id
      WHERE ar.is_active = true
    `;
    const { rows } = await pool.query(query);
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /alerts/rules error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /alerts/rules - Create new rule
 */
router.post(
  '/rules',
  [
    body('campaign_id').isUUID().withMessage('Valid campaign_id is required'),
    body('metric').isIn(['ctr', 'spend_percent', 'roas', 'conversions', 'impressions']).withMessage('Invalid metric'),
    body('operator').isIn(['lt', 'gt', 'lte', 'gte']).withMessage('Invalid operator'),
    body('threshold').isNumeric().isFloat({ min: 0 }).withMessage('Threshold must be a positive number'),
  ],
  validate,
  async (req, res) => {
    try {
      const { campaign_id, metric, operator, threshold } = req.body;
      const query = `
        INSERT INTO alert_rules (campaign_id, metric, operator, threshold)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const { rows } = await pool.query(query, [campaign_id, metric, operator, threshold]);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error('POST /alerts/rules error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /alerts/rules/:id - Soft disable rule
 */
router.delete('/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE alert_rules SET is_active = false WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /alerts/rules/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
