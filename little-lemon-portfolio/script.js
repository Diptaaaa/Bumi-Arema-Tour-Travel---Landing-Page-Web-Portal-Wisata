/**
 * Little Lemon Restaurant - Interactive Features
 * Vanilla JavaScript Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveHoursStatus();
  initReservationModal();
  initMenuFilter();
  initCartSimulation();
  initNewsletter();
  initSmoothScroll();
});

/* --------------------------------------------------------------------------
   1. Live Opening Hours Status
   -------------------------------------------------------------------------- */
function initLiveHoursStatus() {
  const statusBadge = document.getElementById('live-status-badge');
  if (!statusBadge) return;

  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1-5 = Mon-Fri, 6 = Sat
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTimeInMinutes = hour * 60 + minute;

  // Operating Hours in minutes from midnight
  let openTime = 14 * 60; // 2:00 PM (14:00)
  let closeTime = 22 * 60; // 10:00 PM (22:00)
  let closeStr = '10:00 PM';

  if (day === 6) { // Saturday
    closeTime = 23 * 60; // 11:00 PM
    closeStr = '11:00 PM';
  } else if (day === 0) { // Sunday
    closeTime = 21 * 60; // 9:00 PM
    closeStr = '9:00 PM';
  }

  const isOpen = currentTimeInMinutes >= openTime && currentTimeInMinutes < closeTime;

  if (isOpen) {
    statusBadge.className = 'status-badge status-open';
    statusBadge.innerHTML = `<span class="pulse-dot"></span> Open Now &bull; Closes ${closeStr}`;
  } else {
    statusBadge.className = 'status-badge status-closed';
    statusBadge.innerHTML = `<span class="closed-dot"></span> Closed &bull; Opens at 2:00 PM`;
  }
}

/* --------------------------------------------------------------------------
   2. Table Reservation Modal & Receipt
   -------------------------------------------------------------------------- */
function initReservationModal() {
  const modal = document.getElementById('reservation-modal');
  const receiptModal = document.getElementById('receipt-modal');
  const form = document.getElementById('reservation-form');
  const dateInput = document.getElementById('res-date');

  if (!modal || !form) return;

  // Set minimum booking date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  // Open modal buttons
  const openButtons = document.querySelectorAll('[data-action="open-reservation"]');
  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modal);
    });
  });

  // Close modal buttons
  const closeButtons = document.querySelectorAll('[data-action="close-modal"]');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(modal);
      if (receiptModal) closeModal(receiptModal);
    });
  });

  // Click outside to close
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
    if (e.target === receiptModal) closeModal(receiptModal);
  });

  // ESC key to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(modal);
      if (receiptModal) closeModal(receiptModal);
    }
  });

  // Form Submit Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('res-name').value.trim();
    const email = document.getElementById('res-email').value.trim();
    const phone = document.getElementById('res-phone').value.trim();
    const date = document.getElementById('res-date').value;
    const time = document.getElementById('res-time').value;
    const guests = document.getElementById('res-guests').value;
    const seating = document.querySelector('input[name="seating"]:checked')?.value || 'Indoor Dining';
    const occasion = document.getElementById('res-occasion').value;

    if (!name || !email || !phone || !date || !time || !guests) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    // Generate random booking reference
    const refCode = 'LL-' + Math.floor(100000 + Math.random() * 900000);

    // Populate Receipt
    document.getElementById('receipt-ref').textContent = refCode;
    document.getElementById('receipt-name').textContent = name;
    document.getElementById('receipt-datetime').textContent = `${formatDate(date)} at ${time}`;
    document.getElementById('receipt-party').textContent = `${guests} Guests (${seating})`;
    document.getElementById('receipt-occasion').textContent = occasion;

    // Transition from Form Modal to Receipt Modal
    closeModal(modal);
    form.reset();
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    setTimeout(() => {
      if (receiptModal) openModal(receiptModal);
      showToast(`Reservation confirmed! Ref: ${refCode}`, 'success');
    }, 200);
  });
}

function openModal(modalEl) {
  modalEl.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalEl) {
  modalEl.classList.remove('active');
  document.body.style.overflow = '';
}

function formatDate(dateString) {
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  const d = new Date(dateString + 'T00:00:00');
  return d.toLocaleDateString('en-US', options);
}

/* --------------------------------------------------------------------------
   3. Menu Category Filter
   -------------------------------------------------------------------------- */
function initMenuFilter() {
  const filterBtns = document.querySelectorAll('.filter-chip');
  const menuCards = document.querySelectorAll('.menu-dish-card');

  if (!filterBtns.length || !menuCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterCategory = btn.getAttribute('data-filter');

      menuCards.forEach(card => {
        const itemCategory = card.getAttribute('data-category');
        if (filterCategory === 'all' || itemCategory === filterCategory) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   4. Cart Simulation & Quick Add to Order
   -------------------------------------------------------------------------- */
let cartCount = 0;

function initCartSimulation() {
  const addButtons = document.querySelectorAll('[data-action="add-to-order"]');
  const cartBadge = document.getElementById('cart-count');

  addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const itemName = btn.getAttribute('data-item') || 'Item';
      const itemPrice = btn.getAttribute('data-price') || '$12.00';

      cartCount++;
      if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.classList.add('bump');
        setTimeout(() => cartBadge.classList.remove('bump'), 300);
      }

      showToast(`Added "${itemName}" (${itemPrice}) to your order!`, 'success');
    });
  });
}

/* --------------------------------------------------------------------------
   5. Newsletter Form
   -------------------------------------------------------------------------- */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && emailInput.value) {
      showToast('Thank you! Your 30% weekend voucher was sent to your inbox.', 'success');
      emailInput.value = '';
    }
  });
}

/* --------------------------------------------------------------------------
   6. Smooth Scrolling for Navigation Links
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#book') return; // '#book' is handled by modal

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   7. Toast Notification Utility
   -------------------------------------------------------------------------- */
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
    <span class="toast-message">${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Trigger enter animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
