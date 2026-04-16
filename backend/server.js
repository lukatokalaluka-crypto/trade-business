const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build folder
app.use(express.static(path.join(__dirname, '../frontend/dist'))); // Change to your build folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secure-random-string-here',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true 
  }
}));

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for most cloud DBs like Vercel Postgres/Supabase
});

// Initialize Database Table
const initDb = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price TEXT NOT NULL,
      image TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT
    );
  `;
  try {
    await pool.query(query);
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Database init error:", err);
  }
};
initDb();

// Admin middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.isAdmin) {
    return next();
  }
  res.redirect('/admin');
};

// API Admin middleware - returns JSON instead of redirecting
const isAdminApi = (req, res, next) => {
  if (req.session.isAdmin) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Unauthorized access' });
};

// Admin Routes
app.get('/admin', (req, res) => {
  if (req.session.isAdmin) {
    res.redirect('/admin/dashboard');
  } else {
    res.render('admin/login', { error: null });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  // Professional check for complete entry (handles null, undefined, and whitespace)
  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Incomplete entry: Both email and password are required to access the dashboard.' 
    });
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'business@gmail.com';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || '123456';

  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    res.json({ success: true, token: 'admin-token-123' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
});

app.get('/admin/dashboard', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.render('admin/dashboard', { 
      websiteName: 'HHMediabusiness',
      products: result.rows 
    });
  } catch (err) {
    res.status(500).send("Error loading dashboard");
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin');
});

app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// API Routes
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const countRes = await pool.query('SELECT COUNT(*) FROM products');
    const productsRes = await pool.query(
      'SELECT * FROM products ORDER BY id DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const totalProducts = parseInt(countRes.rows[0].count);
    
    res.json({ 
      products: productsRes.rows, 
      totalProducts, 
      totalPages: Math.ceil(totalProducts / limit), 
      currentPage: page 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/products', isAdminApi, async (req, res) => {
  try {
    const { name, price, image, category, description } = req.body;
    const result = await pool.query(
      'INSERT INTO products (name, price, image, category, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, price, image, category, description || '']
    );
    res.json({ success: true, product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/products/:id', isAdminApi, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, price, image, category, description } = req.body;
    const result = await pool.query(
      'UPDATE products SET name=$1, price=$2, image=$3, category=$4, description=$5 WHERE id=$6',
      [name, price, image, category, description || '', id]
    );
    
    if (result.rowCount > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/products/:id', isAdminApi, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Catch-all route to serve React's index.html for non-API requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
console.log(`Admin API: http://localhost:${PORT}/api/login (email: business@gmail.com, pass: 123456)`);
  console.log(`API: http://localhost:${PORT}/api/products`);
});
