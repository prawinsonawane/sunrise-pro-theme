/**
 * Sunrise Pro - Product Info
 * Handles product information display and interactions
 */

class SunriseProductInfo {
  constructor() {
    this.product = null;
    this.variants = [];
    this.selectedVariant = null;
    this.currentImageIndex = 0;
    this.init();
  }

  init() {
    this.setupProduct();
    this.bindEvents();
    this.initializeProduct();
  }

  setupProduct() {
    // Get product data from Shopify
    this.product = window.Shopify?.product || this.getProductFromPage();
    this.variants = this.product?.variants || [];
    this.selectedVariant = this.product?.selected_or_first_available_variant || this.variants[0];
  }

  getProductFromPage() {
    // Fallback: get product data from page elements
    const productData = document.querySelector('[data-product-json]');
    if (productData) {
      try {
        return JSON.parse(productData.textContent);
      } catch (e) {
        console.error('Error parsing product data:', e);
      }
    }
    return null;
  }

  bindEvents() {
    // Variant selection
    this.bindVariantEvents();
    
    // Image gallery
    this.bindImageEvents();
    
    // Product tabs
    this.bindTabEvents();
    
    // Share functionality
    this.bindShareEvents();
    
    // Reviews
    this.bindReviewEvents();
  }

  bindVariantEvents() {
    const variantInputs = document.querySelectorAll('input[name="id"]');
    variantInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.selectVariant(input.value);
      });
    });

    // Variant option buttons
    const variantButtons = document.querySelectorAll('.sunrise-product__variant-option');
    variantButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.selectVariantOption(button);
      });
    });
  }

  bindImageEvents() {
    const imageThumbnails = document.querySelectorAll('.sunrise-product-media-gallery__thumbnail');
    imageThumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => {
        this.selectImage(index);
      });
    });

    // Image zoom
    const mainImage = document.querySelector('.sunrise-product-media-gallery__main-image');
    if (mainImage) {
      mainImage.addEventListener('click', () => {
        this.openImageZoom();
      });
    }

    // Image navigation
    const prevButton = document.querySelector('.sunrise-product-media-gallery__prev');
    const nextButton = document.querySelector('.sunrise-product-media-gallery__next');
    
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        this.previousImage();
      });
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        this.nextImage();
      });
    }
  }

  bindTabEvents() {
    const tabButtons = document.querySelectorAll('.sunrise-product__tabs-nav-item');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.switchTab(button);
      });
    });
  }

  bindShareEvents() {
    const shareButtons = document.querySelectorAll('.sunrise-product__share-button');
    shareButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.shareProduct(button);
      });
    });
  }

  bindReviewEvents() {
    const reviewButtons = document.querySelectorAll('.sunrise-product__rating-link');
    reviewButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.scrollToReviews();
      });
    });
  }

  initializeProduct() {
    if (!this.product) return;

    this.updateProductInfo();
    this.updateVariantInfo();
    this.updateImageGallery();
    this.updatePrice();
    this.updateAvailability();
  }

  selectVariant(variantId) {
    const variant = this.variants.find(v => v.id.toString() === variantId.toString());
    if (variant) {
      this.selectedVariant = variant;
      this.updateVariantInfo();
      this.updatePrice();
      this.updateAvailability();
      this.updateImageGallery();
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('product:variant-changed', {
        detail: { variant: this.selectedVariant }
      }));
    }
  }

  selectVariantOption(button) {
    const input = button.querySelector('input');
    if (input) {
      input.checked = true;
      this.selectVariant(input.value);
    }
  }

  updateVariantInfo() {
    if (!this.selectedVariant) return;

    // Update variant options
    const variantOptions = document.querySelectorAll('.sunrise-product__variant-option');
    variantOptions.forEach(option => {
      const input = option.querySelector('input');
      if (input && input.value === this.selectedVariant.id.toString()) {
        option.classList.add('sunrise-product__variant-option--selected');
      } else {
        option.classList.remove('sunrise-product__variant-option--selected');
      }
    });

    // Update hidden input
    const hiddenInput = document.querySelector('input[name="id"]');
    if (hiddenInput) {
      hiddenInput.value = this.selectedVariant.id;
    }
  }

  updatePrice() {
    if (!this.selectedVariant) return;

    const priceElement = document.querySelector('.sunrise-product__price-current');
    const comparePriceElement = document.querySelector('.sunrise-product__price-compare');
    
    if (priceElement) {
      priceElement.textContent = this.formatPrice(this.selectedVariant.price);
    }
    
    if (comparePriceElement) {
      if (this.selectedVariant.compare_at_price && this.selectedVariant.compare_at_price > this.selectedVariant.price) {
        comparePriceElement.textContent = this.formatPrice(this.selectedVariant.compare_at_price);
        comparePriceElement.style.display = 'inline';
      } else {
        comparePriceElement.style.display = 'none';
      }
    }
  }

  updateAvailability() {
    if (!this.selectedVariant) return;

    const addToCartButton = document.querySelector('.sunrise-product__add-to-cart');
    const buyNowButton = document.querySelector('.sunrise-product__buy-now');
    const availabilityText = document.querySelector('.sunrise-product__availability');
    
    if (this.selectedVariant.available) {
      if (addToCartButton) {
        addToCartButton.disabled = false;
        addToCartButton.textContent = 'Add to Cart';
      }
      if (buyNowButton) {
        buyNowButton.disabled = false;
      }
      if (availabilityText) {
        availabilityText.textContent = 'In Stock';
        availabilityText.className = 'sunrise-product__availability sunrise-product__availability--in-stock';
      }
    } else {
      if (addToCartButton) {
        addToCartButton.disabled = true;
        addToCartButton.textContent = 'Sold Out';
      }
      if (buyNowButton) {
        buyNowButton.disabled = true;
      }
      if (availabilityText) {
        availabilityText.textContent = 'Out of Stock';
        availabilityText.className = 'sunrise-product__availability sunrise-product__availability--out-of-stock';
      }
    }
  }

  updateImageGallery() {
    if (!this.selectedVariant) return;

    // Find image associated with selected variant
    const variantImage = this.selectedVariant.featured_image;
    if (variantImage) {
      const imageIndex = this.product.images.findIndex(img => img.id === variantImage.id);
      if (imageIndex !== -1) {
        this.selectImage(imageIndex);
      }
    }
  }

  selectImage(index) {
    const images = document.querySelectorAll('.sunrise-product-media-gallery__main-image');
    const thumbnails = document.querySelectorAll('.sunrise-product-media-gallery__thumbnail');
    
    if (images[index]) {
      // Hide all images
      images.forEach(img => img.classList.remove('sunrise-product-media-gallery__main-image--active'));
      
      // Show selected image
      images[index].classList.add('sunrise-product-media-gallery__main-image--active');
      
      // Update thumbnails
      thumbnails.forEach(thumb => thumb.classList.remove('sunrise-product-media-gallery__thumbnail--active'));
      if (thumbnails[index]) {
        thumbnails[index].classList.add('sunrise-product-media-gallery__thumbnail--active');
      }
      
      this.currentImageIndex = index;
    }
  }

  previousImage() {
    const images = document.querySelectorAll('.sunrise-product-media-gallery__main-image');
    const newIndex = this.currentImageIndex > 0 ? this.currentImageIndex - 1 : images.length - 1;
    this.selectImage(newIndex);
  }

  nextImage() {
    const images = document.querySelectorAll('.sunrise-product-media-gallery__main-image');
    const newIndex = this.currentImageIndex < images.length - 1 ? this.currentImageIndex + 1 : 0;
    this.selectImage(newIndex);
  }

  openImageZoom() {
    // Implement image zoom functionality
    const zoomModal = document.createElement('div');
    zoomModal.className = 'sunrise-image-zoom-modal';
    zoomModal.innerHTML = `
      <div class="sunrise-image-zoom-modal__content">
        <button class="sunrise-image-zoom-modal__close" aria-label="Close zoom">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <img src="${this.product.images[this.currentImageIndex]?.src}" alt="${this.product.title}" class="sunrise-image-zoom-modal__image">
      </div>
    `;
    
    document.body.appendChild(zoomModal);
    document.body.classList.add('sunrise-image-zoom-open');
    
    // Close on click
    zoomModal.addEventListener('click', (e) => {
      if (e.target === zoomModal) {
        this.closeImageZoom();
      }
    });
    
    // Close button
    const closeButton = zoomModal.querySelector('.sunrise-image-zoom-modal__close');
    closeButton.addEventListener('click', () => {
      this.closeImageZoom();
    });
    
    // Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.closeImageZoom();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  closeImageZoom() {
    const zoomModal = document.querySelector('.sunrise-image-zoom-modal');
    if (zoomModal) {
      zoomModal.remove();
      document.body.classList.remove('sunrise-image-zoom-open');
    }
  }

  switchTab(button) {
    const tabId = button.dataset.tab;
    const tabContent = document.querySelector(`[data-tab-content="${tabId}"]`);
    
    if (tabContent) {
      // Update tab buttons
      document.querySelectorAll('.sunrise-product__tabs-nav-item').forEach(btn => {
        btn.classList.remove('sunrise-product__tabs-nav-item--active');
      });
      button.classList.add('sunrise-product__tabs-nav-item--active');
      
      // Update tab content
      document.querySelectorAll('.sunrise-product__tabs-content').forEach(content => {
        content.classList.remove('sunrise-product__tabs-content--active');
      });
      tabContent.classList.add('sunrise-product__tabs-content--active');
    }
  }

  shareProduct(button) {
    const platform = button.dataset.platform;
    const url = window.location.href;
    const title = this.product?.title || document.title;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'pinterest':
        const image = this.product?.featured_image?.src || '';
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(title)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          this.showNotification('Link copied to clipboard!');
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  scrollToReviews() {
    const reviewsSection = document.querySelector('.sunrise-product__tabs-content[data-tab-content="reviews"]');
    if (reviewsSection) {
      // Switch to reviews tab first
      const reviewsTab = document.querySelector('[data-tab="reviews"]');
      if (reviewsTab) {
        this.switchTab(reviewsTab);
      }
      
      // Scroll to reviews
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'sunrise-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  formatPrice(price) {
    return new Intl.NumberFormat(document.documentElement.lang || 'en', {
      style: 'currency',
      currency: window.Shopify?.currency?.active || 'USD'
    }).format(price / 100);
  }

  updateProductInfo() {
    // Update product title, description, etc.
    // This would typically be handled by the Liquid template
  }

  // Public methods
  getSelectedVariant() {
    return this.selectedVariant;
  }

  getCurrentImageIndex() {
    return this.currentImageIndex;
  }

  setImageIndex(index) {
    this.selectImage(index);
  }
}

// Initialize product info when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.SunriseProductInfo = new SunriseProductInfo();
});

// Re-initialize on section load
document.addEventListener('shopify:section:load', () => {
  if (window.SunriseProductInfo) {
    window.SunriseProductInfo.init();
  }
});
