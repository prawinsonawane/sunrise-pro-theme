/**
 * Sunrise Pro - Contact Map Component
 * Handles map functionality and Google Maps integration
 */

class SunriseContactMap extends HTMLElement {
  constructor() {
    super();
    this.mapElement = this.querySelector('#ContactMap');
    this.mapAddress = this.dataset.address || '';
    this.mapHeight = this.dataset.height || '400';
    this.isLoaded = false;

    this.init();
  }

  init() {
    if (this.mapElement && this.mapAddress) {
      this.loadMap();
    }
  }

  async loadMap() {
    if (this.isLoaded) return;

    try {
      // Check if Google Maps is available
      if (typeof google === 'undefined') {
        console.log('Google Maps not loaded, using placeholder');
        return;
      }

      // Initialize the map
      const map = new google.maps.Map(this.mapElement, {
        zoom: 15,
        center: { lat: 0, lng: 0 }, // Will be updated after geocoding
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: this.getMapStyles()
      });

      // Geocode the address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: this.mapAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          
          // Update map center
          map.setCenter(location);
          
          // Add marker
          new google.maps.Marker({
            position: location,
            map: map,
            title: this.mapAddress
          });

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 1rem;">
                <h3 style="margin: 0 0 0.5rem 0; font-size: 1.6rem; font-weight: 600;">Our Location</h3>
                <p style="margin: 0; font-size: 1.4rem; color: #666;">${this.mapAddress}</p>
              </div>
            `
          });

          // Show info window on marker click
          const marker = new google.maps.Marker({
            position: location,
            map: map,
            title: this.mapAddress
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          this.isLoaded = true;
        } else {
          console.error('Geocoding failed:', status);
        }
      });

    } catch (error) {
      console.error('Map loading error:', error);
    }
  }

  getMapStyles() {
    return [
      {
        featureType: 'all',
        elementType: 'geometry',
        stylers: [
          {
            color: '#f5f5f5'
          }
        ]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [
          {
            color: '#c9c9c9'
          }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#757575'
          }
        ]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e5e5e5'
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
          {
            color: '#ffffff'
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#616161'
          }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [
          {
            color: '#dadada'
          }
        ]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e5e5e5'
          }
        ]
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [
          {
            color: '#eeeeee'
          }
        ]
      }
    ];
  }

  // Public method to reload map
  reload() {
    this.isLoaded = false;
    this.loadMap();
  }
}

customElements.define('sunrise-contact-map', SunriseContactMap);
