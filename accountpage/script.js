/* ── Nocturne Editorial — script.js ── */

document.addEventListener('DOMContentLoaded', () => {

  const token = localStorage.getItem("token");
  if (!token) {
      window.location.href = "../loginpage/loginpage.html";
      return;
  }

  // 1. Fetch Profile Data if on profile page
  const profileDetails = document.getElementById('profile-details');
  if (profileDetails) {
      fetchProfile();
  }

  // 2. Fetch Orders Data if on orders page
  const ordersTableWrap = document.querySelector('.orders-table-wrap');
  if (ordersTableWrap) {
      fetchOrders();
  }

  /* ── Toggles ── */
  document.querySelectorAll('.toggle').forEach(t => {
    t.addEventListener('click', () => {
      t.classList.toggle('on');
      const label = t.closest('.toggle-wrap')?.querySelector('h4')?.textContent || 'Setting';
      const state = t.classList.contains('on') ? 'enabled' : 'disabled';
      showToast(`${label} ${state}.`);
    });
  });

  /* ── Password form ── */
  const pwForm = document.getElementById('pw-form');
  if (pwForm) {
    pwForm.addEventListener('submit', async e => {
      e.preventDefault();
      const cur = document.getElementById('pw-current').value.trim();
      const nw  = document.getElementById('pw-new').value.trim();
      const cfm = document.getElementById('pw-confirm').value.trim();
      const flash = document.getElementById('pw-flash');

      if (!cur || !nw || !cfm) {
        showFlash(flash, 'error', '✕  All fields are required.');
        return;
      }
      if (nw.length < 8) {
        showFlash(flash, 'error', '✕  New password must be at least 8 characters.');
        return;
      }
      if (nw !== cfm) {
        showFlash(flash, 'error', '✕  Passwords do not match.');
        return;
      }

      try {
        const response = await fetch("http://localhost/bookstore/api/auth/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify({ old_password: cur, new_password: nw })
        });
        const data = await response.json();
        if (data.status === 'success') {
            showFlash(flash, 'success', '✓  Password updated successfully.');
            pwForm.reset();
        } else {
            showFlash(flash, 'error', '✕  ' + (data.message || 'Failed to change password.'));
        }
      } catch (err) {
        showFlash(flash, 'error', '✕  Network error.');
      }
    });
  }

  /* ── Wishlist remove buttons ── */
  document.querySelectorAll('.remove-book').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.book-card');
      if (card) {
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.94)';
        setTimeout(() => card.remove(), 300);
        showToast('Removed from wishlist.');
      }
    });
  });

  /* ── Cart buttons ── */
  document.querySelectorAll('.add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = '✓ Added';
      btn.style.background = 'rgba(46,150,80,0.15)';
      btn.style.color = '#5bc47a';
      btn.style.borderColor = 'rgba(46,150,80,0.3)';
      setTimeout(() => {
        btn.textContent = '+ Cart';
        btn.style = '';
      }, 2000);
      showToast('Added to cart.');
    });
  });

  /* ── Invoice / Track buttons ── */
  document.querySelectorAll('.btn-invoice').forEach(btn => {
    btn.addEventListener('click', () => showToast('Generating invoice PDF…'));
  });

  document.querySelectorAll('.btn-track').forEach(btn => {
    btn.addEventListener('click', () => showToast('Opening tracking portal…'));
  });

  /* ── Edit Profile button ── */
  const editBtn = document.getElementById('edit-profile-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      const details = document.getElementById('profile-details');
      if (details) {
        const isVisible = details.style.display === 'block';
        details.style.display = isVisible ? 'none' : 'block';
        editBtn.textContent = isVisible ? 'Cancel Editing' : 'Edit Personal Details';
      }
    });
  }

  /* ── Edit Address button ── */
  const editAddr = document.getElementById('edit-addr-btn');
  if (editAddr) {
    editAddr.addEventListener('click', () => {
      const form = document.getElementById('addr-form');
      if (form) {
        const isVisible = form.style.display === 'block';
        form.style.display = isVisible ? 'none' : 'block';
        editAddr.textContent = isVisible ? 'Cancel' : 'Edit Address';
      }
    });
  }

  /* ── Address save ── */
  const addrSave = document.getElementById('addr-save');
  if (addrSave) {
    addrSave.addEventListener('click', () => {
      const form = document.getElementById('addr-form');
      if (form) form.style.display = 'none';
      if (editAddr) editAddr.textContent = 'Edit Address';
      showToast('Address saved.');
    });
  }

  /* ── New List tile ── */
  const newList = document.getElementById('new-list-tile');
  if (newList) {
    newList.addEventListener('click', () => {
      const name = prompt('Enter a name for your new reading list:');
      if (name && name.trim()) showToast(`"${name.trim()}" list created.`);
    });
  }

  /* ── Sign Out ── */
  document.querySelectorAll('.signout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Sign out of Nocturne Editorial?')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '../loginpage/loginpage.html';
      }
    });
  });

  /* ── API CALLS ── */

  async function fetchProfile() {
      try {
          const response = await fetch("http://localhost/bookstore/api/auth/me", {
              headers: { "Authorization": "Bearer " + token }
          });
          const data = await response.json();
          if (data.status === 'success') {
              const user = data.data;
              document.querySelector('.profile-name').textContent = user.name;
              document.querySelector('.profile-email').textContent = user.email;
              document.querySelector('.avatar').textContent = user.name.charAt(0).toUpperCase();
              
              // Fill form if it exists
              const inputs = document.querySelectorAll('#profile-details .form-input');
              if (inputs.length >= 3) {
                  const names = user.name.split(' ');
                  inputs[0].value = names[0] || '';
                  inputs[1].value = names.slice(1).join(' ') || '';
                  inputs[2].value = user.email;
              }
          }
      } catch (err) {
          console.error(err);
      }
  }

  window.saveProfile = async function() {
      const inputs = document.querySelectorAll('#profile-details .form-input');
      const firstName = inputs[0].value.trim();
      const lastName = inputs[1].value.trim();
      const name = firstName + (lastName ? ' ' + lastName : '');
      
      try {
          const response = await fetch("http://localhost/bookstore/api/auth/me", {
              method: "PUT",
              headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
              body: JSON.stringify({ name: name })
          });
          const data = await response.json();
          if (data.status === 'success') {
              showToast('Profile updated.');
              document.querySelector('.profile-name').textContent = name;
              document.querySelector('.avatar').textContent = name.charAt(0).toUpperCase();
              document.getElementById('profile-details').style.display = 'none';
              document.getElementById('edit-profile-btn').textContent = 'Edit Personal Details';
          } else {
              showToast(data.message || 'Update failed.');
          }
      } catch (err) {
          console.error(err);
      }
  };

  async function fetchOrders() {
      try {
          const response = await fetch("http://localhost/bookstore/api/orders", {
              headers: { "Authorization": "Bearer " + token }
          });
          const data = await response.json();
          if (data.status === 'success') {
              renderOrders(data.data);
          }
      } catch (err) {
          console.error(err);
      }
  }

  function renderOrders(orders) {
      const tbody = document.querySelector('tbody');
      if (!tbody) return;
      tbody.innerHTML = '';
      
      if (orders.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No orders found.</td></tr>';
          return;
      }

      let totalSpent = 0;
      let totalItems = 0;

      orders.forEach(order => {
          totalSpent += parseFloat(order.total_price);
          totalItems += parseInt(order.items_count || 0);

          const date = new Date(order.created_at).toLocaleDateString();
          const statusMap = {
              'pending': 'processing',
              'shipped': 'shipped',
              'delivered': 'delivered',
              'cancelled': 'cancelled'
          };
          const badgeClass = statusMap[order.status] || 'processing';

          tbody.innerHTML += `
            <tr>
                <td><span class="order-id">#ORD-${order.id}</span></td>
                <td><span class="order-date">${date}</span></td>
                <td>${order.items_count} volumes</td>
                <td><span class="badge badge-${badgeClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                <td style="font-weight:500">$${parseFloat(order.total_price).toFixed(2)}</td>
                <td><div class="action-btns"><button class="btn btn-ghost btn-sm btn-invoice" onclick="showToast('Invoice not available yet')">Invoice</button></div></td>
            </tr>
          `;
      });

      const summaryNums = document.querySelectorAll('.sum-num');
      if (summaryNums.length >= 3) {
          summaryNums[0].textContent = orders.length;
          summaryNums[1].textContent = '$' + totalSpent.toFixed(2);
          summaryNums[2].textContent = totalItems;
      }
  }

  /* ── Helpers ── */
  function showFlash(el, type, msg) {
    if (!el) return;
    el.className = `flash flash-${type} show`;
    el.textContent = msg;
    setTimeout(() => el.classList.remove('show'), 5000);
  }

  window.showToast = function(msg) {
    let toast = document.getElementById('ne-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ne-toast';
      toast.style.cssText = `
        position: fixed; bottom: 28px; right: 28px;
        background: #1c2840; border: 1px solid rgba(201,168,76,0.3);
        color: #e8e2d4; font-family: 'Jost', sans-serif;
        font-size: 13px; font-weight: 300; letter-spacing: 0.3px;
        padding: 12px 22px; border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        z-index: 9999; opacity: 0;
        transition: opacity 0.3s, transform 0.3s;
        transform: translateY(10px);
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 3200);
  };

});
