/**
 * Main JavaScript for Public Pages
 * Handles: Order forms, Gallery, Chat, Order tracking
 */

// Wait for DOM and Firebase to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Public site initializing...');

  initializeOrderForm();
  initializeGallery();
  initializeChat();
  initializeOrderTracking();
  setMinimumDate();
  highlightActiveNav();

  console.log('✅ Public site ready');
});

// ==========================================
// ORDER FORM
// ==========================================

function initializeOrderForm() {
  const orderForm = document.getElementById('orderForm');
  if (!orderForm) return;

  orderForm.addEventListener('submit', function(e) {
    e.preventDefault();

    try {
      // Disable submit button to prevent double submission
      const submitBtn = orderForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      // Get form data
      const orderData = {
        cakeId: document.querySelector('select[name="cake"]')?.value || '',
        cakeName: document.querySelector('select[name="cake"] option:checked')?.textContent || '',
        size: document.querySelector('select[name="size"]')?.value || '',
        layers: document.querySelector('select[name="layers"]')?.value || '',
        quantity: parseInt(document.getElementById('quantity')?.value) || 1,
        deliveryDate: document.querySelector('input[name="deliveryDate"]')?.value || '',
        deliveryOption: document.querySelector('select[name="deliveryOption"]')?.value || 'pickup',
        customerName: document.querySelector('input[name="customerName"]')?.value || '',
        customerPhone: document.querySelector('input[name="phone"]')?.value || '',
        customerEmail: document.querySelector('input[name="email"]')?.value || '',
        deliveryAddress: document.getElementById('deliveryAddress')?.value || '',
        specialRequests: document.querySelector('textarea[name="notes"]')?.value || ''
      };

      // Create order in Firebase
      const order = window.dataManager.createOrder(orderData);

      // Show confirmation
      showOrderConfirmation(order);

      // Reset form
      orderForm.reset();

      // Redirect to my-orders page after 3 seconds
      setTimeout(() => {
        window.location.href = 'my-orders.html';
      }, 3000);

      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        Place Order
      `;

    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Sorry, there was an error submitting your order. Please try again.');
      
      // Re-enable button
      const submitBtn = orderForm.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
    }
  });
}

function showOrderConfirmation(order) {
  // Update confirmation section
  const confirmationSection = document.getElementById('orderConfirmation');
  const orderIdElement = document.getElementById('orderId');
  const paymentRefElement = document.getElementById('paymentReference');

  if (confirmationSection && orderIdElement) {
    orderIdElement.textContent = order.id;
    
    if (paymentRefElement) {
      paymentRefElement.textContent = order.id;
    }

    // Add redirect message
    if (!confirmationSection.querySelector('.redirect-message')) {
      const redirectMsg = document.createElement('p');
      redirectMsg.className = 'redirect-message';
      redirectMsg.style.cssText = 'margin-top: 1.5rem; padding: 1rem; background: var(--cream); border-radius: 10px; font-weight: 600; color: var(--primary-color);';
      redirectMsg.innerHTML = '🔄 Redirecting to My Orders page in 3 seconds...';
      confirmationSection.appendChild(redirectMsg);
    }

    confirmationSection.classList.add('show');
    confirmationSection.style.display = 'block';

    // Scroll to confirmation
    confirmationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ==========================================
// GALLERY & MODAL
// ==========================================

function initializeGallery() {
  const modal = document.getElementById('cakeModal');
  if (!modal) return;

  const modalTitle = document.getElementById('modalTitle');
  const modalSizes = document.getElementById('modalSizes');
  const modalLayers = document.getElementById('modalLayers');
  const modalDescription = document.getElementById('modalDescription');
  const modalImage = document.getElementById('modalImage');
  const closeBtn = document.querySelector('.close');

  // Add click event to all cake cards
  document.querySelectorAll('.cake-card').forEach(card => {
    card.addEventListener('click', function() {
      // Get data from card
      const name = this.dataset.name;
      const sizes = this.dataset.sizes;
      const layers = this.dataset.layers;
      const description = this.dataset.description;
      const image = this.dataset.image;

      // Populate modal
      if (modalTitle) modalTitle.textContent = name;
      if (modalSizes) modalSizes.textContent = sizes;
      if (modalLayers) modalLayers.textContent = layers;
      if (modalDescription) modalDescription.textContent = description;
      if (modalImage) {
        modalImage.src = image;
        modalImage.alt = name;
      }

      // Show modal
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal on close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Close modal on outside click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });

  function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// ==========================================
// CHAT FUNCTIONALITY
// ==========================================

function initializeChat() {
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatBox = document.getElementById('chatBox');

  if (!chatForm || !chatInput || !chatBox) return;

  let currentUser = 'Guest_' + Math.random().toString(36).substr(2, 6);
  let messagesLoaded = false;

  // Load existing messages
  loadChatMessages();

  // Listen for new messages in real-time
  window.dataManager.onMessagesChange((messages) => {
    displayChatMessages(messages);
  });

  // Handle form submission
  chatForm.addEventListener('submit', function(e)  {
    e.preventDefault();

    const messageText = chatInput.value.trim();
    if (!messageText) return;

    try {
      // Send message to Firebase
      window.dataManager.sendMessage({
        sender: currentUser,
        text: messageText,
        isAdmin: false
      });

      // Clear input
      chatInput.value = '';

      // Focus back on input
      chatInput.focus();

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  });

  function loadChatMessages() {
    try {
      const messages = window.dataManager.getMessages();
      displayChatMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  function displayChatMessages(messages) {
    if (messages.length === 0 && !messagesLoaded) {
      chatBox.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-medium);">
          👋 Welcome! Start the conversation by sending a message below.
        </div>
      `;
      return;
    }

    messagesLoaded = true;

    chatBox.innerHTML = messages.map(msg => `
      <div class="chat-message ${msg.isAdmin ? 'business-message' : 'user-message'}">
        <div style="font-size: 0.75rem; margin-bottom: 0.25rem; opacity: 0.8;">
          ${msg.sender} • ${new Date(msg.timestamp).toLocaleTimeString()}
        </div>
        ${msg.text}
      </div>
    `).join('');

    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

// ==========================================
// ORDER TRACKING
// ==========================================

function initializeOrderTracking() {
  const trackingForm = document.querySelector('.tracking-form');
  if (!trackingForm) return;

  trackingForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const trackingInput = document.getElementById('trackingInput');
    const orderId = trackingInput.value.trim().toUpperCase();

    if (!orderId) return;

    try {
      // Get order from Firebase
      const order = window.dataManager.getOrderById(orderId);

      const resultDiv = document.getElementById('trackingResult');
      
      if (order) {
        displayOrderTracking(order, resultDiv);
      } else {
        resultDiv.innerHTML = `
          <div style="padding: 2rem; background: white; border-radius: 20px; border: 2px solid var(--light-peach); text-align: center;">
            <p style="color: var(--error-red); font-size: 1rem;">
              Order not found. Please check your Order ID and try again.
            </p>
          </div>
        `;
        resultDiv.classList.add('show');
      }

    } catch (error) {
      console.error('Error tracking order:', error);
      alert('Error tracking order. Please try again.');
    }
  });
}

function displayOrderTracking(order, resultDiv) {
  const statusColors = {
    'Pending': '#FFA500',
    'Confirmed': '#4CAF50',
    'Baking': '#FF6B6B',
    'Delivered': '#4CAF50',
    'Cancelled': '#FF4444'
  };

  resultDiv.innerHTML = `
    <div class="tracking-header">
      <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="${statusColors[order.status]}" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <div>
        <h4 style="color: ${statusColors[order.status]};">${order.status}</h4>
        <p>Order #${order.id}</p>
      </div>
    </div>
    <div class="tracking-details">
      <div class="tracking-detail">
        <h5>Cake</h5>
        <p>${order.cakeName || 'N/A'}</p>
      </div>
      <div class="tracking-detail">
        <h5>Size & Layers</h5>
        <p>${order.size || 'N/A'}, ${order.layers || 'N/A'} layers</p>
      </div>
      <div class="tracking-detail">
        <h5>Delivery Date</h5>
        <p>${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}</p>
      </div>
      <div class="tracking-detail">
        <h5>Customer</h5>
        <p>${order.customerName}</p>
      </div>
    </div>
    ${order.status !== 'Cancelled' && order.status !== 'Delivered' ? `
      <button 
        class="btn-secondary" 
        onclick="cancelTrackedOrder('${order.id}')" 
        style="width: 100%; margin-top: 1rem;">
        Cancel Order
      </button>
    ` : ''}
  `;
  resultDiv.classList.add('show');
}

// Global function for cancel button
window.cancelTrackedOrder = function(orderId) {
  if (!confirm('Are you sure you want to cancel this order?')) {
    return;
  }

  try {
    window.dataManager.cancelOrder(orderId);
    alert('Order cancelled successfully');
    
    // Clear tracking display
    const trackingInput = document.getElementById('trackingInput');
    const resultDiv = document.getElementById('trackingResult');
    if (trackingInput) trackingInput.value = '';
    if (resultDiv) resultDiv.classList.remove('show');

  } catch (error) {
    console.error('Error cancelling order:', error);
    alert('Error cancelling order. Please try again.');
  }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function setMinimumDate() {
  const dateInput = document.querySelector('input[type="date"]');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
  }
}

function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ==========================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ==========================================
// SCROLL ANIMATIONS FOR CAKE CARDS
// ==========================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, index * 100);
    }
  });
}, observerOptions);

// Observe all cake cards
document.querySelectorAll('.cake-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(card);
});

console.log('✅ Public site JavaScript loaded');