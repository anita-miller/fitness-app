function openCache(id) {
  if ('geolocation' in navigator) {
    // Should start a loading bar or something here
    navigator.geolocation.getCurrentPosition(pos => {
      const user = { lat: pos.coords.latitude, lng: pos.coords.longitude, cache: id };
      let params = 'lat=' + user.lat + '&lng=' + user.lng + '&cacheID=' + user.cache;
      window.location.href = '../openCache?' + params;
      // Redirect to the open cache page
    }, res => {
      // Should display message to user here. This means we cant get location,
      // user should try again soon
      console.log('ERROR!');
    }, { timeout: 10000, enableHighAccuracy: true });
  } else {
    // CANT GET LOCAL POSITION AT ALL
    // Display to user that the app will not work in this device/with their settings
  }
}
