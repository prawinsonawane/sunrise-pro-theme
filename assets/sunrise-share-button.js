/**
 * Sunrise Pro - Share Button Component
 * Handles social sharing functionality
 */

class SunriseShareButton extends HTMLElement {
  constructor() {
    super();
    this.trigger = this.querySelector('.sunrise-share-button__trigger');
    this.dropdown = this.querySelector('.sunrise-share-button__dropdown');
    this.closeButton = this.querySelector('.sunrise-share-button__close');
    this.copyButton = this.querySelector('.sunrise-share-button__link--copy');
    this.isOpen = false;

    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Toggle dropdown
    if (this.trigger) {
      this.trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleDropdown();
      });
    }

    // Close dropdown
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => {
        this.closeDropdown();
      });
    }

    // Copy link functionality
    if (this.copyButton) {
      this.copyButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.copyLink();
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target) && this.isOpen) {
        this.closeDropdown();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeDropdown();
      }
    });
  }

  toggleDropdown() {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    this.isOpen = true;
    this.dropdown.classList.remove('hidden');
    this.trigger.setAttribute('aria-expanded', 'true');
    
    // Focus first interactive element
    const firstButton = this.dropdown.querySelector('button, a');
    if (firstButton) {
      firstButton.focus();
    }
  }

  closeDropdown() {
    this.isOpen = false;
    this.dropdown.classList.add('hidden');
    this.trigger.setAttribute('aria-expanded', 'false');
    
    // Return focus to trigger
    this.trigger.focus();
  }

  async copyLink() {
    const url = this.copyButton.dataset.shareUrl;
    
    try {
      await navigator.clipboard.writeText(url);
      this.showCopySuccess();
    } catch (err) {
      // Fallback for older browsers
      this.fallbackCopyTextToClipboard(url);
    }
  }

  fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showCopySuccess();
    } catch (err) {
      console.error('Fallback: Could not copy text: ', err);
    }
    
    document.body.removeChild(textArea);
  }

  showCopySuccess() {
    const originalText = this.copyButton.querySelector('.sunrise-share-button__link-text').textContent;
    const successText = 'Copied!';
    
    this.copyButton.querySelector('.sunrise-share-button__link-text').textContent = successText;
    this.copyButton.classList.add('sunrise-share-button__link--success');
    
    setTimeout(() => {
      this.copyButton.querySelector('.sunrise-share-button__link-text').textContent = originalText;
      this.copyButton.classList.remove('sunrise-share-button__link--success');
    }, 2000);
  }
}

customElements.define('sunrise-share-button', SunriseShareButton);
