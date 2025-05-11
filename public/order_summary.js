document.addEventListener("DOMContentLoaded", OrderSummary);

function OrderSummary() {
  const order_id = parseInt(localStorage.getItem('recent_order_id'), 10);  

  if (!order_id) {
    alert("No recent order found.");
    return;
  }

  fetch(`http://localhost:3000/order_summary?order_id=${order_id}`)
    .then(res => res.json())
    .then(data => {
      if (data.success && data.games && data.games.length > 0) {
        const tableBody = document.querySelector('#summary-table tbody');
        tableBody.innerHTML = ''; 

        data.games.forEach(game => {
          const row = `
            <tr>
              <td>${game.order_id}</td>
              <td>${game.order_date}</td>
              <td>${game.user_id}</td>
              <td>${game.email}</td>
              <td>$${(game.total_amount).toFixed(2)}</td>
            </tr>`;
          tableBody.innerHTML += row;
        });
      } else {
        alert("No order summary found for this order.");
      }
    })
    .catch(err => {
      console.error("Error loading order summary:", err);
      alert("There was an error fetching the order summary.");
    });
}
