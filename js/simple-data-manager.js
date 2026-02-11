/**
 * Simple Data Manager - Pure Frontend (localStorage)
 * No Firebase, no backend, just works!
 */

class SimpleDataManager {
  constructor() {
    this.initializeDefaultData();
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================
  
  initializeDefaultData() {
    // Initialize cakes if not exists
    if (!localStorage.getItem('bakery_cakes')) {
      const defaultCakes = [
        {
          id: 'cake_1',
          name: 'Chocolate Delight',
          description: 'Rich chocolate sponge with creamy chocolate frosting',
          price: 15000,
          category: 'Classic',
          sizes: ['6 inch', '8 inch', '10 inch', '12 inch'],
          layers: [2, 3, 4],
          flavors: ['Dark Chocolate', 'Milk Chocolate', 'White Chocolate'],
          image: 'images/chocolate cake.jpg',
          available: true
        },
        {
          id: 'cake_2',
          name: 'Vanilla Dream',
          description: 'Classic vanilla cake with smooth buttercream frosting',
          price: 12000,
          category: 'Classic',
          sizes: ['6 inch', '8 inch', '10 inch'],
          layers: [2, 3],
          flavors: ['Madagascar Vanilla', 'French Vanilla', 'Vanilla Buttercream'],
          image: 'images/vanilla cake.jpg',
          available: true
        },
        {
          id: 'cake_3',
          name: 'Red Velvet Romance',
          description: 'Soft red velvet cake with rich cream cheese frosting',
          price: 18000,
          category: 'Premium',
          sizes: ['8 inch', '10 inch', '12 inch'],
          layers: [3, 4],
          flavors: ['Traditional Red Velvet', 'Raspberry Red Velvet'],
          image: 'images/red velvet cake.jpg',
          available: true
        },
        {
          id: 'cake_4',
          name: 'Strawberry Passion',
          description: 'Fresh strawberries layered with light cream',
          price: 16000,
          category: 'Classic',
          sizes: ['6 inch', '8 inch', '10 inch'],
          layers: [2, 3],
          flavors: ['Fresh Strawberry', 'Strawberry Cream'],
          image: 'images/strawberry cake.jpg',
          available: true
        },
        {
          id: 'cake_5',
          name: 'Lemon Bliss',
          description: 'Zesty lemon cake with tangy lemon filling',
          price: 14000,
          category: 'Classic',
          sizes: ['6 inch', '8 inch', '10 inch'],
          layers: [2, 3],
          flavors: ['Lemon Curd', 'Lemon Buttercream', 'Lemon Raspberry'],
          image: 'images/chocolate cake.jpg',
          available: true
        },
        {
          id: 'cake_6',
          name: 'Caramel Heaven',
          description: 'Decadent caramel layers with smooth caramel drizzle',
          price: 20000,
          category: 'Premium',
          sizes: ['8 inch', '10 inch', '12 inch'],
          layers: [3, 4],
          flavors: ['Salted Caramel', 'Caramel Pecan', 'Dulce de Leche'],
          image: 'images/chocolate cake.jpg',
          available: true
        }
      ];
      
      localStorage.setItem('bakery_cakes', JSON.stringify(defaultCakes));
    }

    // Initialize orders array if not exists
    if (!localStorage.getItem('bakery_orders')) {
      localStorage.setItem('bakery_orders', JSON.stringify([]));
    }

    // Initialize messages array if not exists
    if (!localStorage.getItem('bakery_messages')) {
      localStorage.setItem('bakery_messages', JSON.stringify([]));
    }

    // Initialize admin users
    if (!localStorage.getItem('bakery_admins')) {
      // Default admin credentials
      const admins = [
        {
          email: 'admin@sweetdelights.com',
          password: 'admin123',
          name: 'Admin User'
        }
      ];
      localStorage.setItem('bakery_admins', JSON.stringify(admins));
    }
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  login(email, password) {
    // Check if admin
    const admins = JSON.parse(localStorage.getItem('bakery_admins') || '[]');
    const admin = admins.find(a => a.email === email && a.password === password);
    
    if (admin) {
      const session = {
        email: admin.email,
        name: admin.name,
        isAdmin: true,
        loginTime: Date.now()
      };
      localStorage.setItem('current_user', JSON.stringify(session));
      return { success: true, isAdmin: true, user: session };
    }

    return { success: false, message: 'Invalid credentials' };
  }

  logout() {
    localStorage.removeItem('current_user');
  }

  getCurrentUser() {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.isAdmin === true;
  }

  // ==========================================
  // CAKES
  // ==========================================
  
  getCakes() {
    return JSON.parse(localStorage.getItem('bakery_cakes') || '[]');
  }

  getAvailableCakes() {
    return this.getCakes().filter(cake => cake.available);
  }

  getCakeById(id) {
    const cakes = this.getCakes();
    return cakes.find(cake => cake.id === id);
  }

  saveCake(cakeData) {
    const cakes = this.getCakes();
    
    if (!cakeData.id) {
      cakeData.id = 'cake_' + Date.now();
    }

    const index = cakes.findIndex(c => c.id === cakeData.id);
    
    if (index >= 0) {
      cakes[index] = cakeData;
    } else {
      cakes.push(cakeData);
    }

    localStorage.setItem('bakery_cakes', JSON.stringify(cakes));
    return cakeData;
  }

  deleteCake(id) {
    let cakes = this.getCakes();
    cakes = cakes.filter(cake => cake.id !== id);
    localStorage.setItem('bakery_cakes', JSON.stringify(cakes));
  }

  // ==========================================
  // ORDERS
  // ==========================================
  
  createOrder(orderData) {
    const orders = this.getOrders();
    
    const orderId = 'ORD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    const order = {
      id: orderId,
      ...orderData,
      status: 'Pending',
      createdAt: Date.now()
    };

    orders.push(order);
    localStorage.setItem('bakery_orders', JSON.stringify(orders));
    
    return order;
  }

  getOrders() {
    const orders = JSON.parse(localStorage.getItem('bakery_orders') || '[]');
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  }

  getOrderById(id) {
    const orders = this.getOrders();
    return orders.find(order => order.id === id);
  }

  getOrdersByStatus(status) {
    return this.getOrders().filter(order => order.status === status);
  }

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
      order.status = newStatus;
      order.updatedAt = Date.now();
      localStorage.setItem('bakery_orders', JSON.stringify(orders));
      
      // Trigger custom event for real-time updates
      window.dispatchEvent(new CustomEvent('ordersChanged', { detail: orders }));
    }
  }

  cancelOrder(orderId) {
    this.updateOrderStatus(orderId, 'Cancelled');
  }

  getOrderStats() {
    const orders = this.getOrders();
    
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Pending').length,
      confirmed: orders.filter(o => o.status === 'Confirmed').length,
      baking: orders.filter(o => o.status === 'Baking').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length
    };

    // Today's stats
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    
    stats.todayTotal = todayOrders.length;
    stats.todayDelivered = todayOrders.filter(o => o.status === 'Delivered').length;

    return stats;
  }

  // ==========================================
  // MESSAGES
  // ==========================================
  
  sendMessage(messageData) {
    const messages = this.getMessages();
    
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const message = {
      id: messageId,
      ...messageData,
      timestamp: Date.now()
    };

    messages.push(message);
    localStorage.setItem('bakery_messages', JSON.stringify(messages));
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('messagesChanged', { detail: messages }));
    
    return message;
  }

  getMessages() {
    return JSON.parse(localStorage.getItem('bakery_messages') || '[]').sort((a, b) => a.timestamp - b.timestamp);
  }

  getUnreadMessageCount() {
    const messages = this.getMessages();
    return messages.filter(m => !m.isAdmin).length;
  }

  // ==========================================
  // EVENT LISTENERS (for real-time updates)
  // ==========================================

  onOrdersChange(callback) {
    window.addEventListener('ordersChanged', (e) => {
      callback(e.detail);
    });
  }

  onMessagesChange(callback) {
    window.addEventListener('messagesChanged', (e) => {
      callback(e.detail);
    });
  }
}

// Create global instance
window.dataManager = new SimpleDataManager();

console.log('✅ Simple Data Manager initialized (localStorage only)');