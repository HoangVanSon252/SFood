function vnd(price) {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function checkLogin() {
    let currentUser = JSON.parse(localStorage.getItem("currentuser"));
    if(currentUser == null || currentUser.userType == 0) {
        document.querySelector("body").innerHTML = `<div class="access-denied-section">
            <img class="access-denied-img" src="../img/products/image.png" alt="">
        </div>`
    } else {
        document.getElementById("name-acc").innerHTML = currentUser.fullname;
    }
}
window.onload = checkLogin();
const sidebars = document.querySelectorAll(".sidebar-list-item.tab-content");

for(let i = 0; i < sidebars.length; i++) {
    sidebars[i].onclick = function () {
        document.querySelector(".sidebar-list-item.active").classList.remove("active");
        sidebars[i].classList.add("active");
    };
}                                                                                                                                                       

const itemsPerPage = 5; // Số sản phẩm hiển thị trên mỗi trang
let currentPage = parseInt(localStorage.getItem('currentPage')) || 1;
let products = JSON.parse(localStorage.getItem('products')) ?? null;

// Hiển thị danh sách sản phẩm ban đầus
displayList(products, currentPage, itemsPerPage);
setupPagination(products.length, itemsPerPage);

function renderProducts(products) {
    let productHtml = '';
    if (products.length == null) {
        document.getElementById("show-product").style.display = "none";
        productHtml = `<div class="no-result">
                <div class="no-result-h">Tìm kiếm không có kết quả</div>
                <div class="no-result-p">Xin lỗi, chúng tôi không thể tìm được kết quả hợp với tìm kiếm của bạn</div>
                <div class="no-result-i">
                    <i class="fa-regular fa-face-sad-cry"></i>
                </div>
            </div>`;
    } else {
        document.getElementById("show-product").style.display = "block";
        if (Array.isArray(products)) {
            products.forEach((product) => {
                productHtml += `<div class="list" data-id="${product.id}">
                    <div class="list-left">
                        <img src="${product.img}" alt="">
                        <div class="list-info">
                            <h4>${product.title}</h4>
                            <p class="list-note">${product.desc}</p>
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
                                    : `<button class="btn-edit" onclick="editProduct(${product.id})"><i class="fa-solid fa-note-sticky"></i></button>
                                    <button class="btn-delete" onclick="deleteProduct(${product.id})"><i class="fa-solid fa-trash"></i> Xóa</button>`
                                }
                            </div>                       
                        </div>
                    </div> 
                </div>`;
            });
        }
    }
    document.getElementById('show-product').innerHTML = productHtml;
}
/* itemsPerPage:Mục trên trangtrang
 totalProducts: Tổng số sản phẩm
 pageNavList: Thanh Điều Hướng Trang
 pageCount: Trang Đếm
 currentPage: Trang Hiện Tại
 setupPagination: Thiết Lập Phân Trang
 displayList: Hiển Thị Danh Sách Sản Phẩm
 */
//Xử lý Số Sản Phẩn Trên Trang
function displayList(products, currentPage, itemsPerPage) {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = products.slice(start, end);
    renderProducts(paginatedProducts);
}
// xử lý phân trangtrang
function setupPagination(totalProducts, itemsPerPage) {
    const pageNavList = document.querySelector('.page-nav-list');
    pageNavList.innerHTML = ''; // Xóa nội dung cũ

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
            localStorage.setItem('currentPage', currentPage); // Lưu trạng thái trang
            displayList(products, currentPage, itemsPerPage); // Gọi displayList với sản phẩm và trang hiện tại

            // Cập nhật lớp active
            let t = document.querySelectorAll('.page-nav-item.active');
            for (let i = 0; i < t.length; i++) {
                t[i].classList.remove('active');
            }
            node.classList.add('active');

        //     // Cuộn đến phần dịch vụ
            document.getElementById("home-service").scrollIntoView();
        });

        pageNavList.appendChild(node); // Thêm phần tử li vào danh sách
    }
}
function showAllProducts() {
    const allProducts = JSON.parse(localStorage.getItem('products')) ?? [];
    displayList(allProducts, currentPage, itemsPerPage);
    setupPagination(allProducts.length, itemsPerPage);
}

// tim kiem
function searchProduct() {
    event.preventDefault();
    let search = document.getElementById('form-search-product').value;
    let products = JSON.parse(localStorage.getItem('products'));
    let producstSearch = products.filter(value => {
        return value.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    });
    document.getElementById('show-product').value = '';
    displayList(producstSearch, currentPage, itemsPerPage);
    setupPagination(producstSearch.length, itemsPerPage);
}

//xử lý sự kiện khi người dùng enter
document.getElementById('form-search-product').addEventListener('keypress', function (even) {
    if (even.key === 'Enter') {
        searchProduct();
    }
});
document.querySelectorAll('.sidebar-list-item').forEach((item, index) => {
    item.addEventListener('click', function() {
        if (index === 0) {
            showOverview(); // Show dashboard
        } else if (index === 1) {
            showAllProducts(); // Show products
       }
    });
});
// Hàm hiển thị trang tổng quan
function showOverview() {
    let showProduct = document.getElementById('product-all');
    let overview = document.getElementById('overview');
    showProduct.style.display = 'none';
    overview.style.display = 'block';
}

// Hàm hiển thị tất cả sản phẩm
function showAllProducts() {
    let showProduct = document.getElementById('product-all');
    let overview = document.getElementById('overview');
    showProduct.style.display = 'block';
    overview.style.display = 'none';
    const allProducts = JSON.parse(localStorage.getItem('products')) ?? [];
    displayList(allProducts, currentPage, itemsPerPage);
    setupPagination(allProducts.length, itemsPerPage);
}
//Header Search
function menuSearch(catagoryMenu) {
    products = JSON.parse(localStorage.getItem('products'));
    let menuSearch = products.filter(value => {
        return value.category.toString().toUpperCase().includes(catagoryMenu.toUpperCase());
    });
    displayList(menuSearch, 1, itemsPerPage);
    setupPagination(menuSearch.length, itemsPerPage);
}
//locj theo danh muc
function filterProduct(event) {
    event.preventDefault();
    let searchCategorySelect = document.getElementById('the-loai').value;
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let filteredProducts = products;

    // Lọc dựa trên danh mục đã chọn
    if (searchCategorySelect === "Đã xóa") {
        // Chỉ hiển thị các sản phẩm đã xóa
        filteredProducts = filteredProducts.filter(item => item.status === 0);
    } else if (searchCategorySelect !== "Tất cả") {
        // Hiển thị sản phẩm theo danh mục đã chọn
        filteredProducts = filteredProducts.filter(product => 
            product.category.toString().toUpperCase() === searchCategorySelect.toUpperCase() && product.status !== 0
        );
    } else {
        // Chỉ hiển thị các sản phẩm đang hoạt động khi chọn "Tất cả"
        filteredProducts = filteredProducts.filter(product => product.status !== 0);
    }

    // Đặt lại danh sách thả xuống nếu nhấp vào nút hủy
    if (event.target.id === 'btn-cancel-product') {
        document.getElementById('the-loai').value = 'Tất cả';
        filteredProducts = products.filter(product => product.status !== 0); // Đặt lại để chỉ hiển thị các sản phẩm đang hoạt động
    }

    // Hiển thị danh sách sản phẩm và thiết lập phân trang
    displayList(filteredProducts, currentPage, itemsPerPage);
    setupPagination(filteredProducts.length, itemsPerPage);
}

// khôi phuc san phẩmphẩm
function restoreProduct(id) {
    event.preventDefault();
    let products = JSON.parse(localStorage.getItem("products"));
    let index = products.findIndex(item => item.id == id);
    if (index !== -1) {
        products[index].status = 1; // Thay đổi trạng thái thành đang hoạt động
        alert("Khôi phục thành công");
        document.getElementById('the-loai').value = 'Tất cả';
        localStorage.setItem("products", JSON.stringify(products));
        
        // Lọc sản phẩm để chỉ hiển thị trạng thái hoạt động
        const remainingProduct = products.filter(item => item.status !== 0);
        displayList(remainingProduct, currentPage, itemsPerPage);
        setupPagination(remainingProduct.length, itemsPerPage);
    }
}

// Xóa sann phẩm
function deleteProduct(id) {
    event.preventDefault();
    let products = JSON.parse(localStorage.getItem("products"));
    let index = products.findIndex(item => item.id == id);
    if (confirm("Bạn có chắc muốn xóa?") === true) {
        products[index].status = 0; // Set status to deleted
        alert("Xóa thành công");
        localStorage.setItem("products", JSON.stringify(products));
        
        // Filter products to show only active status
        const remainingProduct = products.filter(item => item.status !== 0);
        displayList(remainingProduct, currentPage, itemsPerPage);
        setupPagination(remainingProduct.length, itemsPerPage);
    }
}
