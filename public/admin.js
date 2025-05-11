const baseURL = 'http://localhost:3000';

async function addGame() {
  const data = {
    title: document.getElementById('add-title').value,
    description: document.getElementById('add-description').value,
    price: document.getElementById('add-price').value,
    genre: document.getElementById('add-genre').value,
    platform: document.getElementById('add-platform').value,
    stock: document.getElementById('add-stock').value
  };

  const res = await fetch(`${baseURL}/admin/add_games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(result.message);
}

async function updateGame() {
  const data = {
    id: document.getElementById('update-id').value,
    title: document.getElementById('update-title').value,
    description: document.getElementById('update-description').value,
    price: document.getElementById('update-price').value,
    genre: document.getElementById('update-genre').value,
    platform: document.getElementById('update-platform').value
  };

  const res = await fetch(`${baseURL}/admin/update_games`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(result.message);
}

async function deleteGame() {
  const data = {
    id: document.getElementById('delete-id').value
  };

  const res = await fetch(`${baseURL}/admin/delete_games`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(result.message);
}

async function updateOrderStatus() {
  const data = {
    order_id: document.getElementById('order-id').value,
    status: document.getElementById('order-status').value
  };

  const res = await fetch(`${baseURL}/update_status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(result.message);
}

async function fetchGames() {
  const res = await fetch(`${baseURL}/admin/display_games`);
  const data = await res.json();

  const table = document.querySelector("#games-table tbody");
  table.innerHTML = "";

  data.games.forEach(game => {
    const row = `
      <tr>
        <td>${game.game_id}</td>
        <td>${game.title}</td>
        <td>${game.price}</td>
        <td>${game.genre}</td>
        <td>${game.platform}</td>
      </tr>`;
    table.innerHTML += row;
  });
}

async function fetchOrders() {
  const res = await fetch(`${baseURL}/admin/display_orders`);
  const data = await res.json();

  const table = document.querySelector("#orders-table tbody");
  table.innerHTML = "";

  data.orders.forEach(order => {
    const row = `
      <tr>
        <td>${order.order_id}</td>
        <td>${order.user_id}</td>
        <td>${order.status}</td>
        <td>${order.total_amount}</td>
      </tr>`;
    table.innerHTML += row;
  });
}
