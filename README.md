# AdPulse — Full Stack Developer Assessment

🔗 Live Demo: https://ad-pulse-seven.vercel.app/
💻 GitHub: https://github.com/abdul-haseeb5786/AdPulse-

---

## Section 1 — Frontend

### Task 1.1 — Campaign Dashboard
- React 18 + Tailwind CSS
- KPI cards: Impressions, Clicks, CTR, Conversions, Spend, ROAS
- 30-day performance trend chart (Recharts)
- Sortable + filterable campaign table with status badges
- Date range picker (7d, 30d, 90d, Custom)
- Dark mode (persisted in localStorage)
- Fully responsive: 1440px, 1024px, 768px

### Task 1.2 — AI Creative Brief Builder
- 4-step multi-step form with validation
- AI integration via OpenRouter API (claude-sonnet-4-5)
- Structured creative direction output
- PDF export using html2canvas + jsPDF

---

## Section 2 — Backend

### Task 2.1 — Campaign Management REST API
- Node.js + Express + PostgreSQL
- Full CRUD with soft delete (deleted_at timestamp)
- JWT authentication on all endpoints
- Input validation via express-validator
- Rate limiting: 100 req/min per IP
- OpenAPI spec included (openapi.yaml)

### Task 2.2 — AI Content Generation Microservice
- Standalone Express microservice on port 5000
- POST /generate/copy — SSE streaming response
- POST /generate/social — 5 platform-native captions
- POST /generate/hashtags — 10 hashtags with volume tags
- GET /health — service status
- Dockerized (Dockerfile + docker-compose.yml)
- Request/response logging with unique request IDs
- OpenRouter API (no Anthropic SDK dependency)

### Task 2.3 — Real-Time Notification System
- Socket.io WebSocket server
- Alert rule engine: configurable thresholds per campaign
- Triggers: CTR < 1%, budget spend > 90%, ROAS < 1.5
- Alert history persisted in PostgreSQL
- React notification center: bell icon, dropdown, unread badge

---

## Section 3 — Speed Tasks

### Q1 — Debug Express API (4 bugs + SQL injection)

**Bugs found and fixed:**
```js
// BUG 1: res.send(users) → should be res.json(users.rows)
// BUG 2: No try/catch → unhandled promise rejections on all routes
// BUG 3: SQL injection in GET /users/:id via string concatenation
// BUG 4: SQL injection in POST /users INSERT via string concatenation

// FIXED — parameterized queries used throughout
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await db.query(
      'SELECT * FROM users WHERE id = $1', [id]
    )
    if (user.rows.length === 0)
      return res.status(404).json({ error: 'User not found' })
    res.json(user.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

router.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body
    if (!name || !email)
      return res.status(400).json({ error: 'name and email are required' })
    const result = await db.query(
      'INSERT INTO users (name, email) VALUES($1, $2) RETURNING *',
      [name, email]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' })
  }
})
```

---

### Q2 — useDebounce Custom Hook
```js
import { useState, useEffect } from 'react'

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
```

**Usage:** Delays API call by 300ms after user stops typing.
Each keystroke resets the timer — only 1 API call fires instead of many.

---

### Q3 — Top 5 Campaigns by ROAS per Client (Last 30 Days)
```sql
WITH campaign_roas AS (
  SELECT
    c.id,
    c.name AS campaign_name,
    cl.name AS client_name,
    ROUND(
      CASE WHEN c.spend > 0 THEN c.revenue / c.spend ELSE 0 END, 2
    ) AS roas,
    RANK() OVER (
      PARTITION BY c.client_id
      ORDER BY
        CASE WHEN c.spend > 0 THEN c.revenue / c.spend ELSE 0 END DESC
    ) AS rank_within_client
  FROM campaigns c
  JOIN clients cl ON c.client_id = cl.id
  WHERE
    c.deleted_at IS NULL
    AND c.status != 'draft'
    AND c.created_at >= NOW() - INTERVAL '30 days'
    AND c.spend > 0
)
SELECT client_name, campaign_name, roas, rank_within_client AS rank
FROM campaign_roas
WHERE rank_within_client <= 5
ORDER BY client_name, rank_within_client;
```

**Approach:** CTE + `RANK() OVER (PARTITION BY client_id)` 
ranks campaigns within each client by ROAS descending.
Outer query filters top 5 per client.

---

### Q4 — React Performance Optimization

**Problems identified via React DevTools:**
1. `CampaignRow` re-renders on every parent state change
2. `handleDelete` recreated every render — breaks `memo()` comparison
3. `formatCurrency` and `getStatusColor` recreated inside component unnecessarily
4. Inline arrow function in `onClick` creates new reference each render

**Fixes applied:**
```jsx
import { useState, useCallback, memo } from 'react'

// FIX 3: Pure functions moved outside component
const formatCurrency = (amount) => '$' + amount.toLocaleString()
const STATUS_COLORS = { active:'green', paused:'yellow', ended:'red', draft:'gray' }

// FIX 1: memo() prevents re-render if props unchanged
const CampaignRow = memo(({ campaign, onDelete }) => {
  const handleDelete = () => onDelete(campaign.id) // FIX 4
  return (
    <tr>
      <td>{campaign.name}</td>
      <td>{formatCurrency(campaign.spend)}</td>
      <td style={{ color: STATUS_COLORS[campaign.status] }}>{campaign.status}</td>
      <td><button onClick={handleDelete}>Delete</button></td>
    </tr>
  )
})

const CampaignTable = ({ campaigns }) => {
  const [count, setCount] = useState(0)

  // FIX 2: useCallback keeps same reference between renders
  const handleDelete = useCallback((id) => {
    console.log('Delete:', id)
  }, [])

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Re-render: {count}</button>
      <table><tbody>
        {campaigns.map(c => (
          <CampaignRow key={c.id} campaign={c} onDelete={handleDelete} />
        ))}
      </tbody></table>
    </div>
  )
}
```

**Result:** Parent re-renders no longer cause CampaignRow re-renders.

---

### Q5 — AI-Assisted CRUD Scaffolding (Cursor AI)

**Prompt given to Cursor:**

> Scaffold a complete Express.js CRUD route for a "clients" resource
> using PostgreSQL. Use existing pool from db/pool.js, auth middleware,
> and express-validator. Endpoints: GET /clients, POST /clients,
> GET /clients/:id, PUT /clients/:id, DELETE /clients/:id (soft delete).
> Parameterized queries only. Try/catch on all functions.
> Follow same pattern as existing campaigns route.

**Generated in under 10 minutes:**
- `clientController.js` with 5 functions
- `clients.js` router with validation rules
- `app.js` mount line

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Tailwind CSS, Recharts |
| Backend | Node.js, Express, PostgreSQL |
| Auth | JWT |
| AI | OpenRouter API (claude-sonnet-4-5) |
| Realtime | Socket.io |
| DevOps | Docker, docker-compose, Vercel |

---

## Running Locally
```bash
# Frontend
cd client && npm install && npm run dev

# Backend API
cd server && npm install && npm run dev

# AI Microservice
cd microservice && npm install && npm run dev
```

Environment variables required:
- `VITE_API_URL` — backend URL
- `VITE_MICROSERVICE_URL` — microservice URL  
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — JWT signing secret
- `OPENROUTER_API_KEY` — OpenRouter API key
