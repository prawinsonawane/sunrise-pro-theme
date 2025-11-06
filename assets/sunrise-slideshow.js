/**
 * Sunrise Pro - Slideshow Component
 * Handles slideshow functionality with auto-rotation and manual controls
 */

class SunriseSlideshowComponent extends HTMLElement {
  constructor() {
    super();
    this.slides = this.querySelectorAll('.sunrise-slideshow__slide');
    this.indicators = this.querySelectorAll('.sunrise-slideshow__indicator');
    this.prevButton = this.querySelector('.sunrise-slideshow__prev');
    this.nextButton = this.querySelector('.sunrise-slideshow__next');
    this.currentSlide = 0;
    this.autoRotate = this.dataset.autoRotate === 'true';
    this.changeSpeed = parseInt(this.dataset.changeSlidesSpeed) * 1000;
    this.autoRotateInterval = null;
    this.isTransitioning = false;

    this.init();
  }

  init() {
    if (this.slides.length <= 1) return;

    this.bindEvents();
    this.startAutoRotate();
    this.updateIndicators();
  }

  bindEvents() {
    // Previous button
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.previousSlide());
    }

    // Next button
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.nextSlide());
    }

    // Indicators
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });

    // Pause auto-rotate on hover
    this.addEventListener('mouseenter', () => this.stopAutoRotate());
    this.addEventListener('mouseleave', () => this.startAutoRotate());

    // Keyboard navigation
    this.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.previousSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextSlide();
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
          this.previousSlide();
        } else {
          this.nextSlide();
        }
      }
    });
  }

  nextSlide() {
    if (this.isTransitioning) return;
    
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  previousSlide() {
    if (this.isTransitioning) return;
    
    const prevIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.goToSlide(prevIndex);
  }

  goToSlide(index) {
    if (this.isTransitioning || index === this.currentSlide) return;

    this.isTransitioning = true;
    
    // Hide current slide
    this.slides[this.currentSlide].classList.remove('sunrise-slideshow__slide--active');
    this.indicators[this.currentSlide]?.classList.remove('sunrise-slideshow__indicator--active');

    // Show new slide
    this.currentSlide = index;
    this.slides[this.currentSlide].classList.add('sunrise-slideshow__slide--active');
    this.indicators[this.currentSlide]?.classList.add('sunrise-slideshow__indicator--active');

    // Reset transition flag after animation
    setTimeout(() => {
      this.isTransitioning = false;
    }, 600);
  }

  updateIndicators() {
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle('sunrise-slideshow__indicator--active', index === this.currentSlide);
    });
  }

  startAutoRotate() {
    if (!this.autoRotate || this.slides.length <= 1) return;

    this.stopAutoRotate();
    this.autoRotateInterval = setInterval(() => {
      this.nextSlide();
    }, this.changeSpeed);
  }

  stopAutoRotate() {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
      this.autoRotateInterval = null;
    }
  }

  // Pause auto-rotate when page is not visible
  connectedCallback() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAutoRotate();
      } else if (this.autoRotate) {
        this.startAutoRotate();
      }
    });
  }

  disconnectedCallback() {
    this.stopAutoRotate();
  }
}

customElements.define('sunrise-slideshow-component', SunriseSlideshowComponent);
