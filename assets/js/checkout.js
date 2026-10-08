const formatMoney = value => Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
const user = JSON.parse(localStorage.getItem('currentuser') || 'null');
if (!user || !Array.isArray(user.cart) || user.cart.length === 0) window.location.replace('../index.html');

const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
let orderItems = [];

async function loadCheckout() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    orderItems = user.cart.map(cartItem => {
      const product = products.find(item => Number(item.id) === Number(cartItem.id));
      return product ? { ...product, quantity: Math.max(1, Number(cartItem.soLuong || 1)), note: cartItem.note || '' } : null;
    }).filter(Boolean);
    if (!orderItems.length) return window.location.replace('../index.html');
    document.getElementById('checkout-items').innerHTML = orderItems.map(item => `<div class="checkout-item"><img src="${escapeHtml(item.img)}" alt=""><div class="checkout-item-main"><b>${escapeHtml(item.title)}</b><span>${item.quantity} x ${formatMoney(item.price)}</span></div><strong>${formatMoney(item.price * item.quantity)}</strong></div>`).join('');
    const total = orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    document.getElementById('subtotal').textContent = formatMoney(total);
    document.getElementById('checkout-total').textContent = formatMoney(total);
    document.getElementById('customer-name').value = user.fullname || '';
    document.getElementById('customer-phone').value = user.phone || '';
  } catch (error) { alert('Không thể tải thông tin đơn hàng.'); }
}

document.getElementById('checkout-form').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.submitter;
  const customer_name = document.getElementById('customer-name').value.trim();
  const customer_phone = document.getElementById('customer-phone').value.trim();
  const customer_address = document.getElementById('customer-address').value.trim();
  const payment_method = document.querySelector('input[name="payment"]:checked').value;
  if (!customer_name || !customer_phone || !customer_address) return alert('Vui lòng điền đầy đủ thông tin nhận hàng.');
  button.disabled = true; button.textContent = 'Đang tạo đơn...';
  try {
    const response = await fetch('/api/orders', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ user_id: user.id, customer_name, customer_phone, customer_address, payment_method, cart_items: orderItems.map(item => ({id:item.id, quantity:item.quantity})) }) });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Không thể tạo đơn hàng');
    user.cart = []; localStorage.setItem('currentuser', JSON.stringify(user));
    alert(`Đặt hàng thành công! Mã đơn của bạn là #${data.order_id}`);
    window.location.href = '../index.html';
  } catch (error) { alert(error.message || 'Có lỗi xảy ra, vui lòng thử lại.'); button.disabled = false; button.textContent = 'Xác nhận đặt hàng'; }
});
loadCheckout();
