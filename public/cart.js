document.addEventListener("DOMContentLoaded", loadCart);
document.addEventListener("DOMContentLoaded", handleCheckout);

function loadCart() {
  const user_id = parseInt(localStorage.getItem('user_id'), 10);

  if (!user_id) {
    alert("Please log in to view your cart.");
    return;
  }

  fetch(`http://localhost:3000/display_cart?user_id=${user_id}`)
    .then(res => res.json())
    .then(data => {
      const cartItems = data.cart || [];
      const container = document.getElementById('cart-items');
      let total = 0;

      container.innerHTML = cartItems.map(p => {
        total += p.price * p.quantity;
        return `<p>${p.title} - $${p.price} x ${p.quantity}</p>`;
      }).join('');

      document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;
    })
    .catch(err => {
      console.error("Error loading cart:", err);
    });
}




function handleCheckout() {
  document.getElementById('checkout-form').addEventListener('submit', async e => {
    e.preventDefault();

    const user_id = parseInt(localStorage.getItem('user_id'), 10);
    const payment_method = document.getElementById('payment-method').value;
    const payment_status = document.getElementById('payment-status').value;

    if (!user_id) {
      alert("You must be logged in to place an order.");
      return;
    }

    if (!payment_method || !payment_status) {
      alert("Please select both payment method and payment status.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/checkout_cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_id, payment_method, payment_status })
      });

      const data = await res.json();
if (res.ok) {
  const order_id = data.order_id;
        alert("Order placed successfully!");
        localStorage.setItem("recent_order_id", order_id);
        localStorage.removeItem('cart');
        window.location.href = 'order_summary.html'; // Redirect to home page
      } else {
        alert("Failed to place order: " + data.message);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("An error occurred during checkout.");
    }
  });
}