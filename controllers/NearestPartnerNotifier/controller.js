const Partners = require('../../models/partners');
const distance = require('google-distance-matrix');
distance.key('YOUR_API_KEY');
let destinations= [
    "Stockholm, Sweden",
    {
      "lat": 50.087,
      "lng": 14.421
    }
  ]


const notifier = async ({ map, city, phone }) => {
  console.log(map, city, phone);
  const maps = await Partners.find({ city: city }, { map: 1 });
  const destinations = maps.map((item) => {
    const { longitude, latitude } = item.map;
    return { lat: latitude, lng: longitude };
  });
  console.log(destinations);
  // Find the list of stores in a particular city and their cords

  // Run through the algo and get the minimum distance and allot it to that partner 
  
    distance.matrix(map, destinations, (err, distances) => {
        if (err) {
          console.log(err);
        } else {
          console.log(distances);
        }
    });
  
    const destinationsResponse = response.destinationAddresses;
    const distances = response.rows.flatMap(row => row.elements.map(element => element.distance.value));
    
    // Combine destinations and distances into an array of objects
    const destinationDistances = destinationsResponse.map((destination, index) => {
      return {
        destination,
        distance: distances[index]
      };
    });
    
    // Sort the array by distance in ascending order
    destinationDistances.sort((a, b) => a.distance - b.distance);
    
    // Get the smallest distance
    const smallestDistance = destinationDistances[0].distance;
    
    console.log("Destination Distances:", destinationDistances);
    console.log("Smallest Distance:", smallestDistance);
};

module.exports = {
    notifier,
}