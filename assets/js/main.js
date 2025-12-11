//đổi giá trị tiền
function vnd(price) {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

let lastScrollTop = 0;
let lastScrollAdvanced = document.getElementById("filter-btn");
const navbar = document.getElementById("header-bottom");
const closeBtnAdvancedSearch = document.getElementById("close-sort-search");
const navbarAdvanced = document.getElementById("advanced-search");
window.addEventListener("scroll",function () {
    let scrollTop = document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
        // Cuộn xuống
        navbar.classList.add("hidden-nav");
    } else {
        // Cuộn lên
        navbar.classList.remove("hidden-nav");
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});
lastScrollAdvanced.addEventListener("click",function () {
    navbar.classList.add("hidden-nav");
    navbarAdvanced.style.display = "block";
});
closeBtnAdvancedSearch.addEventListener("click", function () {
    navbarAdvanced.style.display = "none";
    navbar.classList.remove("hidden-nav");
});

// chuyển đồi qua lại đăng ký và đăng nhập
let signup = document.querySelector('.signup-link');
let login = document.querySelector('.login-link');
let container = document.querySelector('.signup-login .modal-container');
login.addEventListener('click', () => {
    openLoginForm();
})

signup.addEventListener('click', () => {
    openRegisterForm();
})

// open modal
let signupbtn = document.getElementById('signup');
let loginbtn = document.getElementById('login');
let formsg = document.querySelector('.signup-login');

signupbtn.addEventListener('click', () => {
    body = document.body;
    openRegisterForm();
    body.style.overflow = "hidden";
})

loginbtn.addEventListener('click', () => {
    body = document.body;
    openLoginForm();
    body.style.overflow = "hidden";
})

const openRegisterForm = () => {
    formsg.classList.add('open');
    document.getElementById('form-register').classList.add('active');
    document.getElementById('form-register').classList.remove('hidden');
    document.getElementById('form-login').classList.add('hidden');
    document.getElementById('form-login').classList.remove('active');
}

const openLoginForm = () => {
    document.querySelector('.form-message-check-login').innerHTML = '';
    formsg.classList.add('open');
    document.getElementById('form-register').classList.add('hidden');
    document.getElementById('form-register').classList.remove('active');
    document.getElementById('form-login').classList.add('active');
    document.getElementById('form-login').classList.remove('hidden');
}

//đóng modal đăng ký đăng nhập
let modalContainer = document.querySelectorAll('.modall');
function closeModal() {
    body = document.body;
    modalContainer.forEach(item => {
        item.classList.remove('open');
    });
    console.log(modalContainer)
    body.style.overflow = "auto";
    body.classList.remove('open');
}

//show list ra các sản phẩm(producst)
const itemsPerPage = 8; // Số sản phẩm hiển thị trên mỗi trang
let currentPage = parseInt(localStorage.getItem('currentPage')) || 1;
let products = JSON.parse(localStorage.getItem('products')) ?? null;

// Hiển thị danh sách sản phẩm ban đầus
displayList(products, currentPage, itemsPerPage);
setupPagination(products.length, itemsPerPage);

function renderProducts(products) {
    let productHtml = '';
    if (products.length === 0) { // Kiểm tra nếu không có sản phẩm
        document.getElementById("home-products").style.display = "none";
        productHtml = `<div class="no-result">
                <div class="no-result-h">Tìm kiếm không có kết quả</div>
                <div class="no-result-p">Xin lỗi, chúng tôi không thể tìm được kết quả hợp với tìm kiếm của bạn</div>
                <div class="no-result-i">
                    <i class="fa-regular fa-face-sad-cry"></i>
                </div>
            </div>`;
    } else {
        document.getElementById("home-products").style.display = "block";
        if (Array.isArray(products)) {
            products.forEach((product) => {
                if (product.status === 1) {
                    productHtml += `<div class="col-product">
                                    <article class="card-product" onclick="detailProduct(${product.id})">
                                        <div class="card-header">
                                            <a href="#" class="card-image-link">
                                                <img class="card-image" src="${product.img}" alt="${product.title}">
                                            </a>
                                        </div>
                                        <div class="food-info">
                                            <div class="card-content">
                                                <div class="card-title">
                                                    <a href="#" class="card-title-link">${product.title}</a>
                                                </div>
                                            </div>
                                            <div class="card-footer">
                                                <div class="product-price">
                                                    <span class="current-price">${vnd(product.price)}</span>
                                                </div>
                                                <div class="product-buy">
                                                    <button onclick="detailProduct(${product.id})" class="card-button order-item">
                                                        <i class="fa-solid fa-cart-shopping"></i> Đặt món
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </div>`;
                }
            });
        }
    }
    document.getElementById('home-products').innerHTML = productHtml;
}

function displayList(products, currentPage, itemsPerPage) {
    // Lọc chỉ những sản phẩm có trạng thái hoạt động
    const activeProducts = products.filter(product => product.status === 1);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = activeProducts.slice(start, end);
    renderProducts(paginatedProducts);
    setupPagination(activeProducts.length, itemsPerPage); // Cập nhật tổng số sản phẩm hoạt động
}

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
            // Cuộn đến phần dịch vụ
            document.getElementById("home-service").scrollIntoView();
        });
        pageNavList.appendChild(node); // Thêm phần tử li vào danh sách
    }
}
//Xem Chi Tiết Sản Phẩm
function detailProduct(index) {
    let body = document.body;
    let modal = document.querySelector('.modall.product-detail');
    let products = JSON.parse(localStorage.getItem('products'));
    event.preventDefault();
    let infoProduct = products.find(sp=>{
        return sp.id == index
    });
    console.log(infoProduct);
    
    let modalHtml = `<div class="modal-header">
                        <img class="product-image" src="${infoProduct.img}" alt="">
                    </div>
                    <div class="modal-body">
                        <h2 class="product-title">${infoProduct.title}</h2>
                        <div class="product-control">
                            <div class="priceBox">
                                <span class="current-price">${vnd(infoProduct.price)}</span>
                            </div>
                            <div class="buttons_added">
                                <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                                <input class="input-qty" max="100" min="1" name="" type="number" value="1">
                                <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
                            </div>
                        </div>
                        <p class="product-description">${infoProduct.desc}</p>
                    </div>
                    <div class="notebox">
                        <p class="notebox-title">Ghi chú</p>
                        <textarea class="text-note" id="popup-detail-note" placeholder="Nhập thông tin cần lưu ý..."></textarea>
                    </div>
                    <div class="modall-footer">
                        <div class="price-total">
                            <span class="thanhtien">Thành tiền</span>
                            <span class="price">${vnd(infoProduct.price)}</span>
                        </div>
                        <div class="modal-footer-control">
                            <button class="button-dathangngay" data-product="${infoProduct.id}">Đặt hàng ngay</button>
                            <button class="button-dat" id="add-cart"><i class="fa-solid fa-basket-shopping"></i></button>
                        </div>
                    </div>`;
    document.querySelector('#product-detail-content').innerHTML = modalHtml;
    modal.classList.add('open');
    body.style.overflow = "hidden";
    body.classList.remove('open');


    //Taneg Giá Tiềng Khi Số Lượng Sản Phẩm Thay Đổi
    let tgbtn = document.querySelectorAll('.is-form');
    let qty = document.querySelector('.product-control .input-qty');
    let priceText = document.querySelector('.price');
    tgbtn.forEach(element => {
        element.addEventListener('click', () => {
            let price = infoProduct.price * parseInt(qty.value);
            priceText.innerHTML = vnd(price);
        });
    });
    // Them san pham vao gio hang
    let productbtn = document.querySelector('.button-dat');
    productbtn.addEventListener('click', (e) => {
        if (localStorage.getItem('currentuser')) {
            addCart(infoProduct.id);
        } else {
            alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
        }

    })
}
//Tăng Số Lượng
function increasingNumber(e) {
    let qty = e.parentNode.querySelector('.input-qty');
    if (parseInt(qty.value) < qty.max) {
        qty.value = parseInt(qty.value) + 1;
    } else {
        qty.value = qty.max;
    }
}
//Giảm Số Lượng
function decreasingNumber(e) {
    let qty = e.parentNode.querySelector('.input-qty');
    if (qty.value > qty.min) {
        qty.value = parseInt(qty.value) - 1;
    } else {
        qty.value = qty.min;
    }
}
//Them San Pham Vao Gio Hang
function addCart(index) {
    let currentusers = localStorage.getItem('currentuser') ? JSON.parse(localStorage.getItem('currentuser')) : [];
    let soLuong = document.querySelector('.input-qty').value;
    let noteBox = document.querySelector('#popup-detail-note').value;
    let note = noteBox == "" ? "Không có ghi chú" : noteBox;
    let image = document.querySelector('.product-image').src;

    let productCart = {
        id: index,
        soLuong: parseInt(soLuong),
        note: note,
        image: image
    }
    let viTri = currentusers.cart.findIndex(item => item.id == productCart.id);
    if(viTri == -1){
        currentusers.cart.push(productCart);
    }else{
        currentusers.cart[viTri].soLuong = parseInt(currentusers.cart[viTri].soLuong) + parseInt(productCart.soLuong);
    }
    localStorage.setItem('currentuser', JSON.stringify(currentusers));
    updateAmount();
    closeModal();
}

// lấy ra số lượng sản phẩm khi thêm vào giỏ hàng

function getAmountCart() {
    let currentusers = JSON.parse(localStorage.getItem('currentuser'));
    let amount = 0;
    currentusers.cart.forEach(element => {
        amount +=parseInt(element.soLuong);
    });
    return amount;
}
function updateAmount() {
    if(localStorage.getItem('currentuser') != null){
        amount = getAmountCart();
        document.querySelector('.count-product-cart').innerText = amount;
    }
}

// lấy sản phẩm từ localstorage
function getProduct(item) {
    let products = JSON.parse(localStorage.getItem('products'));
    let infoProductCart = products.find(sp => item.id == sp.id);
    let product = {
        ...infoProductCart,
        ...item
    }
    return product;
}
window.onload = updateAmount();
window.onload = updateCartTotal();

// Hiển thị giỏ hàng
function showCart() {
    if (localStorage.getItem('currentuser') != null) {
        let currentuser = JSON.parse(localStorage.getItem('currentuser'));
        if (currentuser.cart.length != 0) {
            document.querySelector('.cart-empty').style.display = 'none';
            document.querySelector('button.thanh-toan').classList.remove('disabled');
            let productcarthtml = '';
            currentuser.cart.forEach(item => {
                let product = getProduct(item);
                productcarthtml += `<li class="cart-item" data-id="${product.id}">
                    <div class="cart-item-info">
                        <img src="${product.image}" alt="">
                        <p class="cart-item-title">
                            ${product.title}
                        </p>
                        <span class="cart-item-price price" data-price="${product.price}">
                            ${vnd(parseInt(product.price))}
                        </span>
                    </div>
                    <p class="product-note"><i class="fa-solid fa-notes-medical"></i><span>${product.note}</span></p>
                    <div class="cart-item-control">
                        <button class="cart-item-delete" onclick="deleteCartItem(${product.id})">Xóa</button>
                        <div class="buttons_added">
                            <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                            <input class="input-qty" max="100" min="1" name="" type="number" value="${product.soLuong}">
                            <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
                        </div>
                    </div>
                </li>`
            });
            document.querySelector('.cart-list').innerHTML = productcarthtml;
            updateCartTotal();
            saveAmountCart();
        } else {
            document.querySelector('.cart-empty').style.display = 'flex';
        }
    }
    let modalCart = document.querySelector('.modal-cart');
    let containerCart = document.querySelector('.cart-container');
    let themmon = document.querySelector('.them-mon');
    modalCart.onclick = function () {
        closeCart();
    }
    themmon.onclick = function () {
        closeCart();
    }
    containerCart.addEventListener('click', (e) => {
        e.stopPropagation();
    })
}
//Xóa Sản Phẩm Trong Giỏ Hàng
function deleteCartItem(id) {
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    let vitri = currentUser.cart.findIndex(item => item.id = id)
    currentUser.cart.splice(vitri, 1);
    const productElement = document.querySelector(`[data-id='${id}']`);
    if (productElement) {
        productElement.remove(); // Remove from UI
    }

    // Nếu trống thì hiển thị giỏ hàng trống
    if (currentUser.cart.length == 0) {
        document.querySelector('.cart-empty').style.display = 'flex';
        document.querySelector('button.thanh-toan').classList.add('disabled');
    }
    localStorage.setItem('currentuser', JSON.stringify(currentUser));
    updateCartTotal();
}

function openCart() {
    let body = document.body;
    body.style.overflow = "hidden";
    showCart();
    document.querySelector('.modal-cart').classList.add('open');
    document.querySelector('.cart-container').classList.add('open');
}
function closeCart() {
    body = document.body;
    document.querySelector('.modal-cart').classList.remove('open');
    document.querySelector('.cart-container').classList.remove('open');
    body.style.overflow = "auto";
    updateAmount();
}
//Cập Nhật Số Lượng Sản Phẩm
function saveAmountCart() {
    let cartAmountbtn = document.querySelectorAll(".cart-item-control .is-form");
    let listProduct = document.querySelectorAll('.cart-item');
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    cartAmountbtn.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            let id = listProduct[parseInt(index / 2)].getAttribute("data-id");
            let productId = currentUser.cart.find(item => {
                return item.id == id;
            });
            productId.soLuong = parseInt(listProduct[parseInt(index / 2)].querySelector(".input-qty").value);
            localStorage.setItem('currentuser', JSON.stringify(currentUser));
            updateCartTotal();
        })
    });
}

//Update cart total
function updateCartTotal() {
    document.querySelector('.text-price').innerText = vnd(getCartTotal());
}

// Lay tong tien don hang
function getCartTotal() {
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    let tongtien = 0;
    if (currentUser != null) {
        currentUser.cart.forEach(item => {
            let product = getProduct(item);
            tongtien += (parseInt(product.soLuong) * parseInt(product.price));
        });
    }
    return tongtien;
}

// Chức năng đăng ký
let signupButton = document.getElementById('signup-button');
let loginButton = document.getElementById('login-button');
signupButton.addEventListener('click', () => {
    event.preventDefault();
    let fullNameUser = document.getElementById('fullname').value;
    let phoneUser = document.getElementById('phone').value;
    let passwordUser = document.getElementById('password').value;
    let passwordConfirmation = document.getElementById('password_confirmation').value;
    let checkSignup = document.getElementById('checkbox-signup').checked;
    // Check validate
    // Check NameName
    if (fullNameUser.length == 0) {
        document.querySelector('.form-message-name').innerHTML = 'Vui lòng nhập họ vâ tên';
        document.getElementById('fullname').focus();
    } else if (fullNameUser.length < 3) {
        document.getElementById('fullname').value = '';
        document.querySelector('.form-message-name').innerHTML = 'Vui lòng nhập họ và tên lớn hơn 3 kí tự';
    } else {
        document.querySelector('.form-message-name').innerHTML = '';
    }
    // Check SdtSdt
    if (phoneUser.length == 0) {
        document.querySelector('.form-message-phone').innerHTML = 'Vui lòng nhập vào số điện thoại';
    } else if (phoneUser.length != 10) {
        document.querySelector('.form-message-phone').innerHTML = 'Vui lòng nhập vào số điện thoại 10 số';
        document.getElementById('phone').value = '';
    } else {
        document.querySelector('.form-message-phone').innerHTML = '';
    }
    //Check Mật Khẩu
    if (passwordUser.length == 0) {
        document.querySelector('.form-message-password').innerHTML = 'Vui lòng nhập mật khẩu';
    } else if (passwordUser.length < 6) {
        document.querySelector('.form-message-password').innerHTML = 'Vui lòng nhập mật khẩu lớn hơn 6 kí tự';
        document.getElementById('password').value = '';
    } else {
        document.querySelector('.form-message-password').innerHTML = '';
    }
    //Check Xác Nhận Mật Khẩu
    if (passwordConfirmation.length == 0) {
        document.querySelector('.form-message-password-confi').innerHTML = 'Vui lòng nhập lại mật khẩu';
    } else if (passwordConfirmation !== passwordUser) {
        document.querySelector('.form-message-password-confi').innerHTML = 'Mật khẩu không khớp';
        document.getElementById('password_confirmation').value = '';
    } else {
        document.querySelector('.form-message-password-confi').innerHTML = '';
    }
    if (checkSignup != true) {
        document.querySelector('.form-message-checkbox').innerHTML = 'Vui lòng check đăng ký';
    } else {
        document.querySelector('.form-message-checkbox').innerHTML = '';
    }
    if (fullNameUser && phoneUser && passwordUser && passwordConfirmation && checkSignup) {
        if (passwordConfirmation == passwordUser) {
            let user = {
                fullname: fullNameUser,
                phone: phoneUser,
                password: passwordUser,
                address: '',
                email: '',
                status: 1,
                join: new Date(),
                cart: [],
                userType: 0
            }
            let accounts = localStorage.getItem('accounts') ? JSON.parse(localStorage.getItem('accounts')) : [];
            console.log(accounts);
            
            let checkloop = accounts.some(account => {
                return account.phone == user.phone;
            })
            if (!checkloop) {
                accounts.push(user);
                localStorage.setItem('accounts', JSON.stringify(accounts));
                localStorage.setItem('currentuser', JSON.stringify(user));
                alert('Đăng ký thành công');
                closeModal();
            } else {
                alert("Tài Khoản Đã Tồn Tại!")
            }
        }
    }
});
loginButton.addEventListener('click', () => {
    event.preventDefault();
    let phonelog = document.getElementById('phone-login').value;
    let passlog = document.getElementById('password-login').value;
    let accounts = JSON.parse(localStorage.getItem('accounts'));

    if (phonelog.length == 0) {
        document.querySelector('.form-message.phonelog').innerHTML = 'Vui lòng nhập vào số điện thoại';
    } else if (phonelog.length != 10) {
        document.querySelector('.form-message.phonelog').innerHTML = 'Vui lòng nhập vào số điện thoại 10 số';
        document.getElementById('phone-login').value = '';
    } else {
        document.querySelector('.form-message.phonelog').innerHTML = '';
    }

    if (passlog.length == 0) {
        document.querySelector('.form-message-check-login').innerHTML = 'Vui lòng nhập mật khẩu';
    } else if (passlog.length < 6) {
        document.querySelector('.form-message-check-login').innerHTML = 'Vui lòng nhập mật khẩu lớn hơn 6 kí tự';
        document.getElementById('passwordlogin').value = '';
    } else {
        document.querySelector('.form-message-check-login').innerHTML = '';
    }

    if (phonelog && passlog) {
        let vitri = accounts.findIndex(item => item.phone == phonelog);
        if (vitri == -1) {
            alert('Tài khoản của bạn không tồn tại');
        } else if (accounts[vitri].password == passlog) {
            if(accounts[vitri].status == 0) {
            alert('Tài khoản của bạn đã bị khóa');
            } else {
                localStorage.setItem('currentuser', JSON.stringify(accounts[vitri]));
                alert('Đăng nhập thành công');
                closeModal();
                kiemtradangnhap();
            }
        } else {
            alert('Sai mật khẩu');
        }
    }
});

//Kiểm Tra Đăng Nhập
function kiemtradangnhap() {
    let currentUsers = localStorage.getItem('currentuser');
    if (currentUsers != null) {
        let user = JSON.parse(currentUsers);
        document.querySelector('.auth-container').innerHTML = `<span class="text-dndk">Tài khoản</span>
            <span class="text-tk">${user.fullname} <i class="fa-sharp fa-solid fa-caret-down" style="color: black; font-size: 14px;"></i></span>`;
        document.querySelector('.header-top-right-menu').innerHTML = `<li><a id="myacount" href="javascript:;"><i class="fa-solid fa-right-to-bracket"></i>Tài Khoản Của Tôi</a></li>
                                                                        <li><a id="myoder" href="javascript:;"><i class="fa-solid fa-right-to-bracket"></i>Đơn Hàng Của Tôi</a></li>
                                                                        <li><a id="logout" onclick = "loOut()" href="javascript:;"><i class="fa-solid fa-right-to-bracket"></i>Đăng Xuất</a></li>`;
    }
}

//Đăng Xuất
function loOut() {
    localStorage.removeItem('currentuser');
    location.reload();
}

// tim kiem
function searchProduct() {
    event.preventDefault();
    let search = document.getElementById('search').value;
    let products = JSON.parse(localStorage.getItem('products'));
    let producstSearch = products.filter(value => {
        return value.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    });
    document.getElementById('home-products').value = '';
    displayList(producstSearch, currentPage, itemsPerPage);
    setupPagination(producstSearch.length, itemsPerPage);
}

//xử lý sự kiện khi người dùng enter
document.getElementById('search').addEventListener('keypress', function (even) {
    if (even.key === 'Enter') {
        searchProduct();
    }
});
//Header Search
function menuSearch(catagoryMenu) {
    products = JSON.parse(localStorage.getItem('products'));
    let menuSearch = products.filter(value => {
        return value.category.toString().toUpperCase().includes(catagoryMenu.toUpperCase());
    });
    let currentPageNav = 1;
    displayList(menuSearch, currentPageNav, itemsPerPage);
    setupPagination(menuSearch.length, itemsPerPage);
}
//Lọc Sản Phẩm
function filterProduct(event) {
    event.preventDefault();

    // Lấy giá trị từ các trường nhập liệu
    let searchCategorySelect = document.getElementById('advanced-search-category-select').value;
    let minPrice = parseFloat(document.getElementById('min-price').value);
    let maxPrice = parseFloat(document.getElementById('max-price').value);

    // Lấy danh sách sản phẩm từ localStorage
    let products = JSON.parse(localStorage.getItem('products'));

    // Lọc theo loại sản phẩm
    let filteredProducts = products;
    if (searchCategorySelect !== "Tất cả") {
        filteredProducts = filteredProducts.filter(product => 
            product.category.toString().toUpperCase().includes(searchCategorySelect.toUpperCase())
        );
    }

    // Lọc theo giá (nếu có nhập giá trị)
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
        filteredProducts = filteredProducts.filter(product => {
            let productPrice = product.price;
            return (!isNaN(minPrice) && productPrice >= minPrice) && (!isNaN(maxPrice) && productPrice <= maxPrice);
        });
    }

    // Sắp xếp sản phẩm theo giá nếu nút sắp xếp được nhấn
    if (event.target.id === 'sort-ascending') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (event.target.id === 'sort-descending') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    if (event.target.id === 'reset-search') {
        document.getElementById('advanced-search-category-select').value = 'Tất cả';
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';
        displayList(products, currentPage, itemsPerPage);
        setupPagination(products.length, itemsPerPage);
    }
    // Hiển thị danh sách sản phẩm và thiết lập phân trang
    displayList(filteredProducts, currentPage, itemsPerPage);
    setupPagination(filteredProducts.length, itemsPerPage);
}