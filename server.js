const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./models/db'); // Kết nối MySQL
const session = require('express-session');

dotenv.config({ path: './models/.env' });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình session để lưu đăng nhập tạm thời
app.use(session({
    secret: 'sfood_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Serve thư mục hiện tại làm static file (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '')));

// ==========================================
// 1. API SẢN PHẨM (PRODUCTS)
// ==========================================

// Lấy tất cả sản phẩm
app.get('/api/products/:id', async (req, res) => {
    try { const [rows] = await db.query('SELECT * FROM Products WHERE id = ? AND status = 1', [req.params.id]); if (!rows.length) return res.status(404).json({ error: 'Product not found' }); res.json(rows[0]); }
    catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Products');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Thêm sản phẩm mới (Dành cho Admin)
app.post('/api/products', async (req, res) => {
    try {
        const { title, img, category, price, desc_text } = req.body;
        const [result] = await db.query(
            'INSERT INTO Products (title, img, category, price, desc_text) VALUES (?, ?, ?, ?, ?)',
            [title, img, category, price, desc_text]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Xóa mềm sản phẩm (status = 0)
app.put('/api/products/:id', async (req, res) => {
    try {
        const { title, img, category, price, desc_text } = req.body;
        if (!title || !category || !Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ error: 'Invalid product data' });
        const [result] = await db.query('UPDATE Products SET title = ?, img = ?, category = ?, price = ?, desc_text = ? WHERE id = ?', [title.trim(), img || '', category.trim(), Number(price), desc_text || '', req.params.id]);
        if (!result.affectedRows) return res.status(404).json({ error: 'Product not found' });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});
app.delete('/api/products/:id', async (req, res) => {
    try {
        await db.query('UPDATE Products SET status = 0 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Khôi phục sản phẩm (status = 1)
app.put('/api/products/:id/restore', async (req, res) => {
    try {
        await db.query('UPDATE Products SET status = 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ==========================================
// 2. API NGƯỜI DÙNG (AUTH & USERS)
// ==========================================

// Đăng ký
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullname, phone, password } = req.body;
        
        // Kiểm tra số điện thoại đã tồn tại
        const [existing] = await db.query('SELECT * FROM Users WHERE phone = ?', [phone]);
        if(existing.length > 0) return res.status(400).json({ error: 'Số điện thoại đã được đăng ký' });

        await db.query(
            'INSERT INTO Users (fullname, phone, password, userType) VALUES (?, ?, ?, 0)',
            [fullname.trim(), phone.trim(), password]
        );
        res.json({ success: true, message: 'Đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Đăng nhập
app.post('/api/auth/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) return res.status(400).json({ error: 'Phone and password are required' });
        const [users] = await db.query('SELECT * FROM Users WHERE phone = ? AND password = ? AND status = 1', [phone, password]);
        
        if (users.length > 0) {
            res.json({ success: true, user: users[0] });
        } else {
            res.status(401).json({ error: 'Sai số điện thoại hoặc mật khẩu' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ==========================================
// 3. API ĐƠN HÀNG (ORDERS)
// ==========================================

// Khách hàng đặt hàng
app.post('/api/orders', async (req, res) => {
    try {
        const { user_id, cart_items, customer_name, customer_phone, customer_address, payment_method = 'cod' } = req.body;
        if (!Array.isArray(cart_items) || !cart_items.length) return res.status(400).json({ error: 'Cart is empty' });
        const ids = cart_items.map(item => Number(item.id)).filter(Boolean);
        const placeholders = ids.map(() => '?').join(',');
        const [products] = await db.query(`SELECT id, price FROM Products WHERE status = 1 AND id IN (${placeholders})`, ids);
        if (products.length !== ids.length) return res.status(400).json({ error: 'A product is unavailable' });
        const priceMap = new Map(products.map(p => [p.id, Number(p.price)]));
        const total_price = cart_items.reduce((sum, item) => sum + priceMap.get(Number(item.id)) * Math.max(1, Number(item.quantity || item.soLuong || 1)), 0);
        
        // Tạo đơn hàng chính
        const [orderResult] = await db.query(
            'INSERT INTO Orders (user_id, total_price, customer_name, customer_phone, customer_address, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id || null, total_price, customer_name || '', customer_phone || '', customer_address || '', payment_method]
        );
        const orderId = orderResult.insertId;

        // Lưu chi tiết từng món
        for(let item of cart_items) {
            await db.query(
                'INSERT INTO OrderDetails (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.id, Math.max(1, Number(item.quantity || item.soLuong || 1)), priceMap.get(Number(item.id))]
            );
        }

        res.json({ success: true, order_id: orderId, message: 'Đặt hàng thành công!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ==========================================
// 4. API THỐNG KÊ (ADMIN DASHBOARD)
// ==========================================
app.get('/api/admin/users', async (req, res) => {
    try { const [rows] = await db.query('SELECT id, fullname, phone, userType, status, created_at FROM Users ORDER BY created_at DESC'); res.json(rows); }
    catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/admin/users/:id/status', async (req, res) => {
    const status = Number(req.body.status);
    if (![0, 1].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    try { await db.query('UPDATE Users SET status = ? WHERE id = ? AND userType = 0', [status, req.params.id]); res.json({ success: true }); }
    catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/admin/orders', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT o.*, u.fullname, u.phone FROM Orders o LEFT JOIN Users u ON o.user_id = u.id ORDER BY o.created_at DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/admin/orders/:id', async (req, res) => {
    try {
        const [orders] = await db.query('SELECT o.*, u.fullname, u.phone FROM Orders o LEFT JOIN Users u ON o.user_id = u.id WHERE o.id = ?', [req.params.id]);
        if (!orders.length) return res.status(404).json({ error: 'Order not found' });
        const [items] = await db.query('SELECT d.*, p.title, p.img FROM OrderDetails d LEFT JOIN Products p ON d.product_id = p.id WHERE d.order_id = ?', [req.params.id]);
        res.json({ ...orders[0], items });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
    const allowed = ['Pending', 'Processing', 'Completed', 'Cancelled'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
    try { await db.query('UPDATE Orders SET status = ? WHERE id = ?', [req.body.status, req.params.id]); res.json({ success: true }); }
    catch (error) { res.status(500).json({ error: error.message }); }
});
app.get('/api/admin/dashboard', async (req, res) => {
    try {
        const [users] = await db.query('SELECT COUNT(*) as count FROM Users WHERE userType = 0');
        const [products] = await db.query('SELECT COUNT(*) as count FROM Products WHERE status = 1');
        const [revenue] = await db.query('SELECT SUM(total_price) as total FROM Orders WHERE status = "Completed"');

        res.json({
            customers: users[0].count,
            products: products[0].count,
            revenue: revenue[0].total || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Migration nho cho database da ton tai
db.query("ALTER TABLE Orders ADD COLUMN customer_name VARCHAR(255), ADD COLUMN customer_phone VARCHAR(30), ADD COLUMN customer_address VARCHAR(500), ADD COLUMN payment_method VARCHAR(30) DEFAULT 'cod'").catch(() => {});

// Chạy server
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`🚀 Server backend đang chạy tại http://localhost:${PORT}`);
});
