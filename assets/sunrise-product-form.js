/**
 * Sunrise Pro - Product Form Component
 * Handles product form submission, variant selection, and cart functionality
 * Based on Dawn theme patterns for reliability and user-friendliness
 */

if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();
      this.form = this.querySelector('form[id^="ProductForm-"]');
      this.submitButton = this.querySelector('[type="submit"]');
      this.submitButtonText = this.querySelector('.sunrise-product-form__cart-submit span');
      this.loadingSpinner = this.querySelector('.sunrise-loading-overlay');
      this.errorMessageWrapper = this.querySelector('.sunrise-product-form__error-message-wrapper');
      this.errorMessage = this.querySelector('.sunrise-product-form__error-message');
      this.cartDrawer = document.querySelector('cart-drawer') || document.querySelector('#cart-drawer');
      
      if (!this.form) {
        console.warn('Product form not found in product-form element');
        return;
      }
      
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cartNotification = document.querySelector('cart-notification');
    }

    onSubmitHandler(evt) {
      evt.preventDefault();
      
      if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

      this.handleErrorMessage();
      
      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButton.classList.add('loading');
      if (this.submitButtonText) {
        this.submitButtonText.textContent = 'Adding...';
      }
      if (this.loadingSpinner) {
        this.loadingSpinner.classList.remove('hidden');
      }

      // Get variant ID from form - ensure it's not disabled
      const variantIdInput = this.form.querySelector('input[name="id"]');
      
      if (!variantIdInput || !variantIdInput.value) {
        this.handleErrorMessage('Please select a variant');
        this.submitButton.removeAttribute('aria-disabled');
        this.submitButton.classList.remove('loading');
        if (this.submitButtonText) {
          this.submitButtonText.textContent = 'Add to cart';
        }
        if (this.loadingSpinner) {
          this.loadingSpinner.classList.add('hidden');
        }
        return;
      }
      
      // Ensure variant ID input is enabled
      if (variantIdInput.disabled) {
        variantIdInput.disabled = false;
      }
      
      // Use the form's FormData which includes all form fields
      const formData = new FormData(this.form);
      
      // Verify required fields are present
      if (!formData.has('id') || !formData.get('id')) {
        this.handleErrorMessage('Please select a variant');
        this.submitButton.removeAttribute('aria-disabled');
        this.submitButton.classList.remove('loading');
        if (this.submitButtonText) {
          this.submitButtonText.textContent = 'Add to cart';
        }
        if (this.loadingSpinner) {
          this.loadingSpinner.classList.add('hidden');
        }
        return;
      }
      
      // Ensure quantity is set (default to 1 if not present)
      if (!formData.has('quantity') || !formData.get('quantity')) {
        formData.set('quantity', '1');
      }
      
      fetch(`${window.Shopify.routes.root}cart/add.js`, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.description || 'Unable to add item to cart');
            });
          }
          return response.json();
        })
        .then((response) => {
          this.handleSuccess(response);
        })
        .catch((error) => {
          console.error('Error:', error);
          this.handleErrorMessage(error.message || 'An error occurred while adding to cart');
        })
        .finally(() => {
          this.submitButton.removeAttribute('aria-disabled');
          this.submitButton.classList.remove('loading');
          if (this.submitButtonText) {
            this.submitButtonText.textContent = 'Add to cart';
          }
          if (this.loadingSpinner) {
            this.loadingSpinner.classList.add('hidden');
          }
        });
    }

    handleSuccess(response) {
      // Publish cart update event
      document.dispatchEvent(new CustomEvent('cart:update', {
        detail: {
          cart: response,
        },
        bubbles: true,
      }));

      // Fetch updated cart and update drawer
      fetch(`${window.Shopify.routes.root}cart.js`)
        .then((response) => response.json())
        .then((cart) => {
          // Update cart count
          this.updateCartCountWithCart(cart);
          
          // Update cart drawer if it exists
          if (this.cartDrawer && typeof this.cartDrawer.updateCart === 'function') {
            this.cartDrawer.updateCart(cart);
          }
          
          // Open cart drawer if it exists
          if (this.cartDrawer && typeof this.cartDrawer.open === 'function') {
            this.cartDrawer.open();
          } else if (this.cartNotification && typeof this.cartNotification.renderContents === 'function') {
            this.cartNotification.renderContents(cart);
          }

          // Show success message
          this.showNotification('Item added to cart!', 'success');
          
          // Reset form
          this.form.reset();
        })
        .catch((error) => {
          console.error('Error fetching cart:', error);
          // Still update cart count even if drawer update fails
          this.updateCartCount();
        });
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }

    updateCartCount() {
      fetch(`${window.Shopify.routes.root}cart.js`)
        .then((response) => response.json())
        .then((cart) => {
          this.updateCartCountWithCart(cart);
        })
        .catch((error) => {
          console.error('Error updating cart count:', error);
        });
    }
    
    updateCartCountWithCart(cart) {
      const cartCounts = document.querySelectorAll('.sunrise-cart-count');
      cartCounts.forEach((count) => {
        count.textContent = cart.item_count;
        count.setAttribute('aria-hidden', cart.item_count === 0);
        if (cart.item_count > 0) {
          count.style.display = '';
        } else {
          count.style.display = 'none';
        }
      });
      
      // Publish cart update event
      document.dispatchEvent(new CustomEvent('cart:updated', {
        detail: { cart },
        bubbles: true,
      }));
    }

    showNotification(message, type = 'success') {
      // You can add a toast notification here if needed
      console.log(`${type}: ${message}`);
    }
  });
}
