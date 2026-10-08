const mysql = require('mysql2/promise');
require('dotenv').config({ path: './models/.env' });

async function initDB() {
    try {
        // Kết nối ban đầu (không chọn database) để tạo database nếu chưa có
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('Đã kết nối tới MySQL server.');

        const dbName = process.env.DB_NAME || 'sfood_db';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`Đã tạo hoặc tìm thấy database: ${dbName}`);

        // Chuyển sang sử dụng database này
        await connection.query(`USE \`${dbName}\``);

        // 1. Bảng Users
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullname VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                userType INT DEFAULT 0, -- 0: User, 1: Admin
                status INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Đã tạo bảng Users.');

        // 2. Bảng Products
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                img VARCHAR(255),
                category VARCHAR(100),
                price INT NOT NULL,
                desc_text TEXT,
                status INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Đã tạo bảng Products.');

        // 3. Bảng Orders (Đơn hàng)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                total_price INT NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending', -- Pending, Processing, Completed, Cancelled
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL
            )
        `);
        console.log('Đã tạo bảng Orders.');

        // 4. Bảng OrderDetails (Chi tiết đơn hàng)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS OrderDetails (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                product_id INT,
                quantity INT DEFAULT 1,
                price INT NOT NULL,
                FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE SET NULL
            )
        `);
        console.log('Đã tạo bảng OrderDetails.');

        // 5. Khởi tạo dữ liệu mẫu (Admin & 1 vài sản phẩm) nếu chưa có
        const [adminRows] = await connection.query(`SELECT * FROM Users WHERE phone = 'admin'`);
        if (adminRows.length === 0) {
            // Chú ý: Ở hệ thống thực tế cần hash password (dùng bcrypt), 
            // hiện tại sẽ để dạng raw cho dễ test hoặc bạn có thể tự băm sau.
            await connection.query(`
                INSERT INTO Users (fullname, phone, password, userType) 
                VALUES ('Quản trị viên', 'admin', 'admin', 1)
            `);
            console.log('Đã thêm tài khoản Admin mặc định (phone: admin, password: admin)');
        }

        await connection.query("UPDATE Users SET password = 'user123', status = 1, fullname = 'Khach hang mau' WHERE phone = 'user'");

        const [productRows] = await connection.query(`SELECT * FROM Products`);
        if (productRows.length === 0) {
            const sampleProducts = [
                ['Nấm đùi gà xào cháy tỏi', './assets/img/products/nam-dui-ga-chay-toi.jpeg', 'Món mặn', 200000, 'Một Món chay ngon miệng với nấm đùi gà thái chân hương, xào săn với lửa và thật nhiều tỏi băm'],
                ['Trà phô mai kem sữa', './assets/img/products/tra-pho-mai-kem-sua.jpg', 'Nước uống', 34000, 'Vừa béo ngậy, chua ngọt đủ cả mà vẫn có vị thanh của trà.'],
                ['Bánh chuối nướng', './assets/img/products/banh-chuoi-nuong.jpeg', 'Món tráng miệng', 60000, 'Bánh chuối nướng béo ngậy mùi nước cốt dừa cùng miếng chuối mềm ngon']
            ];
            for (let p of sampleProducts) {
                await connection.query(`
                    INSERT INTO Products (title, img, category, price, desc_text)
                    VALUES (?, ?, ?, ?, ?)
                `, p);
            }
            console.log('Đã thêm một vài sản phẩm mẫu.');
        }

        console.log('✅ KHỞI TẠO DATABASE THÀNH CÔNG!');
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi khởi tạo Database:', error);
        process.exit(1);
    }
}

initDB();
