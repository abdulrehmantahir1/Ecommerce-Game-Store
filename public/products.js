// js/products.js
  document.addEventListener("DOMContentLoaded", loadProducts);
  document.addEventListener("DOMContentLoaded", loadProductDetail);

function loadProducts() {
    fetch('http://localhost:3000/user/display_games')
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('product-list');
        const games = data.games; // FIXED LINE
  
        container.innerHTML = games.map(p => `
          <div>
            <h3>${p.title}</h3>
            <p>${p.price} USD</p>
            <a href="product_detail.html?id=${p.game_id}">View</a>
          </div>
        `).join('');
      });
  }
  
  function loadProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
  
    fetch(`http://localhost:3000/admin/display_games/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log(data); // Add this line
        const p = data.games[0]; // FIXED LINE
        document.getElementById('product-detail').innerHTML = `
          <h2>${p.title}</h2>
          <p>${p.description}</p>
          <p>${p.price} USD</p>
        `;
      });
      
  }
  
  function addToCart() {
    const params = new URLSearchParams(window.location.search);
    const game_id = parseInt(params.get('id'), 10);
  
    // You need to get the user_id from somewhere — sessionStorage, localStorage, etc.
    const user_id = parseInt(localStorage.getItem('user_id'), 10); // or use sessionStorage
  
    if (!user_id) {
      alert("Please log in first to add items to your cart.");
      return;
    }
  
    fetch('http://localhost:3000/add_item_to_cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: user_id,
        game_id: game_id,
        quantity: 1
      })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message || 'Added to cart!');
    })
    .catch(err => {
      console.error("Error adding to cart:", err);
      alert('Failed to add to cart.');
    });
  }
  