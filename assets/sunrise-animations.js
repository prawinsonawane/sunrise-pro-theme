/**
 * Sunrise Pro - Animation System
 * Handles scroll-triggered animations and transitions
 */

class SunriseAnimations {
  constructor() {
    this.animatedElements = new Set();
    this.intersectionObserver = null;
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.bindEvents();
    this.animateOnLoad();
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.animateAllElements();
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateElement(entry.target);
            this.intersectionObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );
  }

  bindEvents() {
    // Observe elements with animation classes
    document.addEventListener('DOMContentLoaded', () => {
      this.observeElements();
    });

    // Re-observe elements when content changes
    document.addEventListener('shopify:section:load', () => {
      this.observeElements();
    });

    // Handle resize events
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));
  }

  observeElements() {
    const elements = document.querySelectorAll('[class*="scroll-trigger"]');
    elements.forEach((element) => {
      if (!this.animatedElements.has(element)) {
        this.intersectionObserver?.observe(element);
        this.animatedElements.add(element);
      }
    });
  }

  animateElement(element) {
    const animationType = this.getAnimationType(element);
    
    // Add animation class
    element.classList.add('animate--active');
    
    // Trigger specific animation
    switch (animationType) {
      case 'fade-in':
        this.animateFadeIn(element);
        break;
      case 'slide-in':
        this.animateSlideIn(element);
        break;
      case 'slide-up':
        this.animateSlideUp(element);
        break;
      case 'slide-down':
        this.animateSlideDown(element);
        break;
      case 'scale-in':
        this.animateScaleIn(element);
        break;
      case 'rotate-in':
        this.animateRotateIn(element);
        break;
      default:
        this.animateFadeIn(element);
    }
  }

  getAnimationType(element) {
    const classes = element.className;
    
    if (classes.includes('animate--slide-in')) return 'slide-in';
    if (classes.includes('animate--slide-up')) return 'slide-up';
    if (classes.includes('animate--slide-down')) return 'slide-down';
    if (classes.includes('animate--scale-in')) return 'scale-in';
    if (classes.includes('animate--rotate-in')) return 'rotate-in';
    
    return 'fade-in'; // Default
  }

  animateFadeIn(element) {
    element.style.opacity = '0';
    element.style.transition = 'opacity 0.6s ease-out';
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
  }

  animateSlideIn(element) {
    const direction = this.getSlideDirection(element);
    const distance = this.getSlideDistance(element);
    
    element.style.transform = `translate${direction}(${distance})`;
    element.style.opacity = '0';
    element.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    
    requestAnimationFrame(() => {
      element.style.transform = 'translateX(0) translateY(0)';
      element.style.opacity = '1';
    });
  }

  animateSlideUp(element) {
    element.style.transform = 'translateY(30px)';
    element.style.opacity = '0';
    element.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    
    requestAnimationFrame(() => {
      element.style.transform = 'translateY(0)';
      element.style.opacity = '1';
    });
  }

  animateSlideDown(element) {
    element.style.transform = 'translateY(-30px)';
    element.style.opacity = '0';
    element.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    
    requestAnimationFrame(() => {
      element.style.transform = 'translateY(0)';
      element.style.opacity = '1';
    });
  }

  animateScaleIn(element) {
    element.style.transform = 'scale(0.8)';
    element.style.opacity = '0';
    element.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    
    requestAnimationFrame(() => {
      element.style.transform = 'scale(1)';
      element.style.opacity = '1';
    });
  }

  animateRotateIn(element) {
    element.style.transform = 'rotate(-10deg) scale(0.8)';
    element.style.opacity = '0';
    element.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    
    requestAnimationFrame(() => {
      element.style.transform = 'rotate(0deg) scale(1)';
      element.style.opacity = '1';
    });
  }

  getSlideDirection(element) {
    const classes = element.className;
    
    if (classes.includes('animate--slide-in-left')) return 'X';
    if (classes.includes('animate--slide-in-right')) return 'X';
    if (classes.includes('animate--slide-in-up')) return 'Y';
    if (classes.includes('animate--slide-in-down')) return 'Y';
    
    return 'X'; // Default
  }

  getSlideDistance(element) {
    const classes = element.className;
    
    if (classes.includes('animate--slide-in-left')) return '30px';
    if (classes.includes('animate--slide-in-right')) return '-30px';
    if (classes.includes('animate--slide-in-up')) return '30px';
    if (classes.includes('animate--slide-in-down')) return '-30px';
    
    return '30px'; // Default
  }

  animateOnLoad() {
    // Animate elements that are already in viewport
    const elements = document.querySelectorAll('[class*="scroll-trigger"]');
    elements.forEach((element) => {
      if (this.isInViewport(element)) {
        this.animateElement(element);
      }
    });
  }

  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  handleResize() {
    // Re-animate elements on resize if needed
    this.animatedElements.clear();
    this.observeElements();
  }

  // Utility function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Public methods
  animateAllElements() {
    const elements = document.querySelectorAll('[class*="scroll-trigger"]');
    elements.forEach((element) => {
      this.animateElement(element);
    });
  }

  resetAnimations() {
    this.animatedElements.clear();
    this.observeElements();
  }
}

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.SunriseAnimations = new SunriseAnimations();
});

// Re-initialize on section load
document.addEventListener('shopify:section:load', () => {
  if (window.SunriseAnimations) {
    window.SunriseAnimations.resetAnimations();
  }
});
