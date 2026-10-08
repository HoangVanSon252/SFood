const mysql = require('mysql2/promise');
require('dotenv').config({ path: './models/.env' });

async function seedData() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sfood_db'
        });

        console.log('Đang dọn dẹp dữ liệu cũ...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE OrderDetails');
        await connection.query('TRUNCATE TABLE Orders');
        await connection.query('TRUNCATE TABLE Products');
        await connection.query('TRUNCATE TABLE Users');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Tạo tài khoản Admin và User...');
        // 1. Tạo 1 Admin
        await connection.query(`
            INSERT INTO Users (fullname, phone, password, userType) 
            VALUES ('Quản trị viên', 'admin', 'admin', 1)
        `);
        // 2. Tạo 1 User
        await connection.query(`
            INSERT INTO Users (fullname, phone, password, userType) 
            VALUES ('Khách hàng Test', 'user', 'user', 0)
        `);
        console.log('Đã tạo tài khoản: \n- Admin: SĐT "admin", Mật khẩu "admin"\n- User: SĐT "user", Mật khẩu "user"');

        console.log('Đang tạo 100 sản phẩm...');
        const categories = ['Món chay', 'Món mặn', 'Món lẩu', 'Món ăn vặt', 'Món tráng miệng', 'Nước uống'];
        const images = [
            './assets/img/products/nam-dui-ga-chay-toi.jpeg',
            './assets/img/products/lau_thai.jpg',
            './assets/img/products/tra-pho-mai-kem-sua.jpg',
            './assets/img/products/banh-chuoi-nuong.jpeg'
        ];

        for (let i = 1; i <= 100; i++) {
            const cat = categories[Math.floor(Math.random() * categories.length)];
            const img = images[Math.floor(Math.random() * images.length)];
            const price = (Math.floor(Math.random() * 20) + 1) * 10000; // Giá từ 10k - 200k
            const title = `${cat} đặc biệt số ${i}`;
            const desc = `Đây là một món ăn thơm ngon thuộc loại ${cat}. Được làm từ nguyên liệu sạch và công thức độc quyền, sản phẩm số ${i} chắc chắn sẽ làm bạn hài lòng.`;

            await connection.query(`
                INSERT INTO Products (title, img, category, price, desc_text)
                VALUES (?, ?, ?, ?, ?)
            `, [title, img, cat, price, desc]);
        }

        console.log('✅ ĐÃ TẠO XONG 100 SẢN PHẨM MẪU VÀ TÀI KHOẢN!');
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

seedData();
