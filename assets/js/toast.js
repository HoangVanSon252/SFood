function showToast({ title = '', message = '', type = 'info', duration = 3000 }) {
    let main = document.getElementById('toast-container');
    if (!main) {
        main = document.createElement('div');
        main.id = 'toast-container';
        document.body.appendChild(main);
    }

    const toast = document.createElement('div');

    // Tự động xóa toast
    const autoRemoveId = setTimeout(function () {
        main.removeChild(toast);
    }, duration + 1000); // Đợi cả animation slideOut/fadeOut

    // Xóa khi click close
    toast.onclick = function (e) {
        if (e.target.closest('.toast__close')) {
            main.removeChild(toast);
            clearTimeout(autoRemoveId);
        }
    };

    const icons = {
        success: 'fa-solid fa-check',
        info: 'fa-solid fa-info',
        error: 'fa-solid fa-xmark'
    };
    const icon = icons[type];
    const delay = (duration / 1000).toFixed(2);

    toast.classList.add('toast', `toast--${type}`);
    toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;

    toast.innerHTML = `
        <div class="toast__icon">
            <i class="${icon}"></i>
        </div>
        <div class="toast__body">
            <h3 class="toast__title">${title}</h3>
            <p class="toast__msg">${message}</p>
        </div>
        <div class="toast__close">
            <i class="fa-solid fa-xmark"></i>
        </div>
    `;
    main.appendChild(toast);
}
