const pool = require('../db/pool');

// Helper to calculate metrics
const addMetrics = (campaign) => ({
  ...campaign,
  ctr: campaign.impressions > 0 ? (Number(campaign.clicks) / Number(campaign.impressions)) * 100 : 0,
  roas: campaign.spend > 0 ? Number(campaign.revenue) / Number(campaign.spend) : 0,
});

const getAll = async (req, res) => {
  try {
    const { status, client_id, sort, order, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE deleted_at IS NULL';
    const params = [];

    if (status) {
      params.push(status);
      whereClause += ` AND status = $${params.length}`;
    }

    if (client_id) {
      params.push(client_id);
      whereClause += ` AND client_id = $${params.length}`;
    }

    // Whitelist for sorting to prevent SQL injection
    const allowedSortFields = ['spend', 'impressions', 'clicks', 'budget', 'created_at', 'name'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const query = `
      SELECT c.*, cl.name as client_name 
      FROM campaigns c 
      JOIN clients cl ON c.client_id = cl.id 
      ${whereClause.replace(/(\s)(status|client_id)/g, '$1c.$2')}
      ORDER BY c.${sortField} ${sortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const { rows } = await pool.query(query, [...params, parseInt(limit), offset]);
    
    // Total count for pagination - Reuse where clause logic
    const countQuery = `SELECT COUNT(*) FROM campaigns ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const campaigns = rows.map(addMetrics);

    res.json({
      data: campaigns,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('getCampaigns error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT c.*, cl.name as client_name 
      FROM campaigns c 
      JOIN clients cl ON c.client_id = cl.id 
      WHERE c.id = $1 AND c.deleted_at IS NULL
    `;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json(addMetrics(rows[0]));
  } catch (err) {
    console.error('getOne error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const create = async (req, res) => {
  try {
    const { 
      name, client_id, budget, status, spend, impressions, 
      clicks, conversions, revenue, start_date, end_date 
    } = req.body;

    if (!name || !client_id || !budget) {
      return res.status(400).json({ error: "Name, client_id, and budget are required" });
    }

    const query = `
      INSERT INTO campaigns (
        name, client_id, budget, status, spend, impressions, 
        clicks, conversions, revenue, start_date, end_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      name, client_id, budget, status || 'draft', spend || 0, 
      impressions || 0, clicks || 0, conversions || 0, 
      revenue || 0, start_date, end_date
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(addMetrics(rows[0]));
  } catch (err) {
    console.error('create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check exists
    const checkResult = await pool.query('SELECT id FROM campaigns WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const ALLOWED_UPDATE_FIELDS = ['name','status','budget','spend','impressions','clicks','conversions','revenue','start_date','end_date'];
    const updates = Object.keys(req.body)
      .filter(key => ALLOWED_UPDATE_FIELDS.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const setClauses = [];
    const values = [id];
    let paramIndex = 2;

    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const query = `
      UPDATE campaigns 
      SET ${setClauses.join(', ')}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    res.json(addMetrics(rows[0]));
  } catch (err) {
    console.error('update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const softDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'UPDATE campaigns SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json({ message: "Campaign deleted", id });
  } catch (err) {
    console.error('softDelete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAll,
  getOne,
  create,
  update,
  softDelete
};
