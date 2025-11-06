/**
 * Sunrise Pro - Cart Drawer Component
 * Handles cart drawer functionality and cart updates
 */

class SunriseCartDrawer extends HTMLElement {
  constructor() {
    super();
    this.overlay = this.querySelector('#CartDrawerOverlay');
    this.content = this.querySelector('#CartDrawerContent');
    this.closeButton = this.querySelector('#CartDrawerClose');
    this.form = this.querySelector('#CartDrawerForm');
    this.itemsContainer = this.querySelector('#CartDrawerItems');
    this.countElement = this.querySelector('#CartDrawerCount');
    this.isOpen = false;
    this.isUpdating = false;

    this.init();
  }

  init() {
    this.bindEvents();
    this.setupAccessibility();
  }

  bindEvents() {
    // Close button
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => {
        this.close();
      });
    }

    // Overlay click
    if (this.overlay) {
      this.overlay.addEventListener('click', () => {
        this.close();
      });
    }

    // Quantity updates
    this.addEventListener('click', (e) => {
      if (e.target.closest('.sunrise-cart-drawer__quantity-button')) {
        e.preventDefault();
        this.handleQuantityChange(e.target.closest('.sunrise-cart-drawer__quantity-button'));
      }
    });

    // Quantity input changes
    this.addEventListener('change', (e) => {
      if (e.target.classList.contains('sunrise-cart-drawer__quantity-input')) {
        this.handleQuantityInputChange(e.target);
      }
    });

    // Remove item
    this.addEventListener('click', (e) => {
      if (e.target.closest('.sunrise-cart-drawer__remove')) {
        e.preventDefault();
        this.handleRemoveItem(e.target.closest('.sunrise-cart-drawer__remove'));
      }
    });

    // Form submission
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCheckout();
      });
    }

    // Keyboard navigation
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Listen for cart updates from other components
    document.addEventListener('cart:updated', (e) => {
      this.updateCart(e.detail);
    });
  }

  setupAccessibility() {
    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-modal', 'true');
    this.setAttribute('aria-labelledby', 'CartDrawerTitle');
    
    if (this.content) {
      this.content.setAttribute('role', 'document');
    }
  }

  async open() {
    this.isOpen = true;
    this.setAttribute('open', '');
    this.classList.add('sunrise-cart-drawer--open');
    document.body.classList.add('sunrise-cart-drawer-open');
    
    // Load cart content if not already loaded
    if (!this.hasLoadedCart) {
      await this.loadCart();
      this.hasLoadedCart = true;
    }
    
    // Focus management
    this.focusTrap();
    
    // Announce to screen readers
    this.announce('Cart drawer opened');
    
    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('cart-drawer:opened', {
      detail: { cartDrawer: this }
    }));
  }

  close() {
    this.isOpen = false;
    this.removeAttribute('open');
    this.classList.remove('sunrise-cart-drawer--open');
    document.body.classList.remove('sunrise-cart-drawer-open');
    
    // Return focus to trigger element
    this.returnFocus();
    
    // Announce to screen readers
    this.announce('Cart drawer closed');
    
    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('cart-drawer:closed', {
      detail: { cartDrawer: this }
    }));
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  async handleQuantityChange(button) {
    if (this.isUpdating) return;

    const input = button.parentElement.querySelector('.sunrise-cart-drawer__quantity-input');
    const index = parseInt(button.dataset.index) - 1;
    const currentValue = parseInt(input.value);
    let newValue = currentValue;

    if (button.classList.contains('sunrise-cart-drawer__quantity-button--plus')) {
      newValue = currentValue + 1;
    } else if (button.classList.contains('sunrise-cart-drawer__quantity-button--minus')) {
      newValue = Math.max(0, currentValue - 1);
    }

    if (newValue !== currentValue) {
      await this.updateCartItem(index, newValue);
    }
  }

  async handleQuantityInputChange(input) {
    if (this.isUpdating) return;

    const index = parseInt(input.dataset.index) - 1;
    const newValue = Math.max(0, parseInt(input.value) || 0);

    await this.updateCartItem(index, newValue);
  }

  async handleRemoveItem(button) {
    if (this.isUpdating) return;

    const index = parseInt(button.dataset.index) - 1;
    await this.updateCartItem(index, 0);
  }

  async updateCartItem(index, quantity) {
    this.isUpdating = true;
    this.showUpdatingState();

    try {
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          updates: {
            [index]: quantity
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      const cart = await response.json();
      await this.updateCart(cart);
      
      // Dispatch cart updated event
      document.dispatchEvent(new CustomEvent('cart:updated', {
        detail: cart
      }));

    } catch (error) {
      console.error('Cart update error:', error);
      this.showError('Failed to update cart. Please try again.');
    } finally {
      this.isUpdating = false;
      this.hideUpdatingState();
    }
  }

  async loadCart() {
    try {
      // Load cart drawer content using section ID
      const sectionId = this.dataset.sectionId || 'sunrise-cart-drawer';
      const response = await fetch(`${window.Shopify.routes.root}cart?section_id=${sectionId}`);
      if (response.ok) {
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContent = doc.querySelector('cart-drawer');
        
        if (newContent) {
          // Store current state
          const wasOpen = this.isOpen;
          
          // Update content
          this.innerHTML = newContent.innerHTML;
          
          // Reinitialize elements
          this.overlay = this.querySelector('#CartDrawerOverlay');
          this.content = this.querySelector('#CartDrawerContent');
          this.closeButton = this.querySelector('#CartDrawerClose');
          this.form = this.querySelector('#CartDrawerForm');
          this.itemsContainer = this.querySelector('#CartDrawerItems');
          this.countElement = this.querySelector('#CartDrawerCount');
          
          // Rebind events
          this.bindEvents();
        }
      }
    } catch (error) {
      console.error('Cart load error:', error);
    }
  }

  async updateCart(cartData) {
    try {
      // Update cart drawer content using section ID
      const sectionId = this.dataset.sectionId || 'sunrise-cart-drawer';
      const response = await fetch(`${window.Shopify.routes.root}cart?section_id=${sectionId}`);
      if (response.ok) {
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContent = doc.querySelector('cart-drawer');
        
        if (newContent) {
          // Preserve the current state
          const wasOpen = this.isOpen;
          this.innerHTML = newContent.innerHTML;
          
          // Reinitialize elements
          this.overlay = this.querySelector('#CartDrawerOverlay');
          this.content = this.querySelector('#CartDrawerContent');
          this.closeButton = this.querySelector('#CartDrawerClose');
          this.form = this.querySelector('#CartDrawerForm');
          this.itemsContainer = this.querySelector('#CartDrawerItems');
          this.countElement = this.querySelector('#CartDrawerCount');
          
          // Rebind events
          this.bindEvents();
          
          // Reopen if it was open
          if (wasOpen) {
            this.open();
          }
        }
      }

      // Update cart count in header if cartData is provided
      if (cartData && cartData.item_count !== undefined) {
        this.updateCartCount(cartData.item_count);
      }
      
      // Update cart total if cartData is provided
      if (cartData && cartData.total_price !== undefined) {
        this.updateCartTotal(cartData.total_price);
      }

    } catch (error) {
      console.error('Cart update error:', error);
    }
  }

  updateCartCount(count) {
    if (this.countElement) {
      this.countElement.textContent = `(${count})`;
    }

    // Update all cart count elements in header
    const cartCounts = document.querySelectorAll('.sunrise-cart-count');
    cartCounts.forEach((cartCount) => {
      cartCount.textContent = count;
      cartCount.setAttribute('aria-hidden', count === 0);
      if (count > 0) {
        cartCount.style.display = '';
      } else {
        cartCount.style.display = 'none';
      }
    });
    
    // Publish cart update event
    document.dispatchEvent(new CustomEvent('cart:updated', {
      detail: { item_count: count },
      bubbles: true,
    }));
  }

  updateCartTotal(totalPrice) {
    const totalElement = this.querySelector('.sunrise-cart-drawer__subtotal-price');
    if (totalElement) {
      totalElement.textContent = this.formatMoney(totalPrice);
    }
  }

  showUpdatingState() {
    const items = this.querySelectorAll('.sunrise-cart-drawer__item');
    items.forEach(item => {
      item.style.opacity = '0.6';
      item.style.pointerEvents = 'none';
    });
  }

  hideUpdatingState() {
    const items = this.querySelectorAll('.sunrise-cart-drawer__item');
    items.forEach(item => {
      item.style.opacity = '1';
      item.style.pointerEvents = 'auto';
    });
  }

  showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'sunrise-cart-drawer__error sunrise-text-center';
    errorDiv.textContent = message;
    
    const body = this.querySelector('.sunrise-cart-drawer__body');
    if (body) {
      body.insertBefore(errorDiv, body.firstChild);
      
      // Remove error after 5 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 5000);
    }
  }

  handleCheckout() {
    window.location.href = '/checkout';
  }

  focusTrap() {
    const focusableElements = this.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      this.firstFocusableElement = focusableElements[0];
      this.lastFocusableElement = focusableElements[focusableElements.length - 1];
      
      this.firstFocusableElement.focus();
      
      this.addEventListener('keydown', this.handleFocusTrap);
    }
  }

  handleFocusTrap = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === this.firstFocusableElement) {
          e.preventDefault();
          this.lastFocusableElement.focus();
        }
      } else {
        if (document.activeElement === this.lastFocusableElement) {
          e.preventDefault();
          this.firstFocusableElement.focus();
        }
      }
    }
  }

  returnFocus() {
    if (this.triggerElement) {
      this.triggerElement.focus();
    }
  }

  announce(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'visually-hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  formatMoney(cents) {
    return new Intl.NumberFormat(document.documentElement.lang || 'en', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'USD'
    }).format(cents / 100);
  }

  // Public methods for external control
  setTriggerElement(element) {
    this.triggerElement = element;
  }

  getCartData() {
    return fetch('/cart.js')
      .then(response => response.json())
      .catch(error => {
        console.error('Failed to fetch cart data:', error);
        return null;
      });
  }
}

customElements.define('cart-drawer', SunriseCartDrawer);
