const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Task 2: Middleware for Currency Formatting
const currencyFormatter = (req, res, next) => {
    const originalJson = res.json;
    res.json = function(data) {
        if (Array.isArray(data)) {
            data = data.map(item => {
                if (item && item.price_inr) {
                    item.formatted_price = `₹${item.price_inr.toLocaleString('en-IN')}`;
                }
                return item;
            });
        } else if (data && data.price_inr) {
            data.formatted_price = `₹${data.price_inr.toLocaleString('en-IN')}`;
        }
        return originalJson.call(this, data);
    };
    next();
};

app.use(currencyFormatter);

// ── AUTHENTICATION ─────────────────────────────
app.post('/api/login', (req, res) => {
    const { email } = req.body;
    let user = db.prepare('SELECT id, name, email, champion_points, is_admin FROM users WHERE email = ?').get(email);
    
    if (!user) {
        // Auto-Provisioning: Create user if not found
        const name = email.split('@')[0];
        const info = db.prepare('INSERT INTO users (name, email, champion_points, is_admin) VALUES (?, ?, ?, 0)')
                       .run(name, email, 420);
        user = {
            id: info.lastInsertRowid,
            name: name,
            email: email,
            champion_points: 420,
            is_admin: 0
        };
        console.log(`🌿 Auto-Provisioned new Guardian: ${email}`);
    }
    
    res.json({ 
        success: true, 
        user: {
            id: user.id,
            name: user.name,
            points: user.champion_points,
            role: user.is_admin === 1 ? 'Admin' : 'User'
        }
    });
});

// ── MARKETPLACE CONTROLLER ─────────────────────────────
app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not Found' });
    res.json(product);
});

// ── FOOD RESCUE CONTROLLER ─────────────────────────────
app.get('/api/food-rescue', (req, res) => {
    const items = db.prepare('SELECT * FROM food_rescue ORDER BY id DESC').all();
    res.json(items);
});

app.post('/api/food-rescue', (req, res) => {
    const { restaurant, items, amount, expiry_date, donor_id } = req.body;
    const info = db.prepare('INSERT INTO food_rescue (restaurant, items, amount, expiry_date, donor_id) VALUES (?, ?, ?, ?, ?)')
                   .run(restaurant, items, amount, expiry_date, donor_id);
    res.status(201).json({ id: info.lastInsertRowid, message: 'Listed!' });
});

// Task 2: NGO Handshake (POST /api/food/accept)
app.post('/api/food/accept', (req, res) => {
    const { rescue_id, ngo_id } = req.body;
    const info = db.prepare("UPDATE food_rescue SET status = 'Accepted', ngo_link_id = ? WHERE id = ?")
                   .run(ngo_id, rescue_id);
    
    if (info.changes === 0) return res.status(404).json({ error: 'Rescue listing not found' });
    res.json({ success: true, message: 'NGO Handshake Complete. Donor Notified.' });
});

// ── HUB & GAMIFICATION ───────────────────────────────
app.get('/api/users/:id', (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (user) {
        user.rank_history = JSON.parse(user.rank_history);
        user.eco_badges = JSON.parse(user.eco_badges);
    }
    res.json(user);
});

app.patch('/api/users/:id/points', (req, res) => {
    const { points } = req.body;
    const user = db.prepare('SELECT champion_points, rank_history FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newPoints = user.champion_points + points;
    const history = JSON.parse(user.rank_history);
    history.push({ ts: new Date().toISOString(), points: newPoints });

    db.prepare('UPDATE users SET champion_points = ?, rank_history = ? WHERE id = ?')
      .run(newPoints, JSON.stringify(history), req.params.id);
    
    res.json({ champion_points: newPoints });
});

// User Portal Data
app.get('/api/user/dashboard/:id', (req, res) => {
    const { id } = req.params;
    const user = db.prepare('SELECT champion_points, name FROM users WHERE id = ?').get(id);
    const rescues = db.prepare('SELECT count(*) as count FROM food_rescue WHERE donor_id = ?').get(id).count;
    const active_swaps = db.prepare('SELECT count(*) as count FROM products WHERE owner_id = ? AND mode = ?').get(id, 'Swap').count;
    
    res.json({
        points: user?.champion_points || 0,
        name: user?.name,
        carbon_saved: rescues * 2.5 + active_swaps * 1.2, // Mock calculation
        rescues,
        active_swaps
    });
});

app.get('/api/admin/overview', (req, res) => {
    const total_products = db.prepare('SELECT count(*) as count FROM products').get().count;
    const total_rescues = db.prepare('SELECT count(*) as count FROM food_rescue').get().count;
    const total_points = db.prepare('SELECT sum(champion_points) as sum FROM users').get().sum || 0;
    const user_count = db.prepare('SELECT count(*) as count FROM users').get().count;
    
    res.json({ 
        total_products, 
        total_rescues, 
        total_eco_points: total_points,
        user_count,
        food_saved_kg: total_rescues * 5.8 // Mock aggregate
    });
});

// --- Unified Master Data Endpoint ---
app.get('/api/all-data', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    const food = db.prepare('SELECT * FROM food_rescue').all();
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get();
    
    res.json({
      marketplace: products,
      foodRescue: food,
      userMetrics: {
        points: user?.champion_points || 420,
        rank: user?.rank || 'Seedling',
        history: user?.rank_history ? JSON.parse(user.rank_history) : []
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── MARKETPLACE & TRANSACTIONS ───────────────
app.get('/api/products', (req, res) => {
    // Only show Approved products to public
    const products = db.prepare('SELECT * FROM products WHERE status = "Approved"').all();
    res.json(products);
});

app.post('/api/products', (req, res) => {
    const { name, price_inr, condition_score, mode, image_url, category, description, owner_id } = req.body;
    db.prepare('INSERT INTO products (name, price_inr, condition_score, mode, image_url, category, description, owner_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "Pending")')
      .run(name, price_inr, condition_score, mode, image_url, category, description, owner_id || 1);
    res.json({ success: true, message: 'Listing submitted for Admin review.' });
});

app.post('/api/products/request', (req, res) => {
    const { type, product_id, requester_id, amount } = req.body;
    db.prepare('INSERT INTO transaction_requests (type, product_id, requester_id, amount, status) VALUES (?, ?, ?, ?, "Pending")')
      .run(type, product_id, requester_id || 1, amount);
    res.json({ success: true, message: 'Transaction request sent to Admin.' });
});

// ── ADMIN OVERSIGHT ───────────────────────────
app.get('/api/admin/requests', (req, res) => {
    const requests = db.prepare(`
        SELECT r.*, p.name as product_name, u.name as requester_name 
        FROM transaction_requests r
        JOIN products p ON r.product_id = p.id
        JOIN users u ON r.requester_id = u.id
        ORDER BY r.created_at DESC
    `).all();
    res.json(requests);
});

// ── FINANCIAL CONTROLLER (10/90 SPLIT) ────────
const processFinancialClearance = (amount) => {
    const total = parseFloat(amount) || 0;
    return {
        admin_split: total * 0.10,
        seller_split: total * 0.90,
        currency: 'INR',
        processed_at: new Date().toISOString()
    };
};

app.post('/api/admin/requests/:id/approve', (req, res) => {
    const { id } = req.params;
    
    try {
        const request = db.prepare('SELECT * FROM transaction_requests WHERE id = ?').get(id);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        const split = processFinancialClearance(request.amount);

        db.transaction(() => {
            // 1. Authorize Request
            db.prepare('UPDATE transaction_requests SET status = "Approved" WHERE id = ?').run(id);
            
            // 2. Mark Product as Sold/Rescued
            db.prepare('UPDATE products SET status = "Rescued" WHERE id = ?').run(request.product_id);
            
            // 3. Log Secure Transaction Ledger
            db.prepare(`
                INSERT INTO transactions (request_id, total_amount, admin_commission, seller_payout, status) 
                VALUES (?, ?, ?, ?, 'Success')
            `).run(id, request.amount, split.admin_split, split.seller_split);
        })();

        res.json({ 
            success: true, 
            message: 'Request Authorized. Financial split logged.',
            clearance: split 
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/admin/finances', (req, res) => {
    // Strictly for Admins and Financial Analysts
    const stats = db.prepare(`
        SELECT 
            SUM(total_amount) as gross_volume,
            SUM(admin_commission) as total_commission,
            SUM(seller_payout) as total_payouts,
            COUNT(*) as transaction_count
        FROM transactions WHERE status = 'Success'
    `).get();

    const recent = db.prepare(`
        SELECT t.*, p.name as product_name, u.name as seller_name
        FROM transactions t
        JOIN transaction_requests r ON t.request_id = r.id
        JOIN products p ON r.product_id = p.id
        JOIN users u ON p.owner_id = u.id
        ORDER BY t.created_at DESC LIMIT 10
    `).all();

    res.json({ metrics: stats, history: recent });
});

app.get('/api/seller/metrics/:id', (req, res) => {
    const { id } = req.params;
    const metrics = db.prepare(`
        SELECT 
            SUM(t.seller_payout) as my_earnings,
            COUNT(t.id) as units_sold
        FROM transactions t
        JOIN transaction_requests r ON t.request_id = r.id
        JOIN products p ON r.product_id = p.id
        WHERE p.owner_id = ?
    `).get(id);

    res.json(metrics);
});

app.listen(PORT, () => {

    console.log(`🌿 EcoLoop Express Server (Better-SQLite3) on http://localhost:${PORT}`);
});
