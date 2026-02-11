/**
 * Admin JavaScript
 * Handles: Dashboard, Orders, Messages, Cake Management
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Admin panel initializing...');

  // Determine which page we're on and initialize accordingly
  const page = window.location.pathname.split('/').pop();

  if (page === 'index.html' || page === 'admin-index.html' || page === '') {
    initializeDashboard();
  } else if (page === 'cake-orders.html') {
    initializeOrdersPage();
  } else if (page === 'customer-messages.html') {
    initializeMessagesPage();
  }

  // Common initialization
  setupLogout();

  console.log('✅ Admin panel ready');
});

// ==========================================
// DASHBOARD
// ==========================================

function initializeDashboard() {
  loadDashboardStats();
  loadRecentOrders();

  // Set up real-time updates
  window.dataManager.onOrdersChange(() => {
    loadDashboardStats();
    loadRecentOrders();
  });

  window.dataManager.onMessagesChange(() => {
    loadDashboardStats();
  });
}

function loadDashboardStats() {
  try {
    const stats = window.dataManager.getOrderStats();
    const messageCount = window.dataManager.getUnreadMessageCount();

    // Update stat cards
    document.getElementById('totalOrders').textContent = stats.total;
    document.getElementById('pendingOrders').textContent = stats.pending;
    document.getElementById('completedToday').textContent = stats.todayDelivered;
    document.getElementById('unreadMessages').textContent = messageCount;

  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }
}

function loadRecentOrders() {
  try {
    const orders = window.dataManager.getOrders();
    const tableBody = document.getElementById('recentOrdersTable');

    if (!tableBody) return;

    if (orders.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-medium);">
            No orders yet. Orders will appear here when customers place them.
          </td>
        </tr>
      `;
      return;
    }

    // Show last 5 orders
    const recentOrders = orders.slice(0, 5);

    tableBody.innerHTML = recentOrders.map(order => `
      <tr>
        <td><strong>${order.id}</strong></td>
        <td>${order.customerName}</td>
        <td>${order.cakeName || 'N/A'}</td>
        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
        <td>
          <span class="status-badge status-${order.status.toLowerCase()}">
            ${order.status}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-secondary btn-small" onclick="viewOrder('${order.id}')">View</button>
          </div>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Error loading recent orders:', error);
  }
}

// Global function for view order button
window.viewOrder = function(orderId) {
  window.location.href = `cake-orders.html?orderId=${orderId}`;
};

// ==========================================
// CAKE ORDERS PAGE
// ==========================================

let allOrders = [];

function initializeOrdersPage() {
  loadOrders();
  setupOrderSearch();
  setupOrderModal();

  // Set up real-time updates
  window.dataManager.onOrdersChange((orders) => {
    allOrders = orders;
    displayOrders(orders);
  });

  // Check for highlighted order from URL
  const urlParams = new URLSearchParams(window.location.search);
  const highlightOrderId = urlParams.get('orderId');
  if (highlightOrderId) {
    setTimeout(() => viewOrderDetails(highlightOrderId), 500);
  }
}

function loadOrders() {
  try {
    allOrders = window.dataManager.getOrders();
    displayOrders(allOrders);
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

function displayOrders(orders) {
  const tableBody = document.getElementById('ordersTable');
  const ordersCount = document.getElementById('ordersCount');

  if (!tableBody) return;

  ordersCount.textContent = orders.length;

  if (orders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <div class="empty-state-title">No Orders Yet</div>
            <div class="empty-state-text">Orders from customers will appear here</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = orders.map(order => `
    <tr>
      <td><strong>${order.id}</strong></td>
      <td>
        <div>${order.customerName}</div>
        <div style="font-size: 0.85rem; color: var(--text-medium);">${order.customerPhone}</div>
      </td>
      <td>${order.cakeName || 'N/A'}</td>
      <td>
        <div>${order.size || 'N/A'}</div>
        <div style="font-size: 0.85rem; color: var(--text-medium);">${order.layers ? order.layers + ' layers' : ''}</div>
      </td>
      <td>${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}</td>
      <td>
        <select 
          class="status-badge status-${order.status.toLowerCase()}" 
          style="border: none; cursor: pointer; font-weight: 600;"
          onchange="updateOrderStatus('${order.id}', this.value)">
          <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="Baking" ${order.status === 'Baking' ? 'selected' : ''}>Baking</option>
          <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-secondary btn-small" onclick="viewOrderDetails('${order.id}')">
            View Details
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function setupOrderSearch() {
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');

  if (searchInput) {
    searchInput.addEventListener('input', filterOrders);
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', filterOrders);
  }
}

function filterOrders() {
  const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';

  let filtered = allOrders;

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter(order =>
      order.id.toLowerCase().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm) ||
      order.customerPhone.includes(searchTerm) ||
      (order.cakeName && order.cakeName.toLowerCase().includes(searchTerm))
    );
  }

  // Filter by status
  if (statusFilter !== 'all') {
    filtered = filtered.filter(order => order.status === statusFilter);
  }

  displayOrders(filtered);
}

// Global function for status update
window.updateOrderStatus = function(orderId, newStatus) {
  try {
    window.dataManager.updateOrderStatus(orderId, newStatus);
    console.log(`✅ Order ${orderId} updated to ${newStatus}`);
    
    // Show brief feedback
    const statusSelect = event.target;
    const originalBg = statusSelect.style.backgroundColor;
    statusSelect.style.backgroundColor = '#90EE90';
    setTimeout(() => {
      statusSelect.style.backgroundColor = originalBg;
    }, 500);

  } catch (error) {
    console.error('Error updating order status:', error);
    alert('Error updating order status. Please try again.');
  }
};

// Global function for view order details
window.viewOrderDetails = function(orderId) {
  try {
    const order = window.dataManager.getOrderById(orderId);
    if (!order) {
      alert('Order not found');
      return;
    }

    const detailsContent = document.getElementById('orderDetailsContent');
    if (!detailsContent) return;

    detailsContent.innerHTML = `
      <div class="order-details-grid">
        <div class="order-detail-item">
          <div class="order-detail-label">Order ID</div>
          <div class="order-detail-value">${order.id}</div>
        </div>
        <div class="order-detail-item">
          <div class="order-detail-label">Status</div>
          <div class="order-detail-value">
            <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
          </div>
        </div>
        <div class="order-detail-item">
          <div class="order-detail-label">Order Date</div>
          <div class="order-detail-value">${new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div class="order-detail-item">
          <div class="order-detail-label">Delivery Date</div>
          <div class="order-detail-value">${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}</div>
        </div>
      </div>

      <h3 style="margin: 2rem 0 1rem; color: var(--primary-color);">Cake Details</h3>
      <div class="order-details-grid">
        <div class="order-detail-item">
          <div class="order-detail-label">Cake Type</div>
          <div class="order-detail-value">${order.cakeName || 'N/A'}</div>
        </div>
        <div class="order-detail-item">
          <div class="order-detail-label">Size</div>
          <div class="order-detail-value">${order.size || 'N/A'}</div>
        </div>
        <div class="order-detail-item">
          <div class="order-detail-label">Layers</div>
          <div class="order-detail-value">${order.layers || 'N/A'}</div>
        </div>
        <div class="order-detail-item">
          <div class="order-detail-label">Flavor</div>
          <div class="order-detail-value">${order.flavor || 'N/A'}</div>
        </div>
        <div class="order-detail-item">
          <div class="order-detail-label">Quantity</div>
          <div class="order-detail-value">${order.quantity || 1}</div>
        </div>
        <div class="order-detail-item">
          <div class="order-detail-label">Delivery Option</div>
          <div class="order-detail-value">${order.deliveryOption === 'pickup' ? 'Pickup' : 'Delivery'}</div>
        </div>
      </div>

      <h3 style="margin: 2rem 0 1rem; color: var(--primary-color);">Customer Information</h3>
      <div class="order-details-grid">
        <div class="order-detail-item">
          <div class="order-detail-label">Name</div>
          <div class="order-detail-value">${order.customerName}</div>
        </div>
        <div class="order-detail-item">
          <div class="order-detail-label">Phone</div>
          <div class="order-detail-value">${order.customerPhone}</div>
        </div>
        <div class="order-detail-item">
          <div class="order-detail-label">Email</div>
          <div class="order-detail-value">${order.customerEmail || 'Not provided'}</div>
        </div>
        ${order.deliveryOption === 'delivery' ? `
        <div class="order-detail-item" style="grid-column: 1 / -1;">
          <div class="order-detail-label">Delivery Address</div>
          <div class="order-detail-value">${order.deliveryAddress || 'N/A'}</div>
        </div>
        ` : ''}
      </div>

      ${order.specialRequests ? `
        <h3 style="margin: 2rem 0 1rem; color: var(--primary-color);">Special Requests</h3>
        <div style="background: var(--cream); padding: 1.5rem; border-radius: var(--radius-md); border-left: 4px solid var(--accent-gold);">
          ${order.specialRequests}
        </div>
      ` : ''}

      <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
        <button class="btn btn-secondary" onclick="closeOrderModal()">Close</button>
        <button class="btn btn-success" onclick="callCustomer('${order.customerPhone}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Call Customer
        </button>
      </div>
    `;

    document.getElementById('orderModal').classList.add('show');

  } catch (error) {
    console.error('Error viewing order details:', error);
  }
};

function setupOrderModal() {
  const modal = document.getElementById('orderModal');
  if (!modal) return;

  // Close modal when clicking outside
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeOrderModal();
    }
  });
}

window.closeOrderModal = function() {
  document.getElementById('orderModal')?.classList.remove('show');
};

window.callCustomer = function(phone) {
  window.location.href = `tel:${phone}`;
};

window.exportOrders = function() {
  try {
    const orders = window.dataManager.getOrders();
    
    if (orders.length === 0) {
      alert('No orders to export');
      return;
    }

    // Simple CSV export
    let csv = 'Order ID,Customer Name,Phone,Email,Cake,Size,Layers,Flavor,Quantity,Delivery Date,Status,Special Requests\n';

    orders.forEach(order => {
      csv += `${order.id},${order.customerName},${order.customerPhone},${order.customerEmail || ''},${order.cakeName || ''},${order.size || ''},${order.layers || ''},${order.flavor || ''},${order.quantity || 1},${order.deliveryDate || ''},${order.status},"${order.specialRequests || ''}"\n`;
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

  } catch (error) {
    console.error('Error exporting orders:', error);
    alert('Error exporting orders. Please try again.');
  }
};

// ==========================================
// CUSTOMER MESSAGES PAGE
// ==========================================

let allMessages = [];

function initializeMessagesPage() {
  loadMessages();
  setupReplyModal();

  // Set up real-time updates
  window.dataManager.onMessagesChange((messages) => {
    allMessages = messages;
    displayMessages();
  });
}

function loadMessages() {
  try {
    allMessages = window.dataManager.getMessages();
    displayMessages();
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

function displayMessages() {
  const container = document.getElementById('messagesContainer');
  const messagesCount = document.getElementById('messagesCount');

  if (!container) return;

  messagesCount.textContent = allMessages.length;

  if (allMessages.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💬</div>
        <div class="empty-state-title">No Messages Yet</div>
        <div class="empty-state-text">Customer messages will appear here when they use the chat feature</div>
      </div>
    `;
    return;
  }

  // Group messages by sender
  const groupedMessages = groupMessagesBySender(allMessages);

  container.innerHTML = `
    <div class="chat-messages-list">
      ${groupedMessages.map(conversation => `
        <div class="chat-message-card">
          <div class="chat-message-header">
            <div>
              <div class="chat-sender">${conversation.sender}</div>
              <div style="font-size: 0.85rem; color: var(--text-medium); margin-top: 0.25rem;">
                ${conversation.messages.length} message${conversation.messages.length > 1 ? 's' : ''}
              </div>
            </div>
            <div class="chat-time">
              ${new Date(conversation.lastMessage.timestamp).toLocaleString()}
            </div>
          </div>

          <div style="margin-bottom: 1rem;">
            ${conversation.messages.map(msg => `
              <div style="margin-bottom: 1rem; padding: 1rem; background: ${msg.isAdmin ? 'var(--cream)' : 'white'}; border-radius: var(--radius-sm); border-left: 3px solid ${msg.isAdmin ? 'var(--primary-color)' : 'var(--accent-gold)'};">
                <div style="font-size: 0.8rem; color: var(--text-medium); margin-bottom: 0.5rem;">
                  ${msg.isAdmin ? '👨‍💼 Admin' : '👤 ' + msg.sender} • ${new Date(msg.timestamp).toLocaleString()}
                </div>
                <div style="color: var(--text-dark);">${msg.text}</div>
              </div>
            `).join('')}
          </div>

          <button class="btn btn-primary btn-small" onclick="openReplyModal('${conversation.sender}', \`${conversation.lastMessage.text.replace(/`/g, '\\`')}\`)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Reply to Customer
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

function groupMessagesBySender(messages) {
  const conversations = {};

  messages.forEach(msg => {
    if (msg.isAdmin) return;

    if (!conversations[msg.sender]) {
      conversations[msg.sender] = {
        sender: msg.sender,
        messages: [],
        lastMessage: msg
      };
    }

    conversations[msg.sender].messages.push(msg);

    if (msg.timestamp > conversations[msg.sender].lastMessage.timestamp) {
      conversations[msg.sender].lastMessage = msg;
    }
  });

  // Add admin replies to conversations
  messages.forEach(msg => {
    if (msg.isAdmin) {
      Object.values(conversations).forEach(conv => {
        if (Math.abs(msg.timestamp - conv.lastMessage.timestamp) < 3600000) {
          conv.messages.push(msg);
        }
      });
    }
  });

  // Sort messages within each conversation
  Object.values(conversations).forEach(conv => {
    conv.messages.sort((a, b) => a.timestamp - b.timestamp);
  });

  return Object.values(conversations).sort((a, b) =>
    b.lastMessage.timestamp - a.lastMessage.timestamp
  );
}

let currentReplyingTo = null;

window.openReplyModal = function(sender, messageText) {
  currentReplyingTo = sender;
  document.getElementById('originalMessageText').textContent = messageText;
  document.getElementById('replyText').value = '';
  document.getElementById('replyModal').classList.add('show');
};

window.closeReplyModal = function() {
  document.getElementById('replyModal')?.classList.remove('show');
  currentReplyingTo = null;
};

function setupReplyModal() {
  const replyForm = document.getElementById('replyForm');
  const modal = document.getElementById('replyModal');

  if (replyForm) {
    replyForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const replyText = document.getElementById('replyText').value.trim();
      if (!replyText || !currentReplyingTo) return;

      try {
        window.dataManager.sendMessage({
          sender: 'Sweet Delights Admin',
          text: replyText,
          isAdmin: true,
          replyTo: currentReplyingTo
        });

        alert(`Reply sent to ${currentReplyingTo}!`);
        closeReplyModal();

      } catch (error) {
        console.error('Error sending reply:', error);
        alert('Error sending reply. Please try again.');
      }
    });
  }

  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeReplyModal();
      }
    });
  }
}

window.refreshMessages = function() {
  loadMessages();

  const btn = event.target.closest('button');
  const originalText = btn.innerHTML;
  btn.innerHTML = '✓ Refreshed';
  setTimeout(() => {
    btn.innerHTML = originalText;
  }, 1500);
};


// ==========================================
// COMMON FUNCTIONS
// ==========================================

function setupLogout() {
  // Logout function (global)
  window.logout = function() {
    if (confirm('Are you sure you want to logout?')) {
      sessionStorage.removeItem('adminLoggedIn');
      window.location.href = '../index.html';
    }
  };
}

console.log('✅ Admin JavaScript loaded');