const bike = require("../../models/bike-booking");
const Partners = require("../../models/partners");
const { notifier } = require("../NearestPartnerNotifier/controller");
const {
	bikeServiceBookingSchema,
} = require("../Validators/service-booking/validators");

const Register_MSG = {
	signupSuccess: "You are successfully signed up for the servicing.",
	signupError: "Unable to submit the data. Please try again later!!",
	noService:
		"No service centers are present in your location! Once they are available we will reach out to you!!",
};


const book = async (req, res, next) => {
	try {
		const booking = await bikeServiceBookingSchema.validateAsync(req.body);
		const {
			bookingDetails: { city },
		} = booking;
		console.log(city);
		const dMaps = await Partners.find({ city: city }, { map: 1, phone: 1 });
		// console.log(dMaps);
		if (dMaps.length == 0) {
			return res.status(404).json({
				reason: "no-center",
				message: Register_MSG.noService,
				success: false,
			});
		}

		const distances = await notifier({ ...booking }, dMaps);
		// console.log(distances);
		const assigned = await Partners.findOne({ phone: distances[0].phone });
		// console.log(assigned);

		const newbooking = new bike({
			...booking,
			distances,
			assignedTo: distances[0].phone,
			partnerName: assigned.name,
		});

		await newbooking.save();

		return res.status(201).json({
			message: Register_MSG.signupSuccess,
			success: true,
		});
	} catch (err) {
		let errorMsg = Register_MSG.signupError;
		if (err.isJoi === true) {
			err.status = 403;
			errorMsg = err.message;
		} else if (err.isNotifier) {
			err.status = 500;
			errorMsg =
				"Unable to connect to notifier service!! Please try again later.";
		}
		console.log(err);
		return res.status(err.status).json({
			message: errorMsg,
			success: false,
		});
	}
};

const viewBooking = async (req, res, next) => {
	let bookings;
	try {
		bookings = await bike.find();
		if (bookings[0]) {
			return res.status(200).json({ data: { ...bookings }, success: "true" });
		} else {
			return res
				.status(404)
				.json({ success: "false", message: "No bookings found!!" });
		}
	} catch (e) {
		return res.status(e.status).json({
			message: "Unexpected Error",
			success: false,
		});
	}
};

const viewBookingUser = async (req, res, next) => {
	let email = req.email;
	let bookings;
	try {
		bookings = await bike.find({ email: email });
		if (bookings[0]) {
			return res.status(200).json({ data: { ...bookings }, success: "true" });
		} else {
			zs;
			return res
				.status(404)
				.json({ success: "false", message: "No bookings found!!" });
		}
	} catch (e) {
		return res.status(e.status).json({
			message: "Unexpected Error",
			success: false,
		});
	}
};

const viewBookingPartner = async (req, res, next) => {
	let partnerId = req.phone;
	let bookings;
	try {
		bookings = await bike.find({ assignedTo: partnerId });
		if (bookings[0]) {
			return res.status(200).json({ data: { ...bookings }, success: "true" });
		} else {
			return res
				.status(404)
				.json({ success: "true", message: "No bookings found!!" });
		}
	} catch (e) {
		return res.status(e.status || 500).json({
			message: "Unexpected Error",
			success: false,
		});
	}
};

const viewBookingPartnerByID = async (req, res, next) => {
	let partnerId = req.phone;
	const { id } = req.body;
	console.log(id);	
	if (!id) {
		return res.status(404).json({
			success: false,
			reason: "booking-id",
			message: "No Booking Id found!!",
		});
	}
	let bookings;
	try {
		bookings = await bike.findById(id);
		if (bookings) {
			return res.status(200).json({ data: { ...bookings._doc }, success: "true" });
		} else {
			return res
				.status(404)
				.json({ success: "true", message: "No bookings found!!" });
		}
	} catch (e) {
		console.log(e);
		return res.status(e.status || 500).json({
			message: "Unexpected Error",
			success: false,
		});
	}
};

const viewRecents = async (req, res, next) => {
	let partnerId = req.phone;
	console.log(partnerId);
	let bookings;
	const currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	const nextDate = new Date(currentDate);
	nextDate.setDate(currentDate.getDate() + 1);
	console.log(currentDate);
	console.log(nextDate);
	try {
		bookings = await bike.find({
			assignedTo: partnerId,
			createdAt: {
				$gte: currentDate,
				$lt: nextDate,
			},
		});
		console.log(bookings);
		if (bookings[0]) {
			return res.status(200).json({ data: { ...bookings }, success: "true" });
		} else {
			return res
				.status(404)
				.json({ success: "true", message: "No recents booking found" });
		}
	} catch (e) {
		return res
			.status(e.status || 500)
			.json({ message: "Unexpected Error", success: "false" });
	}
};

module.exports = {
	book,
	viewBooking,
	viewBookingUser,
	viewBookingPartner,
	viewRecents,
viewBookingPartnerByID,
};
