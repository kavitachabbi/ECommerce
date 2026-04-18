const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'ecoloop_v2.sqlite');
const db = new Database(dbPath, { verbose: console.log });

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    champion_points INTEGER DEFAULT 420,
    is_admin INTEGER DEFAULT 0, -- 0 for User, 1 for Admin
    rank_history TEXT DEFAULT '[]', -- JSON string
    eco_badges TEXT DEFAULT '[]' -- JSON string
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price_inr REAL,
    condition_score INTEGER,
    mode TEXT CHECK(mode IN ('Sale', 'Swap', 'Rent')),
    image_url TEXT,
    category TEXT,
    description TEXT,
    owner_id INTEGER,
    status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
    FOREIGN KEY (owner_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS transaction_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- Buy, Rent, Swap
    product_id INTEGER,
    requester_id INTEGER,
    amount REAL,
    status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (requester_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER,
    total_amount REAL,
    admin_commission REAL,
    seller_payout REAL,
    status TEXT DEFAULT 'Success',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES transaction_requests (id)
  );

  CREATE TABLE IF NOT EXISTS food_rescue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant TEXT NOT NULL,
    items TEXT NOT NULL,
    amount TEXT,
    status TEXT DEFAULT 'Pending',
    expiry_date TEXT,
    donor_id INTEGER,
    ngo_link_id INTEGER,
    FOREIGN KEY (donor_id) REFERENCES users (id),
    FOREIGN KEY (ngo_link_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS upcycling_gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    creator_id INTEGER,
    FOREIGN KEY (creator_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id TEXT NOT NULL,
    sender_id INTEGER,
    receiver_id INTEGER,
    message TEXT,
    timestamp TEXT
  );

`);

// Seed Data helper
const seedUsers = db.prepare('INSERT OR IGNORE INTO users (name, email, champion_points) VALUES (?, ?, ?)');
const seedProducts = db.prepare('INSERT OR IGNORE INTO products (name, price_inr, condition_score, mode, image_url, category, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

// Transactional Seeding
const seed = db.transaction(() => {
  seedUsers.run('Priya S.', 'priya@example.com', 420);
  seedUsers.run('Aryan M.', 'aryan@example.com', 380);
  
  // Seed Admin
  db.prepare('INSERT OR IGNORE INTO users (name, email, champion_points, is_admin) VALUES (?, ?, ?, ?)').run('Admin Master', 'admin@ecoloop.com', 1000, 1);
  
  // Only seed if products table is empty
  const count = db.prepare('SELECT count(*) as count FROM products').get().count;
  if (count === 0) {
    const data = [
      ['Multi-layered Wedding Gown', 17000, 9, 'Rent', 'https://images.unsplash.com/photo-1594552072238-16440db7f904?w=600&q=80', 'Apparel', 'High-fidelity sustainable fashion', 'Approved'],
      ['iPhone 14 Pro Max', 85000, 9, 'Sale', 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=600&q=80', 'Tech', 'Refurbished Excellence', 'Approved'],
      ['Reclaimed Wood Table', 32000, 9, 'Sale', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', 'Furniture', 'Saves 47kg CO2', 'Approved'],
      ['Organic Bamboo Utensils', 1200, 10, 'Sale', 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=600&q=80', 'Kitchen', '100% Biodegradable', 'Approved'],
      ['Hand-woven Cotton Kurta', 2500, 9, 'Sale', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80', 'Apparel', 'Artisan crafted, indigo dyed', 'Approved'],
      ['Solar Power Bank', 4500, 8, 'Swap', 'https://images.unsplash.com/photo-1617719116053-47004c31bc4c?w=600&q=80', 'Tech', 'Renewable energy on the go', 'Approved'],
    ];
    for (const p of data) seedProducts.run(...p);
  }
});

seed();

module.exports = db;
