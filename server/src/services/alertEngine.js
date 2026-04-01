const pool = require('../db/pool');

/**
 * Evaluates all active alerts against current campaign metrics
 */
const checkAllAlerts = async () => {
  const newlyTriggered = [];
  
  try {
    // 1. Fetch active rules with current campaign metrics
    const query = `
      SELECT 
        ar.*,
        c.name as campaign_name,
        c.spend,
        c.budget,
        c.impressions,
        c.clicks,
        c.conversions,
        c.revenue,
        CASE WHEN c.impressions > 0 
          THEN (c.clicks::float / c.impressions * 100) ELSE 0 END as ctr,
        CASE WHEN c.spend > 0 
          THEN (c.revenue / c.spend) ELSE 0 END as roas,
        CASE WHEN c.budget > 0 
          THEN (c.spend / c.budget * 100) ELSE 0 END as spend_percent
      FROM alert_rules ar
      JOIN campaigns c ON ar.campaign_id = c.id
      WHERE ar.is_active = true 
      AND c.deleted_at IS NULL
      AND c.status = 'active'
    `;
    
    const { rows: rules } = await pool.query(query);

    for (const rule of rules) {
      // Get the current metric value
      const currentValue = Number(rule[rule.metric]);
      const threshold = Number(rule.threshold);
      let isTriggered = false;

      // Evaluate condition
      switch (rule.operator) {
        case 'lt': isTriggered = currentValue < threshold; break;
        case 'gt': isTriggered = currentValue > threshold; break;
        case 'lte': isTriggered = currentValue <= threshold; break;
        case 'gte': isTriggered = currentValue >= threshold; break;
      }

      if (isTriggered) {
        // 2. Check for duplicate in last hour
        const dupCheck = await pool.query(
          `SELECT id FROM alert_history 
           WHERE rule_id = $1 
           AND triggered_at > NOW() - INTERVAL '1 hour'
           LIMIT 1`,
          [rule.id]
        );

        if (dupCheck.rows.length === 0) {
          // 3. Determine severity
          let severity = 'warning';
          if (rule.metric === 'spend_percent' && currentValue >= 90) severity = 'critical';
          if ((rule.metric === 'ctr' && currentValue < 0.5) || (rule.metric === 'roas' && currentValue < 1)) severity = 'critical';

          // 4. Build message
          let message = '';
          const val = currentValue.toFixed(2);
          switch (rule.metric) {
            case 'spend_percent':
              message = `${rule.campaign_name}: Budget ${val}% spent ($${Number(rule.spend).toFixed(2)} of $${Number(rule.budget).toFixed(2)})`;
              break;
            case 'ctr':
              message = `${rule.campaign_name}: CTR dropped to ${val}% (threshold: ${threshold}%)`;
              break;
            case 'roas':
              message = `${rule.campaign_name}: ROAS is ${val}x (below ${threshold}x threshold)`;
              break;
            default:
              message = `${rule.campaign_name}: ${rule.metric} at ${val} crossed threshold`;
          }

          // 5. Insert history
          const insertQuery = `
            INSERT INTO alert_history (
              campaign_id, rule_id, metric, message, current_value, threshold_value, severity
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
          `;
          const insertResult = await pool.query(insertQuery, [
            rule.campaign_id, rule.id, rule.metric, message, currentValue, threshold, severity
          ]);

          newlyTriggered.push(insertResult.rows[0]);
        }
      }
    }
  } catch (err) {
    console.error('Alert Engine checkAllAlerts error:', err);
  }

  return newlyTriggered;
};

/**
 * Starts the alert engine interval
 */
const startAlertEngine = (io) => {
  const intervalId = setInterval(async () => {
    const alerts = await checkAllAlerts();
    
    if (alerts.length > 0) {
      alerts.forEach(alert => {
        io.to(`campaign:${alert.campaign_id}`).emit('new_alert', alert);
      });
    }
    
    // Log check result
    // Note: To get rule count, we'd need to pass it from checkAllAlerts or query it here
    console.log(`Alert engine check: ${alerts.length} alerts fired`);
  }, 30000);

  return intervalId;
};

/**
 * Seeds default alert rules for active campaigns
 */
const seedDefaultRules = async () => {
  try {
    const campaigns = await pool.query("SELECT id FROM campaigns WHERE status = 'active' AND deleted_at IS NULL");
    
    for (const campaign of campaigns.rows) {
      const defaultRules = [
        { metric: 'ctr', operator: 'lt', threshold: 1.0 },
        { metric: 'spend_percent', operator: 'gt', threshold: 90.0 },
        { metric: 'roas', operator: 'lt', threshold: 1.5 }
      ];

      for (const rule of defaultRules) {
        await pool.query(
          `INSERT INTO alert_rules (campaign_id, metric, operator, threshold) 
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [campaign.id, rule.metric, rule.operator, rule.threshold]
        );
      }
    }
    console.log('Default alert rules seeded successfully');
  } catch (err) {
    console.error('seedDefaultRules error:', err);
  }
};

module.exports = {
  checkAllAlerts,
  startAlertEngine,
  seedDefaultRules
};
