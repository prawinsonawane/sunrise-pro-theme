/**
 * Sunrise Pro - Product Media Gallery Component
 * Handles product image/video gallery functionality
 */

class SunriseProductMediaGallery extends HTMLElement {
  constructor() {
    super();
    this.viewport = this.querySelector('.sunrise-product-media-gallery__viewport');
    this.thumbnails = this.querySelectorAll('.sunrise-product-media-gallery__thumbnail');
    this.currentMedia = 0;
    this.mediaCount = this.thumbnails.length;

    this.init();
  }

  init() {
    if (this.mediaCount <= 1) return;

    this.bindEvents();
    this.updateActiveMedia();
  }

  bindEvents() {
    // Thumbnail clicks
    this.thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => {
        this.goToMedia(index);
      });
    });

    // Keyboard navigation
    this.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.previousMedia();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextMedia();
      }
    });

    // Touch/swipe support
    this.addTouchSupport();
  }

  addTouchSupport() {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    this.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    this.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Only trigger swipe if horizontal movement is greater than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          this.previousMedia();
        } else {
          this.nextMedia();
        }
      }
    });
  }

  goToMedia(index) {
    if (index === this.currentMedia) return;

    this.currentMedia = index;
    this.updateActiveMedia();
  }

  nextMedia() {
    const nextIndex = (this.currentMedia + 1) % this.mediaCount;
    this.goToMedia(nextIndex);
  }

  previousMedia() {
    const prevIndex = this.currentMedia === 0 ? this.mediaCount - 1 : this.currentMedia - 1;
    this.goToMedia(prevIndex);
  }

  updateActiveMedia() {
    // Update viewport
    const mediaItems = this.querySelectorAll('.sunrise-product-media-gallery__item');
    mediaItems.forEach((item, index) => {
      item.classList.toggle('sunrise-product-media-gallery__item--active', index === this.currentMedia);
    });

    // Update thumbnails
    this.thumbnails.forEach((thumbnail, index) => {
      thumbnail.classList.toggle('sunrise-product-media-gallery__thumbnail--active', index === this.currentMedia);
    });

    // Update accessibility
    this.thumbnails.forEach((thumbnail, index) => {
      thumbnail.setAttribute('aria-selected', index === this.currentMedia);
    });
  }

  // Public methods for external control
  getCurrentMedia() {
    return this.currentMedia;
  }

  getMediaCount() {
    return this.mediaCount;
  }

  setCurrentMedia(index) {
    if (index >= 0 && index < this.mediaCount) {
      this.goToMedia(index);
    }
  }
}

customElements.define('sunrise-product-media-gallery', SunriseProductMediaGallery);
