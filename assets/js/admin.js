function vnd(price) {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Kiểm tra đăng nhập
function checkLogin() {
    let currentUser = JSON.parse(localStorage.getItem("currentuser"));
    if(currentUser == null || currentUser.userType == 0) {
        document.querySelector("body").innerHTML = `<div class="access-denied-section">
            <img class="access-denied-img" src="../assets/img/logo.png" alt="Access Denied">
            <h1 style="text-align:center; color: red;">BẠN KHÔNG CÓ QUYỀN TRUY CẬP</h1>
        </div>`;
    } else {
        document.getElementById("name-acc").innerHTML = currentUser.fullname;
    }
}
window.onload = () => {
    checkLogin();
    loadDashboardStats();
};

const sidebars = document.querySelectorAll(".sidebar-list-item.tab-content");
for(let i = 0; i < sidebars.length; i++) {
    sidebars[i].onclick = function () {
        document.querySelector(".sidebar-list-item.active").classList.remove("active");
        sidebars[i].classList.add("active");
    };
}                                                                                                                                                       

const itemsPerPage = 5; 
let currentPage = 1;
let globalProducts = [];

// API: Gọi Dashboard Stats
async function loadDashboardStats() {
    try {
        const res = await fetch('/api/admin/dashboard');
        const data = await res.json();
        document.getElementById('amount-user').innerText = data.customers || 0;
        document.getElementById('amount-product').innerText = data.products || 0;
        document.getElementById('doanh-thu').innerText = vnd(data.revenue || 0);
    } catch (err) {
        console.error("Lỗi tải thống kê", err);
    }
}

// API: Gọi tất cả sản phẩm
async function fetchProducts() {
    try {
        const res = await fetch('/api/products');
        const data = await res.json();
        globalProducts = data;
        displayList(globalProducts, currentPage, itemsPerPage);
        setupPagination(globalProducts.length, itemsPerPage);
    } catch (err) {
        console.error("Lỗi lấy sản phẩm", err);
    }
}

function renderProducts(products) {
    let productHtml = '';
    if (!products || products.length === 0) {
        document.getElementById("show-product").style.display = "none";
        productHtml = `<div class="no-result">
                <div class="no-result-h">Không tìm thấy sản phẩm</div>
            </div>`;
    } else {
        document.getElementById("show-product").style.display = "block";
        products.forEach((product) => {
            productHtml += `<div class="list" data-id="${product.id}">
                <div class="list-left">
                    <img src="${product.img || '../assets/img/logo.png'}" alt="">
                    <div class="list-info">
                        <h4>${product.title}</h4>
                        <p class="list-note">${product.desc_text || ''}</p>
                        <span class="list-category">${product.category}</span>
                    </div>
                </div>
                <div class="list-right">
                    <div class="list-price">
                        <span class="list-current-price">${vnd(product.price)}</span>                   
                    </div>
                    <div class="list-control">
                        <div class="list-tool">
                            ${product.status === 0 
                                ? `<button class="btn-restore" onclick="restoreProduct(${product.id})"><i class="fa-solid fa-undo"></i> Khôi phục</button>`
                                : `<button class="btn-delete" onclick="deleteProduct(${product.id})"><i class="fa-solid fa-trash"></i> Xóa</button>`
                            }
                        </div>                       
                    </div>
                </div> 
            </div>`;
        });
    }
    document.getElementById('show-product').innerHTML = productHtml;    document.getElementById('show-product').querySelectorAll('.list').forEach((item) => {
        const product = globalProducts.find(p => Number(p.id) === Number(item.dataset.id));
        if (!product || Number(product.status) === 0) return;
        const tools = item.querySelector('.list-tool');
        const edit = document.createElement('button');
        edit.className = 'btn-edit';
        edit.type = 'button';
        edit.textContent = 'Sua';
        edit.addEventListener('click', () => editProduct(product.id));
        tools.prepend(edit);
    });
}

function displayList(products, currentPage, itemsPerPage) {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = products.slice(start, end);
    renderProducts(paginatedProducts);
}

function setupPagination(totalProducts, itemsPerPage) {
    const pageNavList = document.querySelector('.page-nav-list');
    pageNavList.innerHTML = ''; 

    const pageCount = Math.ceil(totalProducts / itemsPerPage);
    for (let page = 1; page <= pageCount; page++) {
        let node = document.createElement('li');
        node.classList.add('page-nav-item');
        node.innerHTML = `<a href="javascript:;">${page}</a>`;
        
        if (currentPage === page) {
            node.classList.add('active');
        }

        node.addEventListener('click', function () {
            currentPage = page;
            displayList(globalProducts, currentPage, itemsPerPage); 

            let t = document.querySelectorAll('.page-nav-item.active');
            for (let i = 0; i < t.length; i++) {
                t[i].classList.remove('active');
            }
            node.classList.add('active');
        });

        pageNavList.appendChild(node); 
    }
}

// Xóa mềm sản phẩm qua API
async function deleteProduct(id) {
    if (confirm("Bạn có chắc muốn xóa?") === true) {
        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
            showToast({title: 'Thành công!', message: 'Xóa thành công', type: 'success'});
            fetchProducts(); // Cập nhật lại danh sách
        } catch (err) {
            console.error("Lỗi xóa", err);
        }
    }
}

// Khôi phục sản phẩm qua API
async function restoreProduct(id) {
    try {
        await fetch(`/api/products/${id}/restore`, { method: 'PUT' });
        showToast({title: 'Thành công!', message: 'Khôi phục thành công', type: 'success'});
        fetchProducts(); // Cập nhật lại danh sách
    } catch (err) {
        console.error("Lỗi khôi phục", err);
    }
}

document.getElementById('btn-add-product')?.addEventListener('click', async () => {
    const title = prompt('Tên sản phẩm:'); if (!title) return;
    const category = prompt('Danh mục:', 'Món ăn'); if (!category) return;
    const price = Number(prompt('Giá (VND):', '50000')); if (!Number.isFinite(price) || price < 0) return alert('Giá không hợp lệ');
    const img = prompt('Đường dẫn ảnh:', './assets/img/logo.png') || './assets/img/logo.png';
    const desc_text = prompt('Mô tả:', '') || '';
    const res = await fetch('/api/products', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({title, category, price, img, desc_text}) });
    const data = await res.json(); if (!res.ok) return alert(data.error || 'Không thể thêm sản phẩm');
    showToast({title:'Thành công!', message:'Đã thêm sản phẩm', type:'success'}); fetchProducts();
});

document.querySelectorAll('.sidebar-list-item').forEach((item, index) => {
    item.addEventListener('click', function() {
        if (index === 0) {
            showOverview(); 
        } else if (index === 1) {
            showAllProducts(); 
       } else if (index === 2) {
            showCustomers();
       } else if (index === 3) {
            showOrders();
       }
    });
});

function showOverview() {
    document.getElementById('product-all').style.display = 'none';
    document.getElementById('customer-all').style.display = 'none';
    document.getElementById('order-all').style.display = 'none';
    document.getElementById('overview').style.display = 'block';
    loadDashboardStats();
}

function showAllProducts() {
    document.getElementById('customer-all').style.display = 'none';
    document.getElementById('order-all').style.display = 'none';
    document.getElementById('product-all').style.display = 'block';
    document.getElementById('overview').style.display = 'none';
    fetchProducts();
}

// Lọc sản phẩm
function filterProduct(event) {
    event.preventDefault();
    let searchCategorySelect = document.getElementById('the-loai').value;
    let filteredProducts = globalProducts;

    if (searchCategorySelect === "Đã xóa") {
        filteredProducts = filteredProducts.filter(item => item.status === 0);
    } else if (searchCategorySelect !== "Tất cả") {
        filteredProducts = filteredProducts.filter(product => 
            product.category.toUpperCase() === searchCategorySelect.toUpperCase() && product.status !== 0
        );
    } else {
        filteredProducts = filteredProducts.filter(product => product.status !== 0);
    }

    if (event.target.id === 'btn-cancel-product') {
        document.getElementById('the-loai').value = 'Tất cả';
        filteredProducts = globalProducts.filter(product => product.status !== 0); 
    }

    currentPage = 1;
    displayList(filteredProducts, currentPage, itemsPerPage);
    setupPagination(filteredProducts.length, itemsPerPage);
}

function searchProduct() {
    let search = document.getElementById('form-search-product').value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let producstSearch = globalProducts.filter(value => {
        return value.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(search);
    });
    currentPage = 1;
    displayList(producstSearch, currentPage, itemsPerPage);
    setupPagination(producstSearch.length, itemsPerPage);
}

document.getElementById('form-search-product').addEventListener('keypress', function (even) {
    if (even.key === 'Enter') {
        event.preventDefault();
        searchProduct();
    }
});

// Đăng xuất Admin
document.getElementById('logout-acc').addEventListener('click', () => {
    localStorage.removeItem('currentuser');
    window.location.href = '../index.html';
});

async function editProduct(id) {
    const product = globalProducts.find(item => Number(item.id) === Number(id));
    if (!product) return;
    const title = prompt('Ten san pham:', product.title); if (!title) return;
    const category = prompt('Danh muc:', product.category); if (!category) return;
    const price = Number(prompt('Gia (VND):', product.price)); if (!Number.isFinite(price) || price < 0) return alert('Gia khong hop le');
    const img = prompt('Duong dan anh:', product.img || '') || '';
    const desc_text = prompt('Mo ta:', product.desc_text || '') || '';
    const response = await fetch(`/api/products/${id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({title, category, price, img, desc_text}) });
    const data = await response.json();
    if (!response.ok) return alert(data.error || 'Khong the cap nhat san pham');
    showToast({title: 'Thanh cong!', message: 'Da cap nhat san pham', type: 'success'});
    fetchProducts();
}
async function loadCustomers() {
    const response = await fetch('/api/admin/users');
    const users = await response.json();
    document.getElementById('show-customer').innerHTML = users.filter(user => Number(user.userType) === 0).map(user => `<div class="list"><div class="list-left"><div class="list-info"><h4>${user.fullname}</h4><p>${user.phone}</p><span>${Number(user.status) ? 'Dang hoat dong' : 'Da khoa'}</span></div></div><div class="list-right"><button class="btn-${Number(user.status) ? 'delete' : 'restore'}" onclick="changeUserStatus(${user.id}, ${Number(user.status) ? 0 : 1})">${Number(user.status) ? 'Khoa' : 'Mo khoa'}</button></div></div>`).join('') || '<p>Chua co khach hang.</p>';
}

async function changeUserStatus(id, status) {
    const response = await fetch(`/api/admin/users/${id}/status`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status}) });
    if (!response.ok) return alert('Khong the cap nhat khach hang');
    loadCustomers();
}

async function loadOrders() {
    const response = await fetch('/api/admin/orders');
    const orders = await response.json();
    document.getElementById('show-order').innerHTML = orders.map(order => `<div class="list"><div class="list-left"><div class="list-info"><h4>Don #${order.id} - ${order.fullname || order.customer_name || 'Khach le'}</h4><p>${order.customer_phone || order.phone || ''} | ${new Date(order.created_at).toLocaleString('vi-VN')}</p><span>${order.status}</span></div></div><div class="list-right"><div class="list-price">${vnd(Number(order.total_price))}</div><select onchange="changeOrderStatus(${order.id}, this.value)">${['Pending','Processing','Completed','Cancelled'].map(status => `<option value="${status}" ${status === order.status ? 'selected' : ''}>${status}</option>`).join('')}</select></div></div>`).join('') || '<p>Chua co don hang.</p>';
}

async function changeOrderStatus(id, status) {
    const response = await fetch(`/api/admin/orders/${id}/status`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status}) });
    if (!response.ok) return alert('Khong the cap nhat don hang');
    loadOrders(); loadDashboardStats();
}

function showCustomers() {
    document.getElementById('overview').style.display = 'none';
    document.getElementById('product-all').style.display = 'none';
    document.getElementById('order-all').style.display = 'none';
    document.getElementById('customer-all').style.display = 'block';
    loadCustomers();
}
function showOrders() {
    document.getElementById('overview').style.display = 'none';
    document.getElementById('product-all').style.display = 'none';
    document.getElementById('customer-all').style.display = 'none';
    document.getElementById('order-all').style.display = 'block';
    loadOrders();
}
// Keep admin filters and pagination on the same result set.
let adminProductView = [];
const adminNormalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function displayList(sourceProducts, page = 1, pageSize = itemsPerPage) {
    adminProductView = Array.isArray(sourceProducts) ? sourceProducts : [];
    const pageCount = Math.max(1, Math.ceil(adminProductView.length / pageSize));
    currentPage = Math.min(Math.max(1, Number(page) || 1), pageCount);
    renderProducts(adminProductView.slice((currentPage - 1) * pageSize, currentPage * pageSize));
    setupPagination(adminProductView, pageSize);
}

function setupPagination(sourceProducts, pageSize = itemsPerPage) {
    const pageNavList = document.querySelector('.page-nav-list');
    if (!pageNavList) return;
    const list = Array.isArray(sourceProducts) ? sourceProducts : adminProductView;
    const pageCount = Math.ceil(list.length / pageSize);
    pageNavList.innerHTML = '';
    for (let page = 1; page <= pageCount; page++) {
        const node = document.createElement('li');
        node.className = `page-nav-item${page === currentPage ? ' active' : ''}`;
        node.innerHTML = `<a href="#">${page}</a>`;
        node.addEventListener('click', event => { event.preventDefault(); displayList(list, page, pageSize); });
        pageNavList.appendChild(node);
    }
}

function filterProduct(event) {
    event?.preventDefault();
    const category = document.getElementById('the-loai').value;
    const buttonId = event?.currentTarget?.id || event?.target?.id || '';
    if (buttonId === 'btn-cancel-product') {
        document.getElementById('the-loai').value = 'Tất cả';
        displayList(globalProducts.filter(item => Number(item.status) === 1), 1, itemsPerPage);
        return;
    }
    let result = globalProducts;
    if (adminNormalize(category) === adminNormalize('Đã xóa')) result = result.filter(item => Number(item.status) === 0);
    else if (adminNormalize(category) !== adminNormalize('Tất cả')) result = result.filter(item => Number(item.status) === 1 && adminNormalize(item.category) === adminNormalize(category));
    else result = result.filter(item => Number(item.status) === 1);
    displayList(result, 1, itemsPerPage);
}

function searchProduct() {
    const keyword = adminNormalize(document.getElementById('form-search-product').value);
    const result = globalProducts.filter(item => adminNormalize(item.title).includes(keyword));
    displayList(result, 1, itemsPerPage);
}
