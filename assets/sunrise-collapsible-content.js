/**
 * Sunrise Pro - Collapsible Content Component
 * Handles accordion-style collapsible content functionality
 */

class SunriseCollapsibleContent extends HTMLElement {
  constructor() {
    super();
    this.details = this.querySelectorAll('details');
    this.allowMultiple = this.dataset.allowMultiple === 'true';
    this.animationDuration = 300;

    this.init();
  }

  init() {
    this.bindEvents();
    this.setupAccessibility();
  }

  bindEvents() {
    this.details.forEach((detail, index) => {
      detail.addEventListener('toggle', (e) => {
        this.handleToggle(e, index);
      });

      // Keyboard navigation
      const summary = detail.querySelector('summary');
      if (summary) {
        summary.addEventListener('keydown', (e) => {
          this.handleKeydown(e, index);
        });
      }
    });
  }

  setupAccessibility() {
    this.details.forEach((detail, index) => {
      const summary = detail.querySelector('summary');
      if (summary) {
        summary.setAttribute('role', 'button');
        summary.setAttribute('aria-expanded', detail.open ? 'true' : 'false');
        summary.setAttribute('aria-controls', `collapsible-content-${index}`);
        
        const content = detail.querySelector('.sunrise-collapsible-content__content');
        if (content) {
          content.setAttribute('id', `collapsible-content-${index}`);
          content.setAttribute('aria-labelledby', `collapsible-summary-${index}`);
        }
        
        summary.setAttribute('id', `collapsible-summary-${index}`);
      }
    });
  }

  handleToggle(event, index) {
    const detail = event.target;
    const summary = detail.querySelector('summary');
    const content = detail.querySelector('.sunrise-collapsible-content__content');
    
    // Update aria-expanded
    if (summary) {
      summary.setAttribute('aria-expanded', detail.open ? 'true' : 'false');
    }

    // Animate content
    if (content) {
      this.animateContent(content, detail.open);
    }

    // Close other details if not allowing multiple
    if (!this.allowMultiple && detail.open) {
      this.details.forEach((otherDetail, otherIndex) => {
        if (otherIndex !== index && otherDetail.open) {
          otherDetail.open = false;
          const otherSummary = otherDetail.querySelector('summary');
          if (otherSummary) {
            otherSummary.setAttribute('aria-expanded', 'false');
          }
        }
      });
    }
  }

  animateContent(content, isOpening) {
    if (isOpening) {
      // Opening animation
      content.style.height = '0px';
      content.style.overflow = 'hidden';
      content.style.transition = `height ${this.animationDuration}ms ease`;
      
      // Force reflow
      content.offsetHeight;
      
      // Set to auto height
      content.style.height = content.scrollHeight + 'px';
      
      // Clean up after animation
      setTimeout(() => {
        content.style.height = 'auto';
        content.style.overflow = '';
        content.style.transition = '';
      }, this.animationDuration);
    } else {
      // Closing animation
      content.style.height = content.scrollHeight + 'px';
      content.style.overflow = 'hidden';
      content.style.transition = `height ${this.animationDuration}ms ease`;
      
      // Force reflow
      content.offsetHeight;
      
      // Set to 0
      content.style.height = '0px';
      
      // Clean up after animation
      setTimeout(() => {
        content.style.height = '';
        content.style.overflow = '';
        content.style.transition = '';
      }, this.animationDuration);
    }
  }

  handleKeydown(event, index) {
    const key = event.key;
    const detail = this.details[index];
    
    switch (key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        detail.open = !detail.open;
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNext(index);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPrevious(index);
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirst();
        break;
      case 'End':
        event.preventDefault();
        this.focusLast();
        break;
    }
  }

  focusNext(currentIndex) {
    const nextIndex = (currentIndex + 1) % this.details.length;
    const nextSummary = this.details[nextIndex].querySelector('summary');
    if (nextSummary) {
      nextSummary.focus();
    }
  }

  focusPrevious(currentIndex) {
    const prevIndex = currentIndex === 0 ? this.details.length - 1 : currentIndex - 1;
    const prevSummary = this.details[prevIndex].querySelector('summary');
    if (prevSummary) {
      prevSummary.focus();
    }
  }

  focusFirst() {
    const firstSummary = this.details[0].querySelector('summary');
    if (firstSummary) {
      firstSummary.focus();
    }
  }

  focusLast() {
    const lastSummary = this.details[this.details.length - 1].querySelector('summary');
    if (lastSummary) {
      lastSummary.focus();
    }
  }

  // Public methods for external control
  open(index) {
    if (index >= 0 && index < this.details.length) {
      this.details[index].open = true;
    }
  }

  close(index) {
    if (index >= 0 && index < this.details.length) {
      this.details[index].open = false;
    }
  }

  toggle(index) {
    if (index >= 0 && index < this.details.length) {
      this.details[index].open = !this.details[index].open;
    }
  }

  openAll() {
    this.details.forEach(detail => {
      detail.open = true;
    });
  }

  closeAll() {
    this.details.forEach(detail => {
      detail.open = false;
    });
  }
}

customElements.define('sunrise-collapsible-content', SunriseCollapsibleContent);
