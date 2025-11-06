/**
 * Sunrise Pro - Image Zoom
 * Handles image zoom functionality for product galleries
 */

class SunriseImageZoom {
  constructor() {
    this.zoomModal = null;
    this.currentImage = null;
    this.isZooming = false;
    this.zoomLevel = 1;
    this.maxZoom = 3;
    this.minZoom = 1;
    this.init();
  }

  init() {
    this.setupZoomTriggers();
    this.bindEvents();
  }

  setupZoomTriggers() {
    // Find all images that should have zoom functionality
    const zoomImages = document.querySelectorAll('[data-zoom], .sunrise-product-media-gallery__main-image, .sunrise-image-banner__image');
    
    zoomImages.forEach(image => {
      image.addEventListener('click', () => {
        this.openZoom(image);
      });
      
      // Add hover effect for desktop
      if (window.innerWidth > 768) {
        image.addEventListener('mouseenter', () => {
          this.showZoomHint(image);
        });
        
        image.addEventListener('mouseleave', () => {
          this.hideZoomHint(image);
        });
      }
    });
  }

  bindEvents() {
    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.zoomModal) {
        this.closeZoom();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.zoomModal) {
        this.updateZoomModalSize();
      }
    });
  }

  openZoom(image) {
    if (this.zoomModal) return;

    this.currentImage = image;
    this.createZoomModal();
    this.showZoomModal();
  }

  createZoomModal() {
    this.zoomModal = document.createElement('div');
    this.zoomModal.className = 'sunrise-image-zoom-modal';
    this.zoomModal.innerHTML = `
      <div class="sunrise-image-zoom-modal__overlay"></div>
      <div class="sunrise-image-zoom-modal__content">
        <button class="sunrise-image-zoom-modal__close" aria-label="Close zoom">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="sunrise-image-zoom-modal__controls">
          <button class="sunrise-image-zoom-modal__control sunrise-image-zoom-modal__control--zoom-out" aria-label="Zoom out">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <span class="sunrise-image-zoom-modal__zoom-level">${Math.round(this.zoomLevel * 100)}%</span>
          <button class="sunrise-image-zoom-modal__control sunrise-image-zoom-modal__control--zoom-in" aria-label="Zoom in">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
            </svg>
          </button>
          <button class="sunrise-image-zoom-modal__control sunrise-image-zoom-modal__control--reset" aria-label="Reset zoom">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
          </button>
        </div>
        <div class="sunrise-image-zoom-modal__image-container">
          <img src="${this.currentImage.src}" alt="${this.currentImage.alt || ''}" class="sunrise-image-zoom-modal__image">
        </div>
      </div>
    `;

    document.body.appendChild(this.zoomModal);
    this.bindZoomEvents();
  }

  bindZoomEvents() {
    // Close button
    const closeButton = this.zoomModal.querySelector('.sunrise-image-zoom-modal__close');
    closeButton.addEventListener('click', () => {
      this.closeZoom();
    });

    // Overlay click
    const overlay = this.zoomModal.querySelector('.sunrise-image-zoom-modal__overlay');
    overlay.addEventListener('click', () => {
      this.closeZoom();
    });

    // Zoom controls
    const zoomInButton = this.zoomModal.querySelector('.sunrise-image-zoom-modal__control--zoom-in');
    const zoomOutButton = this.zoomModal.querySelector('.sunrise-image-zoom-modal__control--zoom-out');
    const resetButton = this.zoomModal.querySelector('.sunrise-image-zoom-modal__control--reset');

    zoomInButton.addEventListener('click', () => {
      this.zoomIn();
    });

    zoomOutButton.addEventListener('click', () => {
      this.zoomOut();
    });

    resetButton.addEventListener('click', () => {
      this.resetZoom();
    });

    // Image container for panning
    const imageContainer = this.zoomModal.querySelector('.sunrise-image-zoom-modal__image-container');
    this.setupPanning(imageContainer);

    // Mouse wheel zoom
    imageContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    });
  }

  setupPanning(imageContainer) {
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    imageContainer.addEventListener('mousedown', (e) => {
      if (this.zoomLevel > 1) {
        isPanning = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        imageContainer.style.cursor = 'grabbing';
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isPanning) {
        e.preventDefault();
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        this.updateImagePosition(currentX, currentY);
      }
    });

    document.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        imageContainer.style.cursor = this.zoomLevel > 1 ? 'grab' : 'default';
      }
    });

    // Touch events for mobile
    imageContainer.addEventListener('touchstart', (e) => {
      if (this.zoomLevel > 1 && e.touches.length === 1) {
        isPanning = true;
        startX = e.touches[0].clientX - currentX;
        startY = e.touches[0].clientY - currentY;
      }
    });

    imageContainer.addEventListener('touchmove', (e) => {
      if (isPanning && e.touches.length === 1) {
        e.preventDefault();
        currentX = e.touches[0].clientX - startX;
        currentY = e.touches[0].clientY - startY;
        this.updateImagePosition(currentX, currentY);
      }
    });

    imageContainer.addEventListener('touchend', () => {
      isPanning = false;
    });
  }

  showZoomModal() {
    document.body.classList.add('sunrise-image-zoom-open');
    this.zoomModal.classList.add('sunrise-image-zoom-modal--open');
    
    // Focus the modal for accessibility
    this.zoomModal.focus();
  }

  closeZoom() {
    if (!this.zoomModal) return;

    this.zoomModal.classList.remove('sunrise-image-zoom-modal--open');
    document.body.classList.remove('sunrise-image-zoom-open');
    
    setTimeout(() => {
      this.zoomModal.remove();
      this.zoomModal = null;
      this.currentImage = null;
      this.zoomLevel = 1;
    }, 300);
  }

  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel = Math.min(this.zoomLevel + 0.25, this.maxZoom);
      this.updateZoom();
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel = Math.max(this.zoomLevel - 0.25, this.minZoom);
      this.updateZoom();
    }
  }

  resetZoom() {
    this.zoomLevel = 1;
    this.updateZoom();
    this.updateImagePosition(0, 0);
  }

  updateZoom() {
    const image = this.zoomModal.querySelector('.sunrise-image-zoom-modal__image');
    const zoomLevelDisplay = this.zoomModal.querySelector('.sunrise-image-zoom-modal__zoom-level');
    const imageContainer = this.zoomModal.querySelector('.sunrise-image-zoom-modal__image-container');
    
    if (image) {
      image.style.transform = `scale(${this.zoomLevel})`;
    }
    
    if (zoomLevelDisplay) {
      zoomLevelDisplay.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }
    
    if (imageContainer) {
      imageContainer.style.cursor = this.zoomLevel > 1 ? 'grab' : 'default';
    }
  }

  updateImagePosition(x, y) {
    const image = this.zoomModal.querySelector('.sunrise-image-zoom-modal__image');
    if (image) {
      image.style.transform = `scale(${this.zoomLevel}) translate(${x}px, ${y}px)`;
    }
  }

  updateZoomModalSize() {
    if (!this.zoomModal) return;
    
    // Recalculate modal size on window resize
    const content = this.zoomModal.querySelector('.sunrise-image-zoom-modal__content');
    if (content) {
      content.style.maxWidth = '90vw';
      content.style.maxHeight = '90vh';
    }
  }

  showZoomHint(image) {
    if (image.querySelector('.sunrise-image-zoom-hint')) return;
    
    const hint = document.createElement('div');
    hint.className = 'sunrise-image-zoom-hint';
    hint.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
        <line x1="11" y1="8" x2="11" y2="14"/>
      </svg>
      Click to zoom
    `;
    
    image.appendChild(hint);
  }

  hideZoomHint(image) {
    const hint = image.querySelector('.sunrise-image-zoom-hint');
    if (hint) {
      hint.remove();
    }
  }

  // Public methods
  isOpen() {
    return this.zoomModal !== null;
  }

  getZoomLevel() {
    return this.zoomLevel;
  }

  setZoomLevel(level) {
    this.zoomLevel = Math.max(this.minZoom, Math.min(level, this.maxZoom));
    if (this.zoomModal) {
      this.updateZoom();
    }
  }
}

// Initialize image zoom when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.SunriseImageZoom = new SunriseImageZoom();
});

// Re-initialize on section load
document.addEventListener('shopify:section:load', () => {
  if (window.SunriseImageZoom) {
    window.SunriseImageZoom.init();
  }
});
