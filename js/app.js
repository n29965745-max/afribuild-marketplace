/**
 * AfriBuild Marketplace - Main Application Module
 * 
 * Comprehensive JavaScript module with Supabase CRUD operations,
 * authentication, routing, UI utilities, and feature modules.
 * Uses Supabase JS v2 syntax.
 */

// ============================================
// Supabase Database Operations
// ============================================
const DB = {
  client: null,

  init() {
    this.client = window.supabaseClient;
    if (!this.client) {
      // Retry polling for async CDN loading
      let attempts = 0;
      const poll = setInterval(() => {
        attempts++;
        this.client = window.supabaseClient;
        if (this.client || attempts >= 20) {
          clearInterval(poll);
        }
      }, 300);
    }
    return this.client;
  },

  async fetch(table, filters = {}) {
    try {
      let query = this.client.from(table).select('*');

      // Apply filters
      if (filters.select) {
        query = this.client.from(table).select(filters.select);
      }

      if (filters.where) {
        Object.entries(filters.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      if (filters.whereIn) {
        Object.entries(filters.whereIn).forEach(([key, values]) => {
          query = query.in(key, values);
        });
      }

      if (filters.whereGte) {
        Object.entries(filters.whereGte).forEach(([key, value]) => {
          query = query.gte(key, value);
        });
      }

      if (filters.whereLte) {
        Object.entries(filters.whereLte).forEach(([key, value]) => {
          query = query.lte(key, value);
        });
      }

      if (filters.orderBy) {
        const [column, ascending = true] = filters.orderBy;
        query = query.order(column, { ascending });
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      if (filters.single) {
        const { data, error } = await query.single();
        if (error) throw error;
        return { data, error: null };
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return { data, error: null, count };
    } catch (error) {
      console.error(`Error fetching from ${table}:`, error.message);
      UI.showToast(`Failed to load data: ${error.message}`, 'error');
      return { data: null, error };
    }
  },

  async insert(table, data) {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .insert(data)
        .select();

      if (error) throw error;
      return { data: result, error: null };
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error.message);
      UI.showToast(`Failed to save: ${error.message}`, 'error');
      return { data: null, error };
    }
  },

  async update(table, id, data) {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .update(data)
        .eq('id', id)
        .select();

      if (error) throw error;
      return { data: result, error: null };
    } catch (error) {
      console.error(`Error updating ${table}:`, error.message);
      UI.showToast(`Failed to update: ${error.message}`, 'error');
      return { data: null, error };
    }
  },

  async remove(table, id) {
    try {
      const { error } = await this.client
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error.message);
      UI.showToast(`Failed to delete: ${error.message}`, 'error');
      return { error };
    }
  },

  async search(table, column, query, options = {}) {
    try {
      let searchQuery = this.client
        .from(table)
        .select(options.select || '*')
        .ilike(column, `%${query}%`);

      if (options.limit) {
        searchQuery = searchQuery.limit(options.limit);
      }

      if (options.orderBy) {
        searchQuery = searchQuery.order(options.orderBy[0], { ascending: options.orderBy[1] });
      }

      const { data, error } = await searchQuery;
      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error(`Error searching ${table}:`, error.message);
      return { data: null, error };
    }
  },

  async uploadFile(bucket, file, path) {
    try {
      const { data, error } = await this.client
        .storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Error uploading to ${bucket}:`, error.message);
      UI.showToast(`Failed to upload file: ${error.message}`, 'error');
      return { data: null, error };
    }
  },

  async getFileUrl(bucket, path) {
    try {
      const { data } = this.client
        .storage
        .from(bucket)
        .getPublicUrl(path);

      return { data: { publicUrl: data.publicUrl }, error: null };
    } catch (error) {
      console.error(`Error getting URL from ${bucket}:`, error.message);
      return { data: null, error };
    }
  },

  async deleteFile(bucket, paths) {
    try {
      const { error } = await this.client
        .storage
        .from(bucket)
        .remove(paths);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error(`Error deleting from ${bucket}:`, error.message);
      return { error };
    }
  }
};

// ============================================
// Authentication Module
// ============================================
const Auth = {
  currentUser: null,

  async signIn(email, password) {
    try {
      const { data, error } = await DB.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.currentUser = data.user;
      UI.showToast('Successfully signed in!', 'success');
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error.message);
      UI.showToast(`Sign in failed: ${error.message}`, 'error');
      return { data: null, error };
    }
  },

  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await DB.client.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;

      if (data.user && !data.user.confirmed_at) {
        UI.showToast('Please check your email to confirm your account', 'info');
      } else {
        UI.showToast('Account created successfully!', 'success');
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error.message);
      UI.showToast(`Sign up failed: ${error.message}`, 'error');
      return { data: null, error };
    }
  },

  async signOut() {
    try {
      const { error } = await DB.client.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      UI.showToast('Successfully signed out', 'success');
      Router.navigate('/');
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error.message);
      UI.showToast(`Sign out failed: ${error.message}`, 'error');
      return { error };
    }
  },

  async getUser() {
    try {
      const { data: { user }, error } = await DB.client.auth.getUser();

      if (error) throw error;

      this.currentUser = user;
      return { data: user, error: null };
    } catch (error) {
      console.error('Get user error:', error.message);
      return { data: null, error };
    }
  },

  async updateProfile(data) {
    try {
      const { data: result, error } = await DB.client.auth.updateUser({
        data
      });

      if (error) throw error;

      this.currentUser = result.user;
      UI.showToast('Profile updated successfully', 'success');
      return { data: result, error: null };
    } catch (error) {
      console.error('Update profile error:', error.message);
      UI.showToast(`Failed to update profile: ${error.message}`, 'error');
      return { data: null, error };
    }
  },

  async resetPassword(email) {
    try {
      const { error } = await DB.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      UI.showToast('Password reset email sent', 'success');
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error.message);
      UI.showToast(`Failed to send reset email: ${error.message}`, 'error');
      return { error };
    }
  },

  onAuthChange(callback) {
    return DB.client.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
      callback(event, session);
    });
  }
};

// ============================================
// Router Module
// ============================================
const Router = {
  routes: {},
  currentRoute: null,
  notFoundHandler: null,

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  },

  navigate(route) {
    window.location.hash = route;
  },

  on(route, callback) {
    if (route === '*') {
      this.notFoundHandler = callback;
    } else {
      this.routes[route] = callback;
    }
  },

  params() {
    const hash = window.location.hash.slice(1);
    const [path, queryString] = hash.split('?');
    const params = {};

    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    return { path, params };
  },

  handleRoute() {
    const { path, params } = this.params();
    const route = path || '/';

    // Check for exact match
    if (this.routes[route]) {
      this.currentRoute = route;
      this.routes[route](params);
      return;
    }

    // Check for pattern match (e.g., /properties/:id)
    for (const [pattern, handler] of Object.entries(this.routes)) {
      const patternParts = pattern.split('/');
      const routeParts = route.split('/');

      if (patternParts.length !== routeParts.length) continue;

      const routeParams = {};
      let matches = true;

      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
          routeParams[patternParts[i].slice(1)] = routeParts[i];
        } else if (patternParts[i] !== routeParts[i]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        this.currentRoute = route;
        handler({ ...params, ...routeParams });
        return;
      }
    }

    // 404 - not found
    if (this.notFoundHandler) {
      this.notFoundHandler(params);
    }
  }
};

// ============================================
// UI Utilities
// ============================================
const UI = {
  toastTimeout: null,

  showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="material-symbols-rounded">${icons[type] || 'info'}</span>
      <div class="flex-1">
        <p class="text-sm font-medium">${message}</p>
      </div>
      <button class="btn-icon btn-sm btn-ghost" onclick="this.closest('.toast').remove()">
        <span class="material-symbols-rounded">close</span>
      </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  showModal(content, options = {}) {
    let backdrop = document.querySelector('.modal-backdrop');
    let modal = document.querySelector('.modal');

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }

    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal';
      document.body.appendChild(modal);
    }

    modal.className = `modal modal-${options.size || 'md'}`;
    modal.innerHTML = `
      <div class="modal-header">
        <h3 class="text-lg font-semibold">${options.title || ''}</h3>
        <button class="btn-icon btn-sm btn-ghost" onclick="UI.closeModal()">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
    `;

    requestAnimationFrame(() => {
      backdrop.classList.add('active');
      modal.classList.add('active');
    });

    backdrop.onclick = () => this.closeModal();
  },

  closeModal() {
    const backdrop = document.querySelector('.modal-backdrop');
    const modal = document.querySelector('.modal');

    if (backdrop) backdrop.classList.remove('active');
    if (modal) modal.classList.remove('active');
  },

  showLoading(element) {
    if (!element) return;
    element.dataset.originalContent = element.innerHTML;
    element.innerHTML = '<span class="loading-spinner"></span>';
    element.disabled = true;
  },

  hideLoading(element) {
    if (!element) return;
    if (element.dataset.originalContent) {
      element.innerHTML = element.dataset.originalContent;
      delete element.dataset.originalContent;
    }
    element.disabled = false;
  },

  animateCounter(element, target, duration = 2000) {
    if (!element) return;

    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toLocaleString();
    }, 16);
  },

  observeElements(selector) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll(selector).forEach(el => {
      observer.observe(el);
    });
  },

  formatCurrency(amount, currency = 'NGN') {
    const formatters = {
      NGN: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }),
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      EUR: new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }),
      GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
    };

    return (formatters[currency] || formatters.NGN).format(amount);
  },

  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };

    return new Date(date).toLocaleDateString('en-US', defaultOptions);
  },

  formatRelativeTime(date) {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  },

  validateForm(form) {
    const inputs = form.querySelectorAll('[required]');
    let isValid = true;

    inputs.forEach(input => {
      const value = input.value.trim();
      let error = '';

      if (!value) {
        error = 'This field is required';
      } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Please enter a valid email';
      } else if (input.minLength && value.length < input.minLength) {
        error = `Minimum ${input.minLength} characters required`;
      } else if (input.maxLength && value.length > input.maxLength) {
        error = `Maximum ${input.maxLength} characters allowed`;
      }

      const errorEl = input.parentElement.querySelector('.form-error');

      if (error) {
        input.classList.add('error');
        if (errorEl) errorEl.textContent = error;
        isValid = false;
      } else {
        input.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
      }
    });

    return isValid;
  },

  debounce(fn, delay = 300) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  throttle(fn, limit = 300) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  generateId() {
    return Math.random().toString(36).substring(2, 15);
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Copied to clipboard', 'success');
    }).catch(() => {
      this.showToast('Failed to copy', 'error');
    });
  }
};

// ============================================
// Properties Module
// ============================================
const Properties = {
  async list(filters = {}) {
    return DB.fetch(TABLES.PROPERTIES, {
      select: `
        *,
        user_profiles:user_id (full_name, avatar_url, is_verified),
        property_images (*)
      `,
      where: filters.where || {},
      orderBy: filters.orderBy || ['created_at', false],
      limit: filters.limit || 12,
      offset: filters.offset || 0
    });
  },

  async get(id) {
    return DB.fetch(TABLES.PROPERTIES, {
      select: `
        *,
        user_profiles:user_id (full_name, avatar_url, phone, is_verified),
        property_images (*),
        property_amenities (*)
      `,
      where: { id },
      single: true
    });
  },

  async create(data) {
    const { data: user } = await Auth.getUser();
    if (!user) {
      UI.showToast('Please sign in to create a listing', 'warning');
      return { data: null, error: new Error('Not authenticated') };
    }

    return DB.insert(TABLES.PROPERTIES, {
      ...data,
      user_id: user.id,
      status: 'pending'
    });
  },

  async update(id, data) {
    return DB.update(TABLES.PROPERTIES, id, data);
  },

  async delete(id) {
    return DB.remove(TABLES.PROPERTIES, id);
  },

  async save(id) {
    const { data: user } = await Auth.getUser();
    if (!user) {
      UI.showToast('Please sign in to save listings', 'warning');
      return { data: null, error: new Error('Not authenticated') };
    }

    return DB.insert(TABLES.USER_FAVORITES, {
      user_id: user.id,
      property_id: id
    });
  },

  async unsave(id) {
    const { data: user } = await Auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    return DB.client
      .from(TABLES.USER_FAVORITES)
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', id);
  },

  async search(query, filters = {}) {
    return DB.search(TABLES.PROPERTIES, 'title', query, {
      select: `
        *,
        user_profiles:user_id (full_name, avatar_url)
      `,
      limit: filters.limit || 20,
      orderBy: ['created_at', false]
    });
  },

  async getByUser(userId) {
    return DB.fetch(TABLES.PROPERTIES, {
      where: { user_id: userId },
      orderBy: ['created_at', false]
    });
  },

  async uploadImages(propertyId, files) {
    const results = [];

    for (const file of files) {
      const path = `${propertyId}/${Date.now()}_${file.name}`;
      const { data, error } = await DB.uploadFile(STORAGE_BUCKETS.PROPERTIES, file, path);

      if (!error) {
        const { data: urlData } = await DB.getFileUrl(STORAGE_BUCKETS.PROPERTIES, path);
        results.push({
          property_id: propertyId,
          image_url: urlData.publicUrl,
          is_primary: results.length === 0
        });
      }
    }

    if (results.length > 0) {
      return DB.insert('property_images', results);
    }

    return { data: null, error: new Error('No images uploaded') };
  }
};

// ============================================
// Materials Module
// ============================================
const Materials = {
  async list(category = null) {
    const filters = {
      orderBy: ['created_at', false]
    };

    if (category) {
      filters.where = { category_id: category };
    }

    return DB.fetch(TABLES.MATERIALS, {
      ...filters,
      select: `
        *,
        material_categories:category_id (name, slug),
        user_profiles:supplier_id (full_name, avatar_url, is_verified)
      `
    });
  },

  async get(id) {
    return DB.fetch(TABLES.MATERIALS, {
      select: `
        *,
        material_categories:category_id (name, slug),
        user_profiles:supplier_id (full_name, avatar_url, phone, is_verified, rating)
      `,
      where: { id },
      single: true
    });
  },

  async search(query) {
    return DB.search(TABLES.MATERIALS, 'name', query, {
      select: `
        *,
        material_categories:category_id (name, slug)
      `
    });
  },

  async addToCart(id, qty = 1) {
    const { data: user } = await Auth.getUser();
    if (!user) {
      UI.showToast('Please sign in to add items to cart', 'warning');
      return { data: null, error: new Error('Not authenticated') };
    }

    // Check if item already in cart
    const { data: existing } = await DB.fetch(TABLES.CART_ITEMS, {
      where: { user_id: user.id, material_id: id },
      single: true
    });

    if (existing) {
      return DB.update(TABLES.CART_ITEMS, existing.id, {
        quantity: existing.quantity + qty
      });
    }

    return DB.insert(TABLES.CART_ITEMS, {
      user_id: user.id,
      material_id: id,
      quantity: qty
    });
  },

  async getCart() {
    const { data: user } = await Auth.getUser();
    if (!user) return { data: [], error: null };

    return DB.fetch(TABLES.CART_ITEMS, {
      select: `
        *,
        materials:material_id (*)
      `,
      where: { user_id: user.id }
    });
  },

  async updateCartQuantity(itemId, quantity) {
    if (quantity <= 0) {
      return DB.remove(TABLES.CART_ITEMS, itemId);
    }
    return DB.update(TABLES.CART_ITEMS, itemId, { quantity });
  },

  async clearCart() {
    const { data: user } = await Auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    return DB.client
      .from(TABLES.CART_ITEMS)
      .delete()
      .eq('user_id', user.id);
  },

  async requestBulkQuote(items) {
    const { data: user } = await Auth.getUser();
    if (!user) {
      UI.showToast('Please sign in to request a quote', 'warning');
      return { data: null, error: new Error('Not authenticated') };
    }

    return DB.insert(TABLES.QUOTES, {
      user_id: user.id,
      items,
      type: 'bulk',
      status: 'pending'
    });
  },

  async getCategories() {
    return DB.fetch(TABLES.MATERIAL_CATEGORIES, {
      orderBy: ['name', true]
    });
  }
};

// ============================================
// Quotes Module
// ============================================
const Quotes = {
  async create(data) {
    const { data: user } = await Auth.getUser();
    if (!user) {
      UI.showToast('Please sign in to create a quote', 'warning');
      return { data: null, error: new Error('Not authenticated') };
    }

    return DB.insert(TABLES.QUOTES, {
      ...data,
      user_id: user.id,
      status: 'pending'
    });
  },

  async list(filters = {}) {
    const { data: user } = await Auth.getUser();
    if (!user) return { data: [], error: null };

    return DB.fetch(TABLES.QUOTES, {
      select: `
        *,
        user_profiles:user_id (full_name, avatar_url),
        professionals:professional_id (full_name, avatar_url)
      `,
      where: { user_id: user.id, ...filters.where },
      orderBy: ['created_at', false]
    });
  },

  async get(id) {
    return DB.fetch(TABLES.QUOTES, {
      select: `
        *,
        user_profiles:user_id (full_name, avatar_url, phone),
        professionals:professional_id (full_name, avatar_url, phone, specialty),
        quote_items (*)
      `,
      where: { id },
      single: true
    });
  },

  async respond(id, response) {
    const { data: user } = await Auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    return DB.update(TABLES.QUOTES, id, {
      ...response,
      status: response.accepted ? 'accepted' : 'rejected',
      responded_at: new Date().toISOString()
    });
  },

  async cancel(id) {
    return DB.update(TABLES.QUOTES, id, {
      status: 'cancelled'
    });
  },

  async getForProfessional(professionalId) {
    return DB.fetch(TABLES.QUOTES, {
      select: `
        *,
        user_profiles:user_id (full_name, avatar_url)
      `,
      where: { professional_id: professionalId },
      orderBy: ['created_at', false]
    });
  }
};

// ============================================
// Professionals Module
// ============================================
const Professionals = {
  async list(specialty = null) {
    const filters = {
      select: `
        *,
        user_profiles:user_id (full_name, avatar_url, is_verified)
      `,
      orderBy: ['rating', false]
    };

    if (specialty) {
      filters.where = { specialty };
    }

    return DB.fetch(TABLES.PROFESSIONALS, filters);
  },

  async get(id) {
    return DB.fetch(TABLES.PROFESSIONALS, {
      select: `
        *,
        user_profiles:user_id (full_name, avatar_url, phone, is_verified),
        professional_reviews (*, user_profiles:user_id (full_name, avatar_url))
      `,
      where: { id },
      single: true
    });
  },

  async search(query) {
    return DB.search(TABLES.PROFESSIONALS, 'specialty', query, {
      select: `
        *,
        user_profiles:user_id (full_name, avatar_url)
      `
    });
  },

  async requestQuote(professionalId, data) {
    const { data: user } = await Auth.getUser();
    if (!user) {
      UI.showToast('Please sign in to request a quote', 'warning');
      return { data: null, error: new Error('Not authenticated') };
    }

    return DB.insert(TABLES.QUOTES, {
      user_id: user.id,
      professional_id: professionalId,
      ...data,
      status: 'pending'
    });
  },

  async review(professionalId, data) {
    const { data: user } = await Auth.getUser();
    if (!user) {
      UI.showToast('Please sign in to leave a review', 'warning');
      return { data: null, error: new Error('Not authenticated') };
    }

    return DB.insert(TABLES.PROFESSIONAL_REVIEWS, {
      professional_id: professionalId,
      user_id: user.id,
      ...data
    });
  },

  async getReviews(professionalId) {
    return DB.fetch(TABLES.PROFESSIONAL_REVIEWS, {
      select: `
        *,
        user_profiles:user_id (full_name, avatar_url)
      `,
      where: { professional_id: professionalId },
      orderBy: ['created_at', false]
    });
  },

  async getSpecialties() {
    const { data, error } = await DB.client
      .from(TABLES.PROFESSIONALS)
      .select('specialty')
      .not('specialty', 'is', null);

    if (error) return { data: [], error };

    const specialties = [...new Set(data.map(p => p.specialty))];
    return { data: specialties, error: null };
  }
};

// ============================================
// Equipment Module
// ============================================
const Equipment = {
  async list(type = null) {
    const filters = {
      select: `
        *,
        user_profiles:owner_id (full_name, avatar_url, is_verified)
      `,
      orderBy: ['created_at', false]
    };

    if (type) {
      filters.where = { equipment_type: type };
    }

    return DB.fetch(TABLES.EQUIPMENT, filters);
  },

  async get(id) {
    return DB.fetch(TABLES.EQUIPMENT, {
      select: `
        *,
        user_profiles:owner_id (full_name, avatar_url, phone, is_verified),
        equipment_bookings!equipment_id (*)
      `,
      where: { id },
      single: true
    });
  },

  async book(id, data) {
    const { data: user } = await Auth.getUser();
    if (!user) {
      UI.showToast('Please sign in to book equipment', 'warning');
      return { data: null, error: new Error('Not authenticated') };
    }

    // Calculate total cost
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const { data: equipment } = await this.get(id);
    const totalCost = days * equipment.daily_rate;

    return DB.insert(TABLES.EQUIPMENT_BOOKINGS, {
      equipment_id: id,
      user_id: user.id,
      owner_id: equipment.owner_id,
      start_date: data.start_date,
      end_date: data.end_date,
      total_cost: totalCost,
      status: 'pending',
      notes: data.notes
    });
  },

  async cancel(id) {
    return DB.update(TABLES.EQUIPMENT_BOOKINGS, id, {
      status: 'cancelled'
    });
  },

  async getTypes() {
    const { data, error } = await DB.client
      .from(TABLES.EQUIPMENT)
      .select('equipment_type')
      .not('equipment_type', 'is', null);

    if (error) return { data: [], error };

    const types = [...new Set(data.map(e => e.equipment_type))];
    return { data: types, error: null };
  },

  async getByOwner(ownerId) {
    return DB.fetch(TABLES.EQUIPMENT, {
      where: { owner_id: ownerId },
      orderBy: ['created_at', false]
    });
  }
};

// ============================================
// Bookings Module
// ============================================
const Bookings = {
  async create(data) {
    const { data: user } = await Auth.getUser();
    if (!user) {
      UI.showToast('Please sign in to create a booking', 'warning');
      return { data: null, error: new Error('Not authenticated') };
    }

    return DB.insert(TABLES.BOOKINGS, {
      ...data,
      user_id: user.id,
      status: 'pending'
    });
  },

  async list(filters = {}) {
    const { data: user } = await Auth.getUser();
    if (!user) return { data: [], error: null };

    return DB.fetch(TABLES.BOOKINGS, {
      select: `
        *,
        professionals:professional_id (full_name, avatar_url, specialty)
      `,
      where: { user_id: user.id, ...filters.where },
      orderBy: ['created_at', false]
    });
  },

  async get(id) {
    return DB.fetch(TABLES.BOOKINGS, {
      select: `
        *,
        professionals:professional_id (full_name, avatar_url, phone, specialty),
        user_profiles:user_id (full_name, avatar_url, phone)
      `,
      where: { id },
      single: true
    });
  },

  async cancel(id) {
    return DB.update(TABLES.BOOKINGS, id, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    });
  },

  async confirm(id) {
    return DB.update(TABLES.BOOKINGS, id, {
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    });
  },

  async complete(id) {
    return DB.update(TABLES.BOOKINGS, id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });
  }
};

// ============================================
// Messages Module
// ============================================
const Messages = {
  async send(conversationId, content, receiverId) {
    const { data: user } = await Auth.getUser();
    if (!user) {
      UI.showToast('Please sign in to send messages', 'warning');
      return { data: null, error: new Error('Not authenticated') };
    }

    // Create conversation if needed
    let convId = conversationId;
    if (!convId && receiverId) {
      const { data: existingConv } = await DB.fetch(TABLES.CONVERSATIONS, {
        where: {
          OR: [
            { user1_id: user.id, user2_id: receiverId },
            { user1_id: receiverId, user2_id: user.id }
          ]
        },
        single: true
      });

      if (existingConv) {
        convId = existingConv.id;
      } else {
        const { data: newConv } = await DB.insert(TABLES.CONVERSATIONS, {
          user1_id: user.id,
          user2_id: receiverId
        });
        convId = newConv?.id;
      }
    }

    if (!convId) {
      return { data: null, error: new Error('No conversation ID') };
    }

    // Send message
    const { data, error } = await DB.insert(TABLES.MESSAGES, {
      conversation_id: convId,
      sender_id: user.id,
      content,
      read: false
    });

    // Update conversation last message
    await DB.update(TABLES.CONVERSATIONS, convId, {
      last_message: content,
      last_message_at: new Date().toISOString()
    });

    return { data, error };
  },

  async list(conversationId) {
    return DB.fetch(TABLES.MESSAGES, {
      where: { conversation_id: conversationId },
      orderBy: ['created_at', true]
    });
  },

  async getConversations() {
    const { data: user } = await Auth.getUser();
    if (!user) return { data: [], error: null };

    return DB.fetch(TABLES.CONVERSATIONS, {
      select: `
        *,
        user1:user1_id (full_name, avatar_url),
        user2:user2_id (full_name, avatar_url)
      `,
      where: {
        OR: [
          { user1_id: user.id },
          { user2_id: user.id }
        ]
      },
      orderBy: ['last_message_at', false]
    });
  },

  async markRead(id) {
    return DB.update(TABLES.MESSAGES, id, {
      read: true,
      read_at: new Date().toISOString()
    });
  },

  async markConversationRead(conversationId) {
    const { data: user } = await Auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    return DB.client
      .from(TABLES.MESSAGES)
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('read', false);
  },

  async getUnreadCount() {
    const { data: user } = await Auth.getUser();
    if (!user) return { data: 0, error: null };

    const { count, error } = await DB.client
      .from(TABLES.MESSAGES)
      .select('*', { count: 'exact', head: true })
      .neq('sender_id', user.id)
      .eq('read', false);

    return { data: count || 0, error };
  }
};

// ============================================
// Transactions Module
// ============================================
const Transactions = {
  async list(filters = {}) {
    const { data: user } = await Auth.getUser();
    if (!user) return { data: [], error: null };

    return DB.fetch(TABLES.TRANSACTIONS, {
      where: { user_id: user.id, ...filters.where },
      orderBy: ['created_at', false],
      limit: filters.limit || 20
    });
  },

  async get(id) {
    return DB.fetch(TABLES.TRANSACTIONS, {
      where: { id },
      single: true
    });
  },

  async createEscrow(data) {
    const { data: user } = await Auth.getUser();
    if (!user) {
      UI.showToast('Please sign in to create escrow', 'warning');
      return { data: null, error: new Error('Not authenticated') };
    }

    return DB.insert(TABLES.ESCROW, {
      ...data,
      buyer_id: user.id,
      status: 'held',
      created_at: new Date().toISOString()
    });
  },

  async releaseEscrow(id) {
    return DB.update(TABLES.ESCROW, id, {
      status: 'released',
      released_at: new Date().toISOString()
    });
  },

  async refundEscrow(id) {
    return DB.update(TABLES.ESCROW, id, {
      status: 'refunded',
      refunded_at: new Date().toISOString()
    });
  },

  async getEscrow(id) {
    return DB.fetch(TABLES.ESCROW, {
      select: `
        *,
        buyer:user_profiles!buyer_id (full_name, avatar_url),
        seller:user_profiles!seller_id (full_name, avatar_url)
      `,
      where: { id },
      single: true
    });
  }
};

// ============================================
// Blog Module
// ============================================
const Blog = {
  async list(category = null) {
    const filters = {
      select: `
        *,
        blog_categories:category_id (name, slug),
        user_profiles:author_id (full_name, avatar_url)
      `,
      orderBy: ['created_at', false]
    };

    if (category) {
      filters.where = { category_id: category };
    }

    return DB.fetch(TABLES.BLOG_POSTS, filters);
  },

  async get(slug) {
    return DB.fetch(TABLES.BLOG_POSTS, {
      select: `
        *,
        blog_categories:category_id (name, slug),
        user_profiles:author_id (full_name, avatar_url, bio)
      `,
      where: { slug },
      single: true
    });
  },

  async search(query) {
    return DB.search(TABLES.BLOG_POSTS, 'title', query, {
      select: `
        *,
        blog_categories:category_id (name, slug)
      `
    });
  },

  async getCategories() {
    return DB.fetch(TABLES.BLOG_CATEGORIES, {
      orderBy: ['name', true]
    });
  },

  async getByAuthor(authorId) {
    return DB.fetch(TABLES.BLOG_POSTS, {
      where: { author_id: authorId },
      orderBy: ['created_at', false]
    });
  }
};

// ============================================
// Dashboard Module
// ============================================
const Dashboard = {
  async getStats() {
    const { data: user } = await Auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const [properties, bookings, transactions] = await Promise.all([
      DB.fetch(TABLES.PROPERTIES, {
        where: { user_id: user.id },
        single: true,
        select: 'id'
      }),
      DB.fetch(TABLES.BOOKINGS, {
        where: { user_id: user.id },
        single: true,
        select: 'id'
      }),
      DB.fetch(TABLES.TRANSACTIONS, {
        where: { user_id: user.id },
        select: 'amount'
      })
    ]);

    const totalSpent = transactions.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    return {
      data: {
        listingsCount: properties.data?.length || 0,
        bookingsCount: bookings.data?.length || 0,
        totalSpent
      },
      error: null
    };
  },

  async getProjects() {
    const { data: user } = await Auth.getUser();
    if (!user) return { data: [], error: null };

    return DB.fetch(TABLES.USER_PROJECTS, {
      where: { user_id: user.id },
      orderBy: ['updated_at', false]
    });
  },

  async getTransactions(filters = {}) {
    return Transactions.list(filters);
  },

  async getPortfolioValue() {
    const { data: user } = await Auth.getUser();
    if (!user) return { data: 0, error: null };

    const { data: properties } = await DB.fetch(TABLES.PROPERTIES, {
      where: { user_id: user.id },
      select: 'price'
    });

    const totalValue = properties?.reduce((sum, p) => sum + (p.price || 0), 0) || 0;
    return { data: totalValue, error: null };
  },

  async getRecentActivity(limit = 5) {
    const { data: user } = await Auth.getUser();
    if (!user) return { data: [], error: null };

    const { data, error } = await DB.client
      .from(TABLES.TRANSACTIONS)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  }
};

// ============================================
// Admin Module
// ============================================
const Admin = {
  async getMetrics() {
    const [users, properties, materials, transactions] = await Promise.all([
      DB.client.from(TABLES.USER_PROFILES).select('*', { count: 'exact', head: true }),
      DB.client.from(TABLES.PROPERTIES).select('*', { count: 'exact', head: true }),
      DB.client.from(TABLES.MATERIALS).select('*', { count: 'exact', head: true }),
      DB.client.from(TABLES.TRANSACTIONS).select('amount')
    ]);

    const totalRevenue = transactions.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    return {
      data: {
        totalUsers: users.count || 0,
        totalProperties: properties.count || 0,
        totalMaterials: materials.count || 0,
        totalRevenue
      },
      error: null
    };
  },

  async getPendingApprovals() {
    return DB.fetch(TABLES.PROPERTIES, {
      where: { status: 'pending' },
      select: `
        *,
        user_profiles:user_id (full_name, email)
      `,
      orderBy: ['created_at', true]
    });
  },

  async approve(id) {
    return DB.update(TABLES.PROPERTIES, id, {
      status: 'approved',
      approved_at: new Date().toISOString()
    });
  },

  async reject(id, reason = '') {
    return DB.update(TABLES.PROPERTIES, id, {
      status: 'rejected',
      rejection_reason: reason,
      rejected_at: new Date().toISOString()
    });
  },

  async getUsers(filters = {}) {
    return DB.fetch(TABLES.USER_PROFILES, {
      where: filters.where || {},
      orderBy: ['created_at', false],
      limit: filters.limit || 50
    });
  },

  async getTransactions(filters = {}) {
    return DB.fetch(TABLES.TRANSACTIONS, {
      select: `
        *,
        user_profiles:user_id (full_name, email)
      `,
      where: filters.where || {},
      orderBy: ['created_at', false],
      limit: filters.limit || 50
    });
  },

  async updateUserStatus(userId, status) {
    return DB.update(TABLES.USER_PROFILES, userId, {
      status,
      updated_at: new Date().toISOString()
    });
  }
};

// ============================================
// Build Wizard Module
// ============================================
const BuildWizard = {
  currentStep: 1,
  totalSteps: 5,
  data: {},

  steps: [
    'project_type',
    'location',
    'budget',
    'timeline',
    'preferences'
  ],

  next() {
    if (this.currentStep < this.totalSteps) {
      this.save();
      this.currentStep++;
      this.updateUI();
      return true;
    }
    return false;
  },

  prev() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateUI();
      return true;
    }
    return false;
  },

  goTo(step) {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
      this.updateUI();
      return true;
    }
    return false;
  },

  save() {
    const form = document.querySelector(`[data-step="${this.currentStep}"]`);
    if (form) {
      const formData = new FormData(form);
      this.data[this.steps[this.currentStep - 1]] = Object.fromEntries(formData);
    }
  },

  async submit() {
    this.save();

    const { data: user } = await Auth.getUser();
    if (!user) {
      UI.showToast('Please sign in to submit your project', 'warning');
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await DB.insert(TABLES.USER_PROJECTS, {
      user_id: user.id,
      ...this.data,
      status: 'active'
    });

    if (!error) {
      UI.showToast('Project created successfully!', 'success');
      this.reset();
    }

    return { data, error };
  },

  async generateEstimate() {
    this.save();

    // Calculate estimate based on project data
    const estimates = {
      residential: { min: 5000000, max: 25000000 },
      commercial: { min: 20000000, max: 100000000 },
      renovation: { min: 2000000, max: 15000000 }
    };

    const projectType = this.data.project_type || 'residential';
    const estimate = estimates[projectType] || estimates.residential;

    // Apply location multiplier
    const locationMultipliers = {
      lagos: 1.3,
      abuja: 1.2,
      port_harcourt: 1.1,
      other: 1.0
    };

    const location = this.data.location?.toLowerCase() || 'other';
    const multiplier = locationMultipliers[location] || 1.0;

    return {
      min: Math.round(estimate.min * multiplier),
      max: Math.round(estimate.max * multiplier),
      currency: 'NGN'
    };
  },

  async getRecommendations() {
    const projectType = this.data.project_type;

    const [professionals, materials] = await Promise.all([
      Professionals.list(projectType === 'renovation' ? 'renovation' : 'construction'),
      Materials.list()
    ]);

    return {
      professionals: professionals.data?.slice(0, 5) || [],
      materials: materials.data?.slice(0, 10) || []
    };
  },

  updateUI() {
    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach((el, index) => {
      el.classList.remove('active', 'completed');
      if (index + 1 === this.currentStep) {
        el.classList.add('active');
      } else if (index + 1 < this.currentStep) {
        el.classList.add('completed');
      }
    });

    // Update step content
    document.querySelectorAll('.step').forEach((el, index) => {
      el.classList.remove('active', 'exit-left', 'exit-right');
      if (index + 1 === this.currentStep) {
        el.classList.add('active');
      }
    });

    // Update progress lines
    document.querySelectorAll('.step-line').forEach((el, index) => {
      el.classList.toggle('completed', index + 1 < this.currentStep);
    });

    // Update navigation buttons
    const prevBtn = document.querySelector('[data-wizard="prev"]');
    const nextBtn = document.querySelector('[data-wizard="next"]');
    const submitBtn = document.querySelector('[data-wizard="submit"]');

    if (prevBtn) prevBtn.disabled = this.currentStep === 1;
    if (nextBtn) nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : '';
    if (submitBtn) submitBtn.style.display = this.currentStep === this.totalSteps ? '' : 'none';
  },

  reset() {
    this.currentStep = 1;
    this.data = {};
    this.updateUI();
  }
};

// ============================================
// Notification Module
// ============================================
const Notifications = {
  async list() {
    const { data: user } = await Auth.getUser();
    if (!user) return { data: [], error: null };

    return DB.fetch(TABLES.NOTIFICATIONS, {
      where: { user_id: user.id },
      orderBy: ['created_at', false],
      limit: 50
    });
  },

  async markRead(id) {
    return DB.update(TABLES.NOTIFICATIONS, id, {
      read: true,
      read_at: new Date().toISOString()
    });
  },

  async markAllRead() {
    const { data: user } = await Auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    return DB.client
      .from(TABLES.NOTIFICATIONS)
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('read', false);
  },

  async getUnreadCount() {
    const { data: user } = await Auth.getUser();
    if (!user) return { data: 0, error: null };

    const { count, error } = await DB.client
      .from(TABLES.NOTIFICATIONS)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    return { data: count || 0, error };
  }
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize database connection
  DB.init();

  // Initialize router
  Router.init();

  // Setup intersection observer for scroll reveals
  UI.observeElements('.reveal-node');

  // Setup header scroll effect
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', UI.throttle(() => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, 100));
  }

  // Setup bottom navigation
  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav) {
    const currentPath = window.location.hash.slice(1) || '/';
    bottomNav.querySelectorAll('.bottom-nav-item').forEach(item => {
      if (item.getAttribute('href') === `#${currentPath}`) {
        item.classList.add('active');
      }
    });
  }

  // Setup sidebar toggle
  const menuToggle = document.querySelector('[data-toggle="sidebar"]');
  const sidebar = document.querySelector('.sidebar');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      sidebarOverlay?.classList.toggle('active');
    });

    sidebarOverlay?.addEventListener('click', () => {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
    });
  }

  // Auth state listener
  Auth.onAuthChange((event, session) => {
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');

    if (session) {
      authButtons?.classList.add('hidden');
      userMenu?.classList.remove('hidden');
    } else {
      authButtons?.classList.remove('hidden');
      userMenu?.classList.add('hidden');
    }
  });

  // Wizard navigation
  document.querySelectorAll('[data-wizard]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.wizard;
      if (action === 'next') BuildWizard.next();
      else if (action === 'prev') BuildWizard.prev();
      else if (action === 'submit') BuildWizard.submit();
    });
  });

  console.log('AfriBuild Marketplace initialized');
});

// Export all modules
if (typeof window !== 'undefined') {
  window.DB = DB;
  window.Auth = Auth;
  window.Router = Router;
  window.UI = UI;
  window.Properties = Properties;
  window.Materials = Materials;
  window.Quotes = Quotes;
  window.Professionals = Professionals;
  window.Equipment = Equipment;
  window.Bookings = Bookings;
  window.Messages = Messages;
  window.Transactions = Transactions;
  window.Blog = Blog;
  window.Dashboard = Dashboard;
  window.Admin = Admin;
  window.BuildWizard = BuildWizard;
  window.Notifications = Notifications;
}
