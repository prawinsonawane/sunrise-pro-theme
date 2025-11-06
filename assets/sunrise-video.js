/**
 * Sunrise Pro - Video Component
 * Handles video playback controls and interactions
 */

class SunriseVideoComponent extends HTMLElement {
  constructor() {
    super();
    this.video = this.querySelector('video');
    this.playPauseButton = this.querySelector('.sunrise-video__play-pause');
    this.playIcon = this.querySelector('.sunrise-video__play-icon');
    this.pauseIcon = this.querySelector('.sunrise-video__pause-icon');
    this.progressBar = this.querySelector('.sunrise-video__progress');
    this.progressFill = this.querySelector('.sunrise-video__progress-fill');
    this.currentTimeElement = this.querySelector('.sunrise-video__current-time');
    this.durationElement = this.querySelector('.sunrise-video__duration');
    this.isPlaying = false;
    this.isDragging = false;

    this.init();
  }

  init() {
    if (!this.video) return;

    this.bindEvents();
    this.updateDuration();
    this.updateProgress();
  }

  bindEvents() {
    // Play/Pause button
    if (this.playPauseButton) {
      this.playPauseButton.addEventListener('click', () => this.togglePlayPause());
    }

    // Video events
    this.video.addEventListener('play', () => this.onPlay());
    this.video.addEventListener('pause', () => this.onPause());
    this.video.addEventListener('timeupdate', () => this.updateProgress());
    this.video.addEventListener('loadedmetadata', () => this.updateDuration());
    this.video.addEventListener('ended', () => this.onEnded());

    // Progress bar
    if (this.progressBar) {
      this.progressBar.addEventListener('click', (e) => this.seekTo(e));
      this.progressBar.addEventListener('mousedown', (e) => this.startDragging(e));
      this.progressBar.addEventListener('mousemove', (e) => this.onDragging(e));
      this.progressBar.addEventListener('mouseup', () => this.stopDragging());
      this.progressBar.addEventListener('mouseleave', () => this.stopDragging());

      // Touch events for mobile
      this.progressBar.addEventListener('touchstart', (e) => this.startDragging(e));
      this.progressBar.addEventListener('touchmove', (e) => this.onDragging(e));
      this.progressBar.addEventListener('touchend', () => this.stopDragging());
    }

    // Keyboard controls
    this.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.seekRelative(-10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.seekRelative(10);
      }
    });

    // Click to play/pause on video
    this.video.addEventListener('click', () => this.togglePlayPause());
  }

  togglePlayPause() {
    if (this.video.paused) {
      this.video.play();
    } else {
      this.video.pause();
    }
  }

  onPlay() {
    this.isPlaying = true;
    this.updatePlayPauseButton();
  }

  onPause() {
    this.isPlaying = false;
    this.updatePlayPauseButton();
  }

  onEnded() {
    this.isPlaying = false;
    this.updatePlayPauseButton();
    this.progressFill.style.width = '0%';
  }

  updatePlayPauseButton() {
    if (!this.playPauseButton) return;

    if (this.isPlaying) {
      this.playIcon.classList.add('hidden');
      this.pauseIcon.classList.remove('hidden');
    } else {
      this.playIcon.classList.remove('hidden');
      this.pauseIcon.classList.add('hidden');
    }
  }

  updateProgress() {
    if (!this.progressFill || !this.currentTimeElement) return;

    const progress = (this.video.currentTime / this.video.duration) * 100;
    this.progressFill.style.width = `${progress}%`;
    this.currentTimeElement.textContent = this.formatTime(this.video.currentTime);
  }

  updateDuration() {
    if (!this.durationElement || !this.video.duration) return;
    this.durationElement.textContent = this.formatTime(this.video.duration);
  }

  seekTo(event) {
    if (!this.progressBar) return;

    const rect = this.progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * this.video.duration;

    this.video.currentTime = newTime;
  }

  seekRelative(seconds) {
    this.video.currentTime = Math.max(0, Math.min(this.video.duration, this.video.currentTime + seconds));
  }

  startDragging(event) {
    this.isDragging = true;
    this.onDragging(event);
  }

  onDragging(event) {
    if (!this.isDragging || !this.progressBar) return;

    const rect = this.progressBar.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    
    this.progressFill.style.width = `${percentage * 100}%`;
  }

  stopDragging() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    const percentage = parseFloat(this.progressFill.style.width) / 100;
    this.video.currentTime = percentage * this.video.duration;
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Public methods for external control
  play() {
    this.video.play();
  }

  pause() {
    this.video.pause();
  }

  getCurrentTime() {
    return this.video.currentTime;
  }

  getDuration() {
    return this.video.duration;
  }

  setCurrentTime(time) {
    this.video.currentTime = time;
  }
}

customElements.define('sunrise-video-component', SunriseVideoComponent);
