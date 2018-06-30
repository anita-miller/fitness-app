function centerMap(map) {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(pos => {
      // Success!
      map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }, res => {
      // Error! Display message to user here
      console.log('ERROR!');
    }, { timeout: 10000 });
  } else {
    // CANT GET LOCAL POSITION
  }
}

function initMap(caches) {
  const MELBOURNE = { lat: -37.8136, lng: 144.9631 };

  // Initialize the google map
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: MELBOURNE,
    streetViewControl: false

  });
  // For each cache, add a marker
  caches.forEach(cache => {
    const marker = new google.maps.Marker({
      position: cache.location,
      map: map
    });
    marker.addListener('click', () => {
      if (map.getCenter().equals(marker.getPosition())) {
        // Already centered. Do new stuff here
        window.location.href = '../cache?cacheID=' + cache.id;
      } else {
        // Need better bounds here
        map.setZoom(16);
        map.setCenter(marker.getPosition());
      }
    });
  });
  // Create the searchbox and link it to the input tag
  const searchBox = new google.maps.places.SearchBox(document.getElementById('locationSearchBar'));

  // Bias the results towards the maps current viewport
  map.addListener('bounds_changed', () => {
    searchBox.setBounds(map.getBounds());
  });

  // Typing in box
  searchBox.addListener('places_changed', () => {
    let places = searchBox.getPlaces();
    let bounds = new google.maps.LatLngBounds();
    if (places.length === 0) {
      return;
    }
    places.forEach(place => {
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

  document.getElementById('centerLocation').onclick = function center() {
    centerMap(map);
  };
}
