// Navbar: add scrolled class for stronger blur/bg on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  menuToggle.classList.toggle('active');
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuToggle.classList.remove('active');
  });
});

// Chart button → go to cart page
const chartBtn = document.getElementById("chart-btn");
if (chartBtn) {
  chartBtn.addEventListener("click", function () {
    window.location.href = "../cart/index.html";
  });
}

// Account button → go to account page
document.addEventListener("DOMContentLoaded", function () {
  const accountBtn = document.getElementById("account-btn");
  if (accountBtn) {
    accountBtn.addEventListener("click", function () {
      window.location.href = "../accountpage/profile.html";
    });
  }

  // Fetch and display books
  fetchBooks();
  updateCartBadge();
});

async function fetchBooks() {
  try {
    const response = await fetch("http://localhost/bookstore/api/books");
    const data = await response.json();
    if (data.status === 'success') {
      // Handle paginated response
      const books = data.data.items || data.data;
      renderBooks(books);
    }
  } catch (e) {
    console.error("Error fetching books:", e);
  }
}

function renderBooks(books) {
  const grid = document.querySelector('.books-grid');
  if (!grid) return;
  grid.innerHTML = ''; // Clear hardcoded books

  books.forEach(book => {
    const article = document.createElement('article');
    article.className = 'book-card';
    article.innerHTML = `
        <div class="book-cover">
          <img src="${book.image}" alt="Book cover" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80'"/>
          <div class="book-overlay">
            <button onclick="addToCart(${book.id})" class="btn btn-primary btn-sm">Add to Cart</button>
          </div>
        </div>
        <div class="book-info">
          <span class="book-category">${book.category_name || 'Book'}</span>
          <h3 class="book-title">${book.title}</h3>
          <p class="book-author">${book.author}</p>
          <p class="book-price">$${parseFloat(book.price).toFixed(2)}</p>
        </div>
      `;
    grid.appendChild(article);
  });
}

window.addToCart = async function (bookId) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Please login first to add items to cart.");
    window.location.href = "../login/index.html";
    return;
  }
  try {
    const response = await fetch("http://localhost/bookstore/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ book_id: bookId, quantity: 1 })
    });
    const data = await response.json();
    if (data.status === 'success') {
      // alert("Added to cart!");
      const badge = document.querySelector('#chart-btn .badge');
      if (badge && data.data && data.data.count !== undefined) {
        badge.textContent = data.data.count;
      }
    } else {
      alert(data.message || "Failed to add to cart");
    }
  } catch (e) {
    console.error(e);
    alert("Network error.");
  }
};

async function updateCartBadge() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const response = await fetch("http://localhost/bookstore/api/cart", {
      headers: { "Authorization": "Bearer " + token }
    });
    const data = await response.json();
    if (data.status === 'success') {
      const badge = document.querySelector('#chart-btn .badge');
      if (badge && data.data && data.data.count !== undefined) {
        badge.textContent = data.data.count;
      }
    }
  } catch (e) {
    console.error(e);
  }
}