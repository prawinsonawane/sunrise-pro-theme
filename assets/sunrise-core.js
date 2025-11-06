// Sunrise Pro - Core JavaScript

class SunriseCore {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeComponents();
    this.setupScrollAnimations();
  }

  setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.sunrise-mobile-menu-toggle');
    const mobileMenu = document.querySelector('.sunrise-mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
      mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
      });

      // Close mobile menu when clicking outside
      mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
          mobileMenuToggle.classList.remove('active');
          mobileMenu.classList.remove('active');
          document.body.classList.remove('menu-open');
        }
      });

      // Close mobile menu when clicking close button
      const closeButton = mobileMenu.querySelector('.sunrise-mobile-menu__close');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          mobileMenuToggle.classList.remove('active');
          mobileMenu.classList.remove('active');
          document.body.classList.remove('menu-open');
        });
      }
    }

    // Search modal toggle
    const searchToggle = document.querySelector('.sunrise-header__search-toggle');
    const searchModal = document.querySelector('.sunrise-search-modal');
    
    if (searchToggle && searchModal) {
      searchToggle.addEventListener('click', () => {
        searchModal.classList.add('active');
        const searchInput = searchModal.querySelector('.sunrise-search-form__input');
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 100);
        }
      });

      // Close search modal
      const closeButton = searchModal.querySelector('.sunrise-search-modal__close');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          searchModal.classList.remove('active');
        });
      }

      // Close search modal when clicking outside
      searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
          searchModal.classList.remove('active');
        }
      });

      // Close search modal with Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal.classList.contains('active')) {
          searchModal.classList.remove('active');
        }
      });
    }

    // Product media thumbnails
    this.setupProductMedia();
  }

  setupProductMedia() {
    const thumbnails = document.querySelectorAll('.sunrise-media-thumbnail');
    const mainMedia = document.querySelector('.sunrise-media__item img');
    
    if (thumbnails.length && mainMedia) {
      thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
          // Remove active class from all thumbnails
          thumbnails.forEach(t => t.classList.remove('sunrise-media-thumbnail--active'));
          
          // Add active class to clicked thumbnail
          thumbnail.classList.add('sunrise-media-thumbnail--active');
          
          // Update main media
          const thumbnailImg = thumbnail.querySelector('img');
          if (thumbnailImg) {
            mainMedia.src = thumbnailImg.src;
            mainMedia.alt = thumbnailImg.alt;
          }
        });
      });
    }
  }

  initializeComponents() {
    // Initialize quantity selectors
    this.initializeQuantitySelectors();
    
    // Initialize variant selectors
    this.initializeVariantSelectors();
    
    // Initialize product forms
    this.initializeProductForms();
  }

  initializeQuantitySelectors() {
    const quantityInputs = document.querySelectorAll('.sunrise-quantity-input');
    
    quantityInputs.forEach(input => {
      const field = input.querySelector('.sunrise-quantity-input__field');
      const minusBtn = input.querySelector('.sunrise-quantity-button--minus');
      const plusBtn = input.querySelector('.sunrise-quantity-button--plus');
      
      if (field && minusBtn && plusBtn) {
        minusBtn.addEventListener('click', () => {
          const currentValue = parseInt(field.value) || 1;
          if (currentValue > 1) {
            field.value = currentValue - 1;
            field.dispatchEvent(new Event('change'));
          }
        });
        
        plusBtn.addEventListener('click', () => {
          const currentValue = parseInt(field.value) || 1;
          field.value = currentValue + 1;
          field.dispatchEvent(new Event('change'));
        });
        
        field.addEventListener('change', () => {
          const value = parseInt(field.value) || 1;
          if (value < 1) {
            field.value = 1;
          }
        });
      }
    });
  }

  initializeVariantSelectors() {
    const variantSelects = document.querySelectorAll('.sunrise-variant-selects');
    
    variantSelects.forEach(select => {
      const inputs = select.querySelectorAll('input[type="radio"]');
      
      inputs.forEach(input => {
        input.addEventListener('change', () => {
          this.updateVariant(select);
        });
      });
    });
  }

  updateVariant(container) {
    const selectedOptions = {};
    const inputs = container.querySelectorAll('input[type="radio"]:checked');
    
    inputs.forEach(input => {
      const name = input.name.replace('options[', '').replace(']', '');
      selectedOptions[name] = input.value;
    });
    
    // Find matching variant
    const productData = window.productData || {};
    const variants = productData.variants || [];
    
    const matchingVariant = variants.find(variant => {
      return Object.keys(selectedOptions).every(optionName => {
        return variant.options.includes(selectedOptions[optionName]);
      });
    });
    
    if (matchingVariant) {
      this.updateProductInfo(matchingVariant);
    }
  }

  updateProductInfo(variant) {
    // Update price
    const priceElement = document.querySelector('.sunrise-price-item--regular');
    if (priceElement && variant.price) {
      priceElement.textContent = this.formatMoney(variant.price);
    }
    
    // Update compare at price
    const salePriceElement = document.querySelector('.sunrise-price-item--sale');
    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      if (salePriceElement) {
        salePriceElement.textContent = this.formatMoney(variant.compare_at_price);
        salePriceElement.style.display = 'inline';
      }
    } else if (salePriceElement) {
      salePriceElement.style.display = 'none';
    }
    
    // Update SKU
    const skuElement = document.querySelector('.sunrise-sku');
    if (skuElement) {
      skuElement.textContent = `SKU: ${variant.sku || 'N/A'}`;
    }
    
    // Update availability
    const addToCartButton = document.querySelector('.sunrise-product-form__cart-submit');
    if (addToCartButton) {
      if (variant.available) {
        addToCartButton.disabled = false;
        addToCartButton.querySelector('span').textContent = 'Add to cart';
      } else {
        addToCartButton.disabled = true;
        addToCartButton.querySelector('span').textContent = 'Sold out';
      }
    }
    
    // Update variant ID in form
    const variantInput = document.querySelector('input[name="id"]');
    if (variantInput) {
      variantInput.value = variant.id;
    }
  }

  formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  }

  initializeProductForms() {
    const productFormWrappers = document.querySelectorAll('.sunrise-product-form');
    
    productFormWrappers.forEach(wrapper => {
      // Find the actual form element inside the wrapper
      const form = wrapper.querySelector('form.sunrise-form') || wrapper.querySelector('form');
      if (!form) {
        console.warn('Form element not found inside .sunrise-product-form');
        return;
      }
      
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleProductFormSubmit(form);
      });
    });
  }

  async handleProductFormSubmit(form) {
    // Validate form element
    if (!form || !(form instanceof HTMLFormElement)) {
      console.error('Invalid form element:', form);
      return;
    }
    
    const submitButton = form.querySelector('.sunrise-product-form__cart-submit');
    const loadingOverlay = form.querySelector('.sunrise-loading-overlay');
    const errorMessage = form.querySelector('.sunrise-product-form__error-message');
    
    if (submitButton && submitButton.disabled) return;
    
    // Show loading state
    if (submitButton) {
      submitButton.disabled = true;
    }
    if (loadingOverlay) {
      loadingOverlay.classList.remove('hidden');
    }
    
    // Hide previous error
    if (errorMessage) {
      errorMessage.parentElement.hidden = true;
    }
    
    try {
      const formData = new FormData(form);
      const response = await fetch(window.routes.cart_add_url, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.status === 422) {
        throw new Error(result.description || 'Unable to add item to cart');
      }
      
      if (result.status === 200) {
        // Success - update cart count
        this.updateCartCount(result.item_count);
        
        // Show success message (optional)
        this.showNotification('Item added to cart!', 'success');
        
        // Reset form
        form.reset();
      } else {
        throw new Error('Unable to add item to cart');
      }
    } catch (error) {
      // Show error message
      if (errorMessage) {
        errorMessage.textContent = error.message;
        errorMessage.parentElement.hidden = false;
      }
    } finally {
      // Hide loading state
      submitButton.disabled = false;
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }
    }
  }

  updateCartCount(count) {
    const cartCount = document.querySelector('.sunrise-cart-count');
    if (cartCount) {
      cartCount.textContent = count;
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `sunrise-notification sunrise-notification--${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.classList.add('sunrise-notification--show');
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove('sunrise-notification--show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  setupScrollAnimations() {
    if (!window.IntersectionObserver) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe scroll trigger elements
    const scrollTriggers = document.querySelectorAll('.scroll-trigger');
    scrollTriggers.forEach(trigger => {
      observer.observe(trigger);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SunriseCore();
});

// Export for use in other modules
window.SunriseCore = SunriseCore;
