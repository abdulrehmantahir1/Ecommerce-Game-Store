// js/main.js
function getFeaturedProducts() {
    fetch('http://localhost:3000/user/display_games')
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('featured-products');
        container.innerHTML = data.map(product => `
          <div>
            <h3>${product.name}</h3>
            <p>${product.price} USD</p>
            <a href="product.html?id=${product.id}">View</a>
          </div>
        `).join('');
      });
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('featured-products')) {
      getFeaturedProducts();
    }
  });
  