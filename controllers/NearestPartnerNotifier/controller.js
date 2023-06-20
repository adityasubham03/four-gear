const Partners = require("../../models/partners");
var axios = require("axios");

const notifier = async ({ map, city, phone }, dMaps) => {
	console.log(dMaps);
	const maps = await Partners.find({ city: city }, { map: 1, phone: 1 });
	if (dMaps.length == 1) {
		//something will happen
	} else {
		const destinations = dMaps.map((item) => {
			const { phone } = item;
			const { longitude, latitude } = item.map; // Include _id property from map
			return { phone: phone, lat: latitude, lng: longitude }; // Add _id property to destination
		});

		const origins = `${map.latitude},${map.longitude}`;
		const destinationsString = destinations
			.map((dest) => `${dest.lat},${dest.lng}`)
			.join("|");
		const apiKey = "AIzaSyCWeOpv-NQZ3O4CzWTuhXTSsTyNMC9dwTU";
		const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinationsString}&key=${apiKey}&units=imperial`;

		var config = {
			method: "get",
			url: url,
			headers: {},
		};

		let responses;

		try {
			const response = await axios(config);
			responses = response.data;
		} catch (error) {
			console.log(error);
		}

		let distances = [];

		if (responses && responses.rows && responses.rows.length > 0) {
			const destinationAddresses = responses.destination_addresses;
			const distanceElements = responses.rows[0].elements;

			distances = destinationAddresses.reduce((acc, address, index) => {
				const originalDestination = destinations[index];
				const destination = {
					phone: originalDestination.phone, // Include _id property
					lat: originalDestination.lat,
					lng: originalDestination.lng,
				};
				const distance = parseInt(distanceElements[index].distance.value);
				acc.push({ destination, distance });
				return acc;
			}, []);
		}

		distances.sort((a, b) => a.distance - b.distance);
		console.log(distances);
		console.log(
			"Shortest Distance Destination ID: " + distances[0].destination.phone
		); // Access the _id property
		console.log(
			"Largest Distance Destination ID: " +
				distances[distances.length - 1].destination.phone
		); // Access the _id property
	}
};

module.exports = {
	notifier,
};
