/**
 * Sunrise Pro - Parallax Effects
 * Handles scroll-triggered parallax animations
 */

class SunriseParallax {
  constructor() {
    this.elements = [];
    this.isEnabled = true;
    this.ticking = false;
    this.init();
  }

  init() {
    this.setupElements();
    this.bindEvents();
    this.checkReducedMotion();
  }

  setupElements() {
    // Find all elements with parallax data attributes
    this.elements = Array.from(document.querySelectorAll('[data-parallax]')).map(element => {
      const speed = parseFloat(element.dataset.parallax) || 0.5;
      const direction = element.dataset.parallaxDirection || 'up';
      const offset = parseFloat(element.dataset.parallaxOffset) || 0;
      
      return {
        element,
        speed,
        direction,
        offset,
        originalTransform: element.style.transform || '',
        rect: element.getBoundingClientRect()
      };
    });

    // Also find elements with parallax classes
    const parallaxClasses = [
      '.sunrise-parallax',
      '.sunrise-hero__background',
      '.sunrise-banner__background',
      '.sunrise-image-banner__background'
    ];

    parallaxClasses.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!this.elements.find(item => item.element === element)) {
          this.elements.push({
            element,
            speed: 0.5,
            direction: 'up',
            offset: 0,
            originalTransform: element.style.transform || '',
            rect: element.getBoundingClientRect()
          });
        }
      });
    });
  }

  bindEvents() {
    // Throttled scroll event
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.updateParallax();
          this.ticking = false;
        });
        this.ticking = true;
      }
    });

    // Resize event
    window.addEventListener('resize', () => {
      this.updateElementRects();
    });

    // Intersection Observer for performance
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    }
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const parallaxElement = this.elements.find(item => item.element === entry.target);
        if (parallaxElement) {
          parallaxElement.isVisible = entry.isIntersecting;
        }
      });
    }, {
      rootMargin: '50px 0px 50px 0px'
    });

    this.elements.forEach(item => {
      observer.observe(item.element);
    });
  }

  updateParallax() {
    if (!this.isEnabled) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;

    this.elements.forEach(item => {
      if (item.isVisible === false) return;

      const rect = item.element.getBoundingClientRect();
      const elementTop = rect.top + scrollTop;
      const elementHeight = rect.height;
      
      // Calculate if element is in viewport
      const isInViewport = rect.bottom > 0 && rect.top < windowHeight;
      
      if (!isInViewport) return;

      // Calculate parallax offset
      const scrolled = scrollTop - elementTop + windowHeight;
      const parallaxOffset = (scrolled * item.speed) + item.offset;

      // Apply transform based on direction
      let transform = '';
      switch (item.direction) {
        case 'up':
          transform = `translateY(${parallaxOffset}px)`;
          break;
        case 'down':
          transform = `translateY(${-parallaxOffset}px)`;
          break;
        case 'left':
          transform = `translateX(${parallaxOffset}px)`;
          break;
        case 'right':
          transform = `translateX(${-parallaxOffset}px)`;
          break;
        case 'scale':
          const scale = 1 + (parallaxOffset * 0.001);
          transform = `scale(${Math.max(0.8, Math.min(1.2, scale))})`;
          break;
        case 'rotate':
          const rotation = parallaxOffset * 0.1;
          transform = `rotate(${rotation}deg)`;
          break;
        case 'fade':
          const opacity = Math.max(0, Math.min(1, 1 - (parallaxOffset * 0.001)));
          item.element.style.opacity = opacity;
          break;
        default:
          transform = `translateY(${parallaxOffset}px)`;
      }

      // Apply transform
      if (transform) {
        item.element.style.transform = `${item.originalTransform} ${transform}`;
      }
    });
  }

  updateElementRects() {
    this.elements.forEach(item => {
      item.rect = item.element.getBoundingClientRect();
    });
  }

  checkReducedMotion() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.disable();
    }

    // Listen for changes in motion preference
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (e.matches) {
        this.disable();
      } else {
        this.enable();
      }
    });
  }

  // Public methods
  enable() {
    this.isEnabled = true;
    this.elements.forEach(item => {
      item.element.classList.add('sunrise-parallax--enabled');
    });
  }

  disable() {
    this.isEnabled = false;
    this.elements.forEach(item => {
      item.element.classList.remove('sunrise-parallax--enabled');
      item.element.style.transform = item.originalTransform;
    });
  }

  addElement(element, options = {}) {
    const parallaxElement = {
      element,
      speed: options.speed || 0.5,
      direction: options.direction || 'up',
      offset: options.offset || 0,
      originalTransform: element.style.transform || '',
      rect: element.getBoundingClientRect(),
      isVisible: true
    };

    this.elements.push(parallaxElement);
    element.setAttribute('data-parallax', parallaxElement.speed);
    element.setAttribute('data-parallax-direction', parallaxElement.direction);
    element.setAttribute('data-parallax-offset', parallaxElement.offset);
  }

  removeElement(element) {
    const index = this.elements.findIndex(item => item.element === element);
    if (index > -1) {
      this.elements.splice(index, 1);
      element.style.transform = '';
      element.removeAttribute('data-parallax');
      element.removeAttribute('data-parallax-direction');
      element.removeAttribute('data-parallax-offset');
    }
  }

  refresh() {
    this.setupElements();
    this.updateParallax();
  }
}

// Initialize parallax when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.SunriseParallax = new SunriseParallax();
});

// Re-initialize on section load
document.addEventListener('shopify:section:load', () => {
  if (window.SunriseParallax) {
    window.SunriseParallax.refresh();
  }
});

// Utility function to add parallax to any element
window.addParallax = function(element, options = {}) {
  if (window.SunriseParallax) {
    window.SunriseParallax.addElement(element, options);
  }
};

// Utility function to remove parallax from any element
window.removeParallax = function(element) {
  if (window.SunriseParallax) {
    window.SunriseParallax.removeElement(element);
  }
};
